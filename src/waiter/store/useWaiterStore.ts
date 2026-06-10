import { create } from 'zustand';
import type { Waiter, WaiterOrder, ActiveTable, WaiterNotification } from '../types';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';

interface WaiterState {
  waiter: Waiter | null;
  waiters: Waiter[];
  waitersLoaded: boolean;
  orders: WaiterOrder[];
  tables: ActiveTable[];
  notifications: WaiterNotification[];
  login: (id: string, pin: string) => Promise<boolean>;
  logout: () => void;
  toggleOnlineStatus: () => void;
  addTip: (amount: number) => void;
  updateOrderStatus: (orderId: string, status: WaiterOrder['status']) => Promise<void>;
  updateTableStatus: (tableId: string, status: ActiveTable['status']) => Promise<void>;
  assignTable: (tableId: string, waiterId: string) => Promise<void>;
  unassignTable: (tableId: string) => Promise<void>;
  clearTable: (tableId: string) => Promise<void>;
  addNotification: (notification: Omit<WaiterNotification, 'id' | 'time' | 'read'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getUnreadNotificationsCount: () => number;
  listenToWaiters: () => (() => void);
  listenToOrders: () => (() => void);
  listenToTables: () => (() => void);
  listenToNotifications: () => (() => void);
}

const playChimeSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    // Play double beep chime: C5 note then G5 note
    playNote(523.25, now, 0.15);      
    playNote(783.99, now + 0.12, 0.35); 
  } catch (error) {
    console.error("Web Audio API failed to play ready chime:", error);
  }
};

