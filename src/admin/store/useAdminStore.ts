import { create } from 'zustand';
import type { Reservation, CCTVCamera, AdminNotification } from '../types';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Waiter } from '../../waiter/types';
import type { Chef } from '../../chef/types';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  type: 'veg' | 'non-veg';
  available: boolean;
  prepTime: number; // preparation time in minutes
}

interface AdminState {
  isAdminLoggedIn: boolean;
  menuItems: MenuItem[];
  reservations: Reservation[];
  cameras: CCTVCamera[];
  notifications: AdminNotification[];
  taxRate: number;
  currency: string;
  waiters: Waiter[];
  chefs: Chef[];
  
  // Auth actions
  login: () => void;
  logout: () => void;
  
  // Menu actions
  addMenuItem: (item: Omit<MenuItem, 'id' | 'available'>) => void;
  updateMenuItem: (id: string, updatedFields: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  listenToMenuItems: () => (() => void);

  // Staff actions
  listenToWaiters: () => (() => void);
  listenToChefs: () => (() => void);
  addWaiter: (waiter: Omit<Waiter, 'id' | 'totalDeliveries' | 'todayTips' | 'rating' | 'status'> & { pin: string }) => void;
  addChef: (chef: Omit<Chef, 'id' | 'ordersPrepared' | 'rating' | 'activeLoad'> & { pin: string }) => void;
  updateWaiterStatus: (id: string, status: Waiter['status']) => void;
  updateChefSection: (id: string, section: string) => void;
  
  // Reservation actions
  addReservation: (reservation: Omit<Reservation, 'id' | 'status'>) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  
  // CCTV camera actions
  toggleCameraStatus: (id: string) => void;
  
  // Notification actions
  addNotification: (title: string, message: string, type: AdminNotification['type']) => void;
  markNotificationRead: (id: string) => void;
}

const INITIAL_FOODS: MenuItem[] = [
  { id: '1', name: 'Truffle Mushroom Risotto', price: 24.99, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop', category: 'Main Course', type: 'veg', available: true, prepTime: 15 },
  { id: '2', name: 'Wagyu Beef Burger', price: 29.50, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop', category: 'Main Course', type: 'non-veg', available: true, prepTime: 10 },
  { id: '3', name: 'Salmon Tartare', price: 18.00, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop', category: 'Starters', type: 'non-veg', available: true, prepTime: 8 },
  { id: '4', name: 'Hyderabadi Dum Biryani', price: 22.00, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop', category: 'Biryani', type: 'non-veg', available: true, prepTime: 20 },
  { id: '5', name: 'Matcha Lava Cake', price: 12.99, image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?q=80&w=400&auto=format&fit=crop', category: 'Desserts', type: 'veg', available: true, prepTime: 12 },
  { id: '6', name: 'Artisan Burrata', price: 16.50, image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=400&auto=format&fit=crop', category: 'Starters', type: 'veg', available: true, prepTime: 6 },
];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'RES-801', customerName: 'Alexander Wright', tableNumber: 4, date: '2026-06-09', time: '08:30 PM', guestCount: 2, status: 'Confirmed', specialRequest: 'Anniversary celebration, window table requested.' },
  { id: 'RES-802', customerName: 'Sophia Loren', tableNumber: 2, date: '2026-06-09', time: '07:00 PM', guestCount: 4, status: 'Completed', specialRequest: 'Vegetarian tasting menu.' },
  { id: 'RES-803', customerName: 'David Miller', tableNumber: 9, date: '2026-06-10', time: '01:00 PM', guestCount: 6, status: 'Pending', specialRequest: 'Requires high chair for infant.' },
  { id: 'RES-804', customerName: 'Elena Rostova', tableNumber: 11, date: '2026-06-10', time: '09:00 PM', guestCount: 2, status: 'Cancelled', specialRequest: 'Gluten-free restrictions.' }
];

const INITIAL_CAMERAS: CCTVCamera[] = [
  { id: 'CAM-01', name: 'Main Plating Line', status: 'Online', fps: 30 },
  { id: 'CAM-02', name: 'Primary Sauté Station', status: 'Online', fps: 30 },
  { id: 'CAM-03', name: 'Prep Counter & Walk-in', status: 'Online', fps: 25 },
  { id: 'CAM-04', name: 'Dining Floor East', status: 'Online', fps: 20 }
];

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  { id: 'N1', title: 'System Load Alert', message: 'Workload spikes detected at Chef Bourdain station.', type: 'System', time: '10:52 PM', read: false },
  { id: 'N2', title: 'New Reservation', message: 'Table 9 booked by David Miller for 6 guests.', type: 'Reservation', time: '10:15 PM', read: false },
  { id: 'N3', title: 'Feedback Received', message: '5-star rating submitted by Alexander Wright.', type: 'System', time: '09:40 PM', read: true }
];

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdminLoggedIn: false,
  menuItems: [],
  reservations: INITIAL_RESERVATIONS,
  cameras: INITIAL_CAMERAS,
  notifications: INITIAL_NOTIFICATIONS,
  taxRate: 5, // 5% GST
  currency: '$',
  waiters: [],
  chefs: [],

  login: () => set({ isAdminLoggedIn: true }),
  logout: () => set({ isAdminLoggedIn: false }),

  addMenuItem: async (item) => {
    const menuItems = get().menuItems;
    const maxId = menuItems.length > 0 ? Math.max(...menuItems.map(m => parseInt(m.id) || 0)) : 0;
    const nextId = (maxId + 1).toString();
    const newItem: MenuItem = {
      ...item,
      id: nextId,
      available: true
    };
    try {
      await setDoc(doc(db, 'menuItems', nextId), newItem);
    } catch (error) {
      console.error("Error adding menu item:", error);
    }
  },

  updateMenuItem: async (id, updatedFields) => {
    try {
      await updateDoc(doc(db, 'menuItems', id), updatedFields);
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
  },

  deleteMenuItem: async (id) => {
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  },

  listenToMenuItems: () => {
    const menuCol = collection(db, 'menuItems');
    let isInitialFetch = true;
    return onSnapshot(menuCol, async (snapshot) => {
      if (snapshot.empty && isInitialFetch) {
        isInitialFetch = false;
        for (const food of INITIAL_FOODS) {
          await setDoc(doc(db, 'menuItems', food.id), food);
        }
      } else {
        const items: MenuItem[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as MenuItem);
        });
        items.sort((a, b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0));
        set({ menuItems: items });
      }
    }, (error) => {
      console.error("Error in onSnapshot listener for menu items:", error);
    });
  },

  listenToWaiters: () => {
    const waitersCol = collection(db, 'waiters');
    let isInitialFetch = true;
    return onSnapshot(waitersCol, async (snapshot) => {
      if (snapshot.empty && isInitialFetch) {
        isInitialFetch = false;
        const INITIAL_WAITERS: Waiter[] = [
          { id: 'W-01', name: 'John Doe', email: 'john.doe@restaurant.com', pin: '1234', status: 'Active', onlineStatus: true, rating: 4.9, totalDeliveries: 24, todayTips: 42.50, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=120&auto=format&fit=crop' },
          { id: 'W-02', name: 'Sarah Connor', email: 'sarah.c@restaurant.com', pin: '4321', status: 'On Break', onlineStatus: false, rating: 4.8, totalDeliveries: 18, todayTips: 30.00, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop' },
          { id: 'W-03', name: 'Liam Neeson', email: 'liam.n@restaurant.com', pin: '1111', status: 'Active', onlineStatus: true, rating: 4.7, totalDeliveries: 21, todayTips: 35.80, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop' },
          { id: 'W-04', name: 'Emma Watson', email: 'emma.w@restaurant.com', pin: '2222', status: 'Offline', onlineStatus: false, rating: 5.0, totalDeliveries: 32, todayTips: 65.00, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop' }
        ];
        for (const waiter of INITIAL_WAITERS) {
          await setDoc(doc(db, 'waiters', waiter.id), waiter);
        }
      } else {
        const items: Waiter[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as Waiter);
        });
        items.sort((a, b) => a.id.localeCompare(b.id));
        set({ waiters: items });
      }
    }, (error) => {
      console.error("Error in onSnapshot listener for waiters:", error);
    });
  },

  listenToChefs: () => {
    const chefsCol = collection(db, 'chefs');
    let isInitialFetch = true;
    return onSnapshot(chefsCol, async (snapshot) => {
      if (snapshot.empty && isInitialFetch) {
        isInitialFetch = false;
        const INITIAL_CHEFS: Chef[] = [
          { id: 'C1', name: 'Chef Ramsay', section: 'Grill & Entrées', pin: '1234', rating: 4.9, ordersPrepared: 242, activeLoad: 0, shiftWindow: '04:00 PM - Midnight', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=120&auto=format&fit=crop' },
          { id: 'C2', name: 'Chef Bourdain', section: 'Sauté & Pastry', pin: '5555', rating: 4.8, ordersPrepared: 198, activeLoad: 0, shiftWindow: '04:00 PM - Midnight', avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=120&auto=format&fit=crop' },
          { id: 'C3', name: 'Chef Chang', section: 'Appetizers & Salads', pin: '9999', rating: 4.7, ordersPrepared: 156, activeLoad: 0, shiftWindow: '06:00 PM - 02:00 AM', avatar: 'https://images.unsplash.com/photo-1595273670150-db0a3e390294?q=80&w=120&auto=format&fit=crop' }
        ];
        for (const chef of INITIAL_CHEFS) {
          await setDoc(doc(db, 'chefs', chef.id), chef);
        }
      } else {
        const items: Chef[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as Chef);
        });
        items.sort((a, b) => a.id.localeCompare(b.id));
        set({ chefs: items });
      }
    }, (error) => {
      console.error("Error in onSnapshot listener for chefs:", error);
    });
  },

  addWaiter: async (waiter) => {
    const waiters = get().waiters;
    const nextId = `W-0${waiters.length + 1}`;
    const newWaiter: Waiter = {
      ...waiter,
      id: nextId,
      status: 'Offline',
      onlineStatus: false,
      rating: 5.0,
      totalDeliveries: 0,
      todayTips: 0.00
    };
    try {
      await setDoc(doc(db, 'waiters', nextId), newWaiter);
    } catch (error) {
      console.error("Error adding waiter:", error);
    }
  },

  addChef: async (chef) => {
    const chefs = get().chefs;
    const nextId = `C${chefs.length + 1}`;
    const newChef: Chef = {
      ...chef,
      id: nextId,
      rating: 5.0,
      ordersPrepared: 0,
      activeLoad: 0
    };
    try {
      await setDoc(doc(db, 'chefs', nextId), newChef);
    } catch (error) {
      console.error("Error adding chef:", error);
    }
  },

  updateWaiterStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, 'waiters', id), { 
        status, 
        onlineStatus: status === 'Active' 
      });
    } catch (error) {
      console.error("Error updating waiter status:", error);
    }
  },

  updateChefSection: async (id, section) => {
    try {
      await updateDoc(doc(db, 'chefs', id), { section });
    } catch (error) {
      console.error("Error updating chef section:", error);
    }
  },

  addReservation: (res) => set((state) => {
    const nextId = `RES-${Math.floor(Math.random() * 900) + 100}`;
    const newReservation: Reservation = {
      ...res,
      id: nextId,
      status: 'Pending'
    };
    return { reservations: [newReservation, ...state.reservations] };
  }),

  updateReservationStatus: (id, status) => set((state) => ({
    reservations: state.reservations.map(r => r.id === id ? { ...r, status } : r)
  })),

  toggleCameraStatus: (id) => set((state) => ({
    cameras: state.cameras.map(c => c.id === id ? { ...c, status: c.status === 'Online' ? 'Offline' : 'Online' } : c)
  })),

  addNotification: (title, message, type) => set((state) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif: AdminNotification = {
      id: `N${Math.floor(Math.random() * 900) + 100}`,
      title,
      message,
      type,
      time: timeNow,
      read: false
    };
    return { notifications: [newNotif, ...state.notifications] };
  }),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  }))
}));
