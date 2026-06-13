import { create } from 'zustand';
import type { Chef, ChefOrder } from '../types';
import { db } from '../../firebase/config';
import { doc, getDoc, getDocs, collection, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useInventoryStore } from '../../admin/store/useInventoryStore';

interface ChefState {
  activeChef: Chef | null;
  chefs: Chef[];
  chefsLoaded: boolean;
  orders: ChefOrder[];
  assignedBuffer?: Record<string, number>;
  login: (chefId: string, pin: string) => Promise<boolean>;
  logout: () => void;
  addNewOrder: (items: { name: string; quantity: number }[], tableNumber: number, prepTimeMins: number, price?: number, paymentMethod?: string, paymentStatus?: 'Unpaid' | 'Paid') => Promise<string>;
  startPreparing: (orderId: string) => Promise<void>;
  markReady: (orderId: string) => Promise<void>;
  markCompleted: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getChefActiveLoad: (chefId: string) => number;
  listenToChefs: () => (() => void);
  listenToOrders: () => (() => void);
  tickOrdersAndBreaks: () => Promise<void>;
  startTicking: () => void;
  stopTicking: () => void;
}


let tickInterval: any = null;

export const useChefStore = create<ChefState>((set, get) => ({
  activeChef: (() => {
    try {
      const saved = localStorage.getItem('activeChef');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  chefs: [],
  chefsLoaded: false,
  orders: [],
  assignedBuffer: {},

  login: async (chefId, pin) => {
    try {
      const chefDoc = await getDoc(doc(db, 'chefs', chefId));
      if (chefDoc.exists()) {
        const chefData = chefDoc.data() as Chef;
        if (chefData.pin === pin) {
          localStorage.setItem('activeChef', JSON.stringify(chefData));
          set({ activeChef: chefData });
          return true;
        }
      }
    } catch (error) {
      console.error("Error in chef login:", error);
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('activeChef');
    set({ activeChef: null });
  },

  getChefActiveLoad: (chefId) => {
    return get().orders.filter(o => 
      o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
    ).length;
  },

  addNewOrder: async (items, tableNumber, prepTimeMins, price, paymentMethod, paymentStatus) => {
    const state = get();
    const newOrderId = `O${Math.floor(Math.random() * 900) + 100}`;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // --- SMART ROUTING BASED ON CHEF AVAILABILITY TIME ---
    const now = Date.now();
    const currentBuffer = state.assignedBuffer || {};
    
    let chefsList = state.chefs;
    if (chefsList.length === 0) {
      try {
        const chefsCol = collection(db, 'chefs');
        const snapshot = await getDocs(chefsCol);
        const itemsList: Chef[] = [];
        snapshot.forEach((doc) => {
          itemsList.push(doc.data() as Chef);
        });
        itemsList.sort((a, b) => a.id.localeCompare(b.id));
        chefsList = itemsList;
        set({ chefs: itemsList, chefsLoaded: true });
      } catch (error) {
        console.error("Error loading chefs in addNewOrder fallback:", error);
      }
    }
    
    const chefAvailabilityTimes = chefsList.map(chef => {
      const chefOrders = state.orders.filter(o => o.assignedChefId === chef.id && (o.status === 'New' || o.status === 'Preparing'));
      const bufferCount = currentBuffer[chef.id] || 0;
      
      // If chef has no active orders in DB and no active buffer
      if (chefOrders.length === 0 && bufferCount === 0) {
        // If they are on break, they are available after break completes
        const breakTime = chef.breakUntil || 0;
        return { id: chef.id, availableAt: Math.max(now, breakTime) };
      }
      
      // If they have active orders, calculate total preparation queue time
      const preparingOrder = chefOrders.find(o => o.status === 'Preparing');
      const activePrepEndTime = preparingOrder?.completedAt || now;
      
      const newOrdersQueueTime = chefOrders
        .filter(o => o.status === 'New')
        .reduce((sum, o) => sum + (o.prepTimeMins * 60 * 1000), 0);
      
      // Buffered queue time
      const bufferQueueTime = bufferCount * (prepTimeMins * 60 * 1000);
        
      // Availability = preparation end time + queue time + buffer time + 2 mins break
      const totalPrepEndTime = Math.max(now, activePrepEndTime) + newOrdersQueueTime + bufferQueueTime;
      const finalAvailableAt = totalPrepEndTime + (2 * 60 * 1000); // 2 min break
      
      return { id: chef.id, availableAt: finalAvailableAt };
    });

    // Sort chefs by availability time (earliest first)
    chefAvailabilityTimes.sort((a, b) => a.availableAt - b.availableAt);
    const assignedChefId = chefAvailabilityTimes.length > 0 ? chefAvailabilityTimes[0].id : 'C1';

    // Increment local buffer for this chef to prevent immediate collision
    const updatedBuffer = { ...currentBuffer, [assignedChefId]: (currentBuffer[assignedChefId] || 0) + 1 };
    set({ assignedBuffer: updatedBuffer });

    const newOrder: ChefOrder = {
      id: newOrderId,
      tableNumber,
      items,
      prepTimeMins,
      status: 'New',
      assignedChefId,
      timeReceived: timeNow,
      createdAt: now,
      startedPreparingAt: null,
      completedAt: null,
      price: price || (prepTimeMins * 3.5 + 10.0),
      paymentMethod: paymentMethod || 'later',
      paymentStatus: paymentStatus || 'Unpaid'
    };

    try {
      // Write order to Firestore
      await setDoc(doc(db, 'orders', newOrderId), newOrder);
      
      // Update chef workload in Firestore
      const activeLoadCount = state.orders.filter(o => 
        o.assignedChefId === assignedChefId && (o.status === 'New' || o.status === 'Preparing')
      ).length + 1;
      
      await updateDoc(doc(db, 'chefs', assignedChefId), {
        activeLoad: activeLoadCount
      });

      // Auto-deduct ingredients mapping
      try {
        const { deductIngredientsForOrder } = useInventoryStore.getState();
        if (deductIngredientsForOrder) {
          await deductIngredientsForOrder(items);
        }
      } catch (deductErr) {
        console.error("Failed to deduct ingredients for order:", deductErr);
      }
    } catch (e) {
      console.error("Error creating new order in Firestore:", e);
    }
    return newOrderId;
  },

  startPreparing: async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data() as ChefOrder;
        const completedAt = Date.now() + (orderData.prepTimeMins * 60 * 1000);
        
        await updateDoc(orderRef, {
          status: 'Preparing',
          startedPreparingAt: Date.now(),
          completedAt
        });
      }
    } catch (e) {
      console.error("Error starting preparation:", e);
    }
  },

  markReady: async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data() as ChefOrder;
        const chefId = orderData.assignedChefId;
        
        // Update order status to Ready
        await updateDoc(orderRef, { status: 'Ready' });

        // Write a single notification to Firestore for the waiter to receive
        const notiId = `N_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newNoti = {
          id: notiId,
          type: 'table_ready',
          message: `Table ${orderData.tableNumber}: Order ${orderData.id} is ready for collection! 🍽️`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
        await setDoc(doc(db, 'notifications', notiId), newNoti);

        // Put chef on a 2-minute break and update stats
        const chefRef = doc(db, 'chefs', chefId);
        const chefDoc = await getDoc(chefRef);
        if (chefDoc.exists()) {
          const chefData = chefDoc.data() as Chef;
          const newPreparedCount = (chefData.ordersPrepared || 0) + 1;
          const activeLoadCount = get().orders.filter(o => 
            o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
          ).length;

          await updateDoc(chefRef, {
            breakUntil: Date.now() + (2 * 60 * 1000), // 2 min break
            ordersPrepared: newPreparedCount,
            activeLoad: activeLoadCount
          });
        }
      }
    } catch (e) {
      console.error("Error marking order ready:", e);
    }
  },

  markCompleted: async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data() as ChefOrder;
        await updateDoc(orderRef, { status: 'Completed' });
        
        // Update active load count for chef
        const chefId = orderData.assignedChefId;
        const activeLoadCount = get().orders.filter(o => 
          o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
        ).length;
        
        await updateDoc(doc(db, 'chefs', chefId), {
          activeLoad: activeLoadCount
        });
      }
    } catch (e) {
      console.error("Error completing order:", e);
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data() as ChefOrder;
        await updateDoc(orderRef, { status: 'Cancelled' });
        
        // Update active load count for chef
        const chefId = orderData.assignedChefId;
        const activeLoadCount = get().orders.filter(o => 
          o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
        ).length;
        
        await updateDoc(doc(db, 'chefs', chefId), {
          activeLoad: activeLoadCount
        });
      }
    } catch (e) {
      console.error("Error cancelling order:", e);
    }
  },

  deleteOrder: async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (e) {
      console.error("Error deleting order:", e);
    }
  },


  listenToChefs: () => {
    const chefsCol = collection(db, 'chefs');
    return onSnapshot(chefsCol, (snapshot) => {
      const items: Chef[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Chef);
      });
      items.sort((a, b) => a.id.localeCompare(b.id));
      
      const currentChef = get().activeChef;
      let updatedChef = currentChef;
      if (currentChef) {
        const found = items.find(c => c.id === currentChef.id);
        if (found) {
          updatedChef = found;
        }
      }
      set({ chefs: items, activeChef: updatedChef, chefsLoaded: true });
      get().tickOrdersAndBreaks();
    });
  },

  listenToOrders: () => {
    const ordersCol = collection(db, 'orders');
    return onSnapshot(ordersCol, (snapshot) => {
      const items: ChefOrder[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          ...(data as ChefOrder),
          id: data.id || doc.id
        });
      });
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      // Clear local buffer when we receive a fresh Firestore sync
      set({ orders: items, assignedBuffer: {} });
      get().tickOrdersAndBreaks();
    });
  },

  tickOrdersAndBreaks: async () => {
    const state = get();
    const now = Date.now();

    // 1. Auto-complete preparing orders that exceeded completedAt
    const preparingOrders = state.orders.filter(o => o.status === 'Preparing');
    for (const order of preparingOrders) {
      if (order.completedAt && now >= order.completedAt) {
        console.log(`Auto-completing order ${order.id} to Ready`);
        await state.markReady(order.id);
      }
    }

    // 2. Auto-start pending orders for chefs whose break ended
    for (const chef of state.chefs) {
      const chefOrders = state.orders.filter(o => o.assignedChefId === chef.id);
      const hasPreparing = chefOrders.some(o => o.status === 'Preparing');
      const onBreak = chef.breakUntil && now < chef.breakUntil;

      // If the chef has no preparing order and is not on break, check if there is a pending order in their queue
      if (!hasPreparing && !onBreak) {
        const pendingOrders = chefOrders.filter(o => o.status === 'New');
        if (pendingOrders.length > 0) {
          // Sort by createdAt ascending (oldest first)
          pendingOrders.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          const nextOrder = pendingOrders[0];
          console.log(`Auto-starting order ${nextOrder.id} for chef ${chef.name}`);
          await state.startPreparing(nextOrder.id);
        }
      }
    }
  },

  startTicking: () => {
    if (tickInterval) return;
    tickInterval = setInterval(() => {
      get().tickOrdersAndBreaks();
    }, 1000);
  },

  stopTicking: () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  }
}));
