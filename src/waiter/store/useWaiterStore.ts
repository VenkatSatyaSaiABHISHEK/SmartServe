import { create } from 'zustand';
import type { Waiter, WaiterOrder, ActiveTable, WaiterNotification } from '../types';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

interface WaiterState {
  waiter: Waiter | null;
  waiters: Waiter[];
  orders: WaiterOrder[];
  tables: ActiveTable[];
  notifications: WaiterNotification[];
  login: (id: string, pin: string) => Promise<boolean>;
  logout: () => void;
  toggleOnlineStatus: () => void;
  addTip: (amount: number) => void;
  updateOrderStatus: (orderId: string, status: WaiterOrder['status']) => Promise<void>;
  updateTableStatus: (tableId: string, status: ActiveTable['status']) => void;
  assignTable: (tableId: string, waiterId: string) => void;
  unassignTable: (tableId: string) => void;
  clearTable: (tableId: string) => void;
  addNotification: (notification: Omit<WaiterNotification, 'id' | 'time' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadNotificationsCount: () => number;
  listenToWaiters: () => (() => void);
  listenToOrders: () => (() => void);
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

const MOCK_TABLES: ActiveTable[] = [
  { id: 'T1', number: 1, capacity: 2, status: 'idle' },
  { id: 'T2', number: 2, capacity: 4, status: 'ordering' },
  { id: 'T3', number: 3, capacity: 4, status: 'occupied' },
  { id: 'T4', number: 4, capacity: 6, status: 'waiting' },
  { id: 'T5', number: 5, capacity: 2, status: 'billing' },
  { id: 'T6', number: 6, capacity: 4, status: 'idle' },
  { id: 'T7', number: 7, capacity: 4, status: 'billing' },
  { id: 'T8', number: 8, capacity: 2, status: 'ordering' },
  { id: 'T9', number: 9, capacity: 8, status: 'waiting' },
  { id: 'T10', number: 10, capacity: 4, status: 'occupied' },
  { id: 'T11', number: 11, capacity: 6, status: 'idle' },
  { id: 'T12', number: 12, capacity: 2, status: 'idle' },
];

const MOCK_NOTIFICATIONS: WaiterNotification[] = [
  {
    id: 'N1',
    type: 'table_ready',
    message: 'Table 4 order is ready in the kitchen 🍽️',
    time: '10:35 PM',
    read: false,
  },
  {
    id: 'N2',
    type: 'billing_request',
    message: 'Table 5 requested the bill 💳',
    time: '10:41 PM',
    read: false,
  },
  {
    id: 'N3',
    type: 'call_waiter',
    message: 'Table 7 is calling a waiter 🔔',
    time: '10:28 PM',
    read: true,
  }
];

export const useWaiterStore = create<WaiterState>((set, get) => ({
  waiter: null,
  waiters: [],
  orders: [],
  tables: MOCK_TABLES,
  notifications: MOCK_NOTIFICATIONS,
  
  login: async (id, pin) => {
    try {
      const waiterDoc = await getDoc(doc(db, 'waiters', id));
      if (waiterDoc.exists()) {
        const waiterData = waiterDoc.data() as Waiter;
        if (waiterData.pin === pin) {
          set({ waiter: { ...waiterData, onlineStatus: true, status: 'Active' } });
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
    const waiter = get().waiter;
    if (waiter) {
      try {
        await updateDoc(doc(db, 'waiters', waiter.id), { 
          status: 'Offline',
          onlineStatus: false 
        });
      } catch (error) {
        console.error("Error setting waiter offline on logout:", error);
      }
    }
    set({ waiter: null });
  },

  toggleOnlineStatus: async () => {
    const waiter = get().waiter;
    if (!waiter) return;
    const nextOnline = !waiter.onlineStatus;
    const nextStatus = nextOnline ? 'Active' : 'Offline';
    try {
      await updateDoc(doc(db, 'waiters', waiter.id), {
        onlineStatus: nextOnline,
        status: nextStatus
      });
      set({ 
        waiter: { 
          ...waiter, 
          onlineStatus: nextOnline,
          status: nextStatus 
        } 
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
      set({ waiter: { ...waiter, todayTips: nextTips } });
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
        set({
          waiter: {
            ...waiter,
            totalDeliveries: nextDeliveries,
            todayTips: nextTips
          }
        });
      } catch (error) {
        console.error("Error updating waiter stats:", error);
      }
    }
  },

  updateTableStatus: (tableId, status) => set((state) => ({
    tables: state.tables.map((table) =>
      table.id === tableId || `T${table.number}` === tableId || table.number.toString() === tableId
        ? { ...table, status }
        : table
    )
  })),

  assignTable: (tableId, waiterId) => set((state) => ({
    tables: state.tables.map((table) =>
      table.id === tableId || `T${table.number}` === tableId || table.number.toString() === tableId
        ? { ...table, assignedWaiterId: waiterId, status: 'occupied' as const }
        : table
    )
  })),

  unassignTable: (tableId) => set((state) => ({
    tables: state.tables.map((table) =>
      table.id === tableId || `T${table.number}` === tableId || table.number.toString() === tableId
        ? { ...table, assignedWaiterId: undefined }
        : table
    )
  })),

  clearTable: (tableId) => set((state) => ({
    tables: state.tables.map((table) =>
      table.id === tableId || `T${table.number}` === tableId || table.number.toString() === tableId
        ? { ...table, assignedWaiterId: undefined, status: 'idle' as const }
        : table
    )
  })),

  addNotification: (noti) => set((state) => {
    const newNoti: WaiterNotification = {
      ...noti,
      id: `N${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    return {
      notifications: [newNoti, ...state.notifications]
    };
  }),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),

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
      set({ waiters: items, waiter: updatedWaiter });
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
  }
}));
