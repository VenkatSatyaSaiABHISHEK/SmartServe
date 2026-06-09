import { create } from 'zustand';
import type { Waiter, WaiterOrder, ActiveTable, WaiterNotification } from '../types';

interface WaiterState {
  waiter: Waiter | null;
  orders: WaiterOrder[];
  tables: ActiveTable[];
  notifications: WaiterNotification[];
  login: (credentials: { pin: string }) => boolean;
  logout: () => void;
  toggleOnlineStatus: () => void;
  addTip: (amount: number) => void;
  updateOrderStatus: (orderId: string, status: WaiterOrder['status']) => void;
  updateTableStatus: (tableId: string, status: ActiveTable['status']) => void;
  addNotification: (notification: Omit<WaiterNotification, 'id' | 'time' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadNotificationsCount: () => number;
}

const MOCK_WAITER: Waiter = {
  id: 'W1',
  name: 'John Doe',
  email: 'john.doe@restaurant.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  onlineStatus: true,
  rating: 4.9,
  totalDeliveries: 124,
  todayTips: 42.50,
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

const MOCK_ORDERS: WaiterOrder[] = [
  {
    id: 'O101',
    tableId: '4',
    items: [
      { name: 'Truffle Mushroom Risotto', quantity: 1 },
      { name: 'Artisan Burrata', quantity: 1 }
    ],
    price: 41.49,
    status: 'Ready', // Ready for collection
    timeOrdered: '10:15 PM',
  },
  {
    id: 'O102',
    tableId: '9',
    items: [
      { name: 'Wagyu Beef Burger', quantity: 2 },
      { name: 'Matcha Lava Cake', quantity: 1 }
    ],
    price: 71.99,
    status: 'Preparing',
    timeOrdered: '10:25 PM',
  },
  {
    id: 'O103',
    tableId: '3',
    items: [
      { name: 'Salmon Tartare', quantity: 1 }
    ],
    price: 18.00,
    status: 'Delivered',
    timeOrdered: '09:45 PM',
  }
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
  orders: MOCK_ORDERS,
  tables: MOCK_TABLES,
  notifications: MOCK_NOTIFICATIONS,
  
  login: (credentials) => {
    if (credentials.pin === '1234') {
      set({ waiter: MOCK_WAITER });
      return true;
    }
    return false;
  },

  logout: () => set({ waiter: null }),

  toggleOnlineStatus: () => set((state) => {
    if (!state.waiter) return {};
    return {
      waiter: {
        ...state.waiter,
        onlineStatus: !state.waiter.onlineStatus
      }
    };
  }),

  addTip: (amount) => set((state) => {
    if (!state.waiter) return {};
    return {
      waiter: {
        ...state.waiter,
        todayTips: state.waiter.todayTips + amount
      }
    };
  }),

  updateOrderStatus: (orderId, status) => set((state) => {
    // If order becomes delivered, increase delivery count and add simulated tip
    const isNowDelivered = status === 'Delivered';
    const currentOrder = state.orders.find(o => o.id === orderId);
    const wasAlreadyDelivered = currentOrder?.status === 'Delivered';
    
    let tipAmount = 0;
    let deliveryIncrement = 0;
    
    if (isNowDelivered && !wasAlreadyDelivered && currentOrder) {
      tipAmount = Math.round(currentOrder.price * 0.1); // 10% tip simulation
      deliveryIncrement = 1;
    }

    return {
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
      waiter: state.waiter ? {
        ...state.waiter,
        totalDeliveries: state.waiter.totalDeliveries + deliveryIncrement,
        todayTips: state.waiter.todayTips + tipAmount
      } : null
    };
  }),

  updateTableStatus: (tableId, status) => set((state) => ({
    tables: state.tables.map((table) =>
      table.id === tableId || `T${table.number}` === tableId || table.number.toString() === tableId
        ? { ...table, status }
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
  }
}));