export const useWaiterStore = create<WaiterState>((set, get) => ({
  waiter: (() => {
    try {
      const saved = localStorage.getItem('activeWaiter');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  waiters: [],
  waitersLoaded: false,
  orders: [],
  tables: [],
  notifications: [],
  
  login: async (id, pin) => {
    try {
      const waiterDoc = await getDoc(doc(db, 'waiters', id));
      if (waiterDoc.exists()) {
        const waiterData = waiterDoc.data() as Waiter;
        if (waiterData.pin === pin) {
          const loggedWaiter = { ...waiterData, onlineStatus: true, status: 'Active' as const };
          localStorage.setItem('activeWaiter', JSON.stringify(loggedWaiter));
          set({ waiter: loggedWaiter });
          await updateDoc(doc(db, 'waiters', id), { 
            status: 'Active',
            onlineStatus: true 
          });
          return true;
        }
      }
    } catch (error) {
      console.error("Error in waiter login:", error);
    }
    return false;
  },

  logout: async () => {
    localStorage.removeItem('activeWaiter');
    set({ waiter: null });
  },

  toggleOnlineStatus: async () => {
    const waiter = get().waiter;
    if (!waiter) return;
    const nextOnline = !waiter.onlineStatus;
    const nextStatus = nextOnline ? 'Active' as const : 'Offline' as const;
    try {
      await updateDoc(doc(db, 'waiters', waiter.id), {
        onlineStatus: nextOnline,
        status: nextStatus
      });
      const nextWaiter = { 
        ...waiter, 
        onlineStatus: nextOnline,
        status: nextStatus 
      };
      localStorage.setItem('activeWaiter', JSON.stringify(nextWaiter));
      set({ 
        waiter: nextWaiter 
      });
    } catch (error) {
      console.error("Error toggling waiter online status:", error);
    }
  },

  addTip: async (amount) => {
    const waiter = get().waiter;
    if (!waiter) return;
    const nextTips = waiter.todayTips + amount;
    try {
      await updateDoc(doc(db, 'waiters', waiter.id), { todayTips: nextTips });
      const nextWaiter = { ...waiter, todayTips: nextTips };
      localStorage.setItem('activeWaiter', JSON.stringify(nextWaiter));
      set({ waiter: nextWaiter });
    } catch (error) {
      console.error("Error adding waiter tip:", error);
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const isNowDelivered = status === 'Delivered';
    const currentOrder = get().orders.find(o => o.id === orderId);
    const wasAlreadyDelivered = currentOrder?.status === 'Delivered';
    
    let tipAmount = 0;
    let deliveryIncrement = 0;
    
    if (isNowDelivered && !wasAlreadyDelivered && currentOrder) {
      tipAmount = Math.round(currentOrder.price * 0.1);
      deliveryIncrement = 1;
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      console.error("Error updating order status in Firestore:", error);
    }

    const waiter = get().waiter;
    if (waiter && (tipAmount > 0 || deliveryIncrement > 0)) {
      try {
        const nextDeliveries = waiter.totalDeliveries + deliveryIncrement;
        const nextTips = waiter.todayTips + tipAmount;
        await updateDoc(doc(db, 'waiters', waiter.id), {
          totalDeliveries: nextDeliveries,
          todayTips: nextTips
        });
        const nextWaiter = {
          ...waiter,
          totalDeliveries: nextDeliveries,
          todayTips: nextTips
        };
        localStorage.setItem('activeWaiter', JSON.stringify(nextWaiter));
        set({
          waiter: nextWaiter
        });
      } catch (error) {
        console.error("Error updating waiter stats:", error);
      }
    }
  },

  updateTableStatus: async (tableId, status) => {
    const cleanId = tableId.startsWith('T') ? tableId : `T${tableId}`;
    try {
      await updateDoc(doc(db, 'tables', cleanId), { status });
    } catch (error) {
      console.error("Error updating table status:", error);
    }
  },

  assignTable: async (tableId, waiterId) => {
    const cleanId = tableId.startsWith('T') ? tableId : `T${tableId}`;
    try {
      await updateDoc(doc(db, 'tables', cleanId), { 
        assignedWaiterId: waiterId, 
        status: 'occupied' 
      });
    } catch (error) {
      console.error("Error assigning table:", error);
    }
  },

  unassignTable: async (tableId) => {
    const cleanId = tableId.startsWith('T') ? tableId : `T${tableId}`;
    try {
      await updateDoc(doc(db, 'tables', cleanId), { 
        assignedWaiterId: "" 
      });
    } catch (error) {
      console.error("Error unassigning table:", error);
    }
  },

  clearTable: async (tableId) => {
    const cleanId = tableId.startsWith('T') ? tableId : `T${tableId}`;
    try {
      await updateDoc(doc(db, 'tables', cleanId), { 
        assignedWaiterId: "", 
        status: 'idle' 
      });
    } catch (error) {
      console.error("Error clearing table:", error);
    }
  },

  addNotification: async (noti) => {
    const id = `N_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newNoti: WaiterNotification = {
      ...noti,
      id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    try {
      await setDoc(doc(db, 'notifications', id), newNoti);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  },

  markNotificationRead: async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  },

  markAllNotificationsRead: async () => {
    const unread = get().notifications.filter(n => !n.read);
    for (const n of unread) {
      try {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      } catch (error) {
        console.error("Error marking notification read:", error);
      }
    }
  },

  getUnreadNotificationsCount: () => {
    const state = get();
    return state.notifications.filter((n) => !n.read).length;
  },

  listenToWaiters: () => {
    const waitersCol = collection(db, 'waiters');
    return onSnapshot(waitersCol, (snapshot) => {
      const items: Waiter[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Waiter);
      });
      items.sort((a, b) => a.id.localeCompare(b.id));
      
      const currentWaiter = get().waiter;
      let updatedWaiter = currentWaiter;
      if (currentWaiter) {
        const found = items.find(w => w.id === currentWaiter.id);
        if (found) {
          updatedWaiter = found;
        }
      }
      set({ waiters: items, waiter: updatedWaiter, waitersLoaded: true });
    });
  },

  listenToOrders: () => {
    const ordersCol = collection(db, 'orders');
    return onSnapshot(ordersCol, (snapshot) => {
      const items: WaiterOrder[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: data.id,
          tableId: String(data.tableNumber),
          items: data.items,
          price: data.price || (data.prepTimeMins * 3.5 + 10.0),
          status: data.status,
          timeOrdered: data.timeReceived,
          createdAt: data.createdAt
        });
      });
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      // Trigger automatic notification and play chime when order transitions to 'Ready'
      const prevOrders = get().orders;
      if (prevOrders.length > 0) {
        items.forEach((order) => {
          const prevOrder = prevOrders.find(o => o.id === order.id);
          if (order.status === 'Ready' && prevOrder && prevOrder.status !== 'Ready') {
            get().addNotification({
              type: 'table_ready',
              message: `Table ${order.tableId}: Order ${order.id} is ready for collection! 🍽️`
            });
            playChimeSound();
          }
        });
      }

      set({ orders: items });
    });
  },

  listenToTables: () => {
    const tablesCol = collection(db, 'tables');
    return onSnapshot(tablesCol, (snapshot) => {
      const items: ActiveTable[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: data.id,
          number: data.number,
          capacity: data.capacity,
          status: data.status,
          assignedWaiterId: data.assignedWaiterId || undefined
        });
      });
      items.sort((a, b) => a.number - b.number);
      set({ tables: items });
    });
  },

  listenToNotifications: () => {
    const notificationsCol = collection(db, 'notifications');
    return onSnapshot(notificationsCol, (snapshot) => {
      const items: WaiterNotification[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as WaiterNotification);
      });
      items.sort((a, b) => {
        if (a.read === b.read) return 0;
        return a.read ? 1 : -1;
      });
      set({ notifications: items });
    });
  }
}));
