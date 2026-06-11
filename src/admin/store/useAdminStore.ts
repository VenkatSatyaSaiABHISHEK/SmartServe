import { create } from 'zustand';
import type { Reservation, CCTVCamera, AdminNotification, GuestReview } from '../types';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Waiter } from '../../waiter/types';
import type { Chef } from '../../chef/types';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  type: 'veg' | 'non-veg';
  available: boolean;
  prepTime: number; // preparation time in minutes
  slot?: 'morning' | 'evening' | 'night' | 'all';
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
  reviews: GuestReview[];
  reviewsLoaded: boolean;
  menuItemsLoaded: boolean;
  
  // Auth actions
  login: () => void;
  logout: () => void;
  
  // Menu actions
  addMenuItem: (item: Omit<MenuItem, 'id' | 'available'>) => void;
  addMenuItems: (items: Omit<MenuItem, 'id' | 'available'>[]) => Promise<void>;
  updateMenuItem: (id: string, updatedFields: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  listenToMenuItems: () => (() => void);

  // Staff actions
  listenToWaiters: () => (() => void);
  listenToChefs: () => (() => void);
  listenToReviews: () => (() => void);
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

const INITIAL_CAMERAS: CCTVCamera[] = [
  { id: 'CAM-01', name: 'Main Plating Line', status: 'Online', fps: 30 },
  { id: 'CAM-02', name: 'Primary Sauté Station', status: 'Online', fps: 30 },
  { id: 'CAM-03', name: 'Prep Counter & Walk-in', status: 'Online', fps: 25 },
  { id: 'CAM-04', name: 'Dining Floor East', status: 'Online', fps: 20 }
];

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdminLoggedIn: localStorage.getItem('isAdminLoggedIn') === 'true',
  menuItems: [],
  reservations: [],
  cameras: INITIAL_CAMERAS,
  notifications: [],
  taxRate: 5, // 5% GST
  currency: '₹',
  waiters: [],
  chefs: [],
  reviews: [],
  reviewsLoaded: false,
  menuItemsLoaded: false,

  login: () => {
    localStorage.setItem('isAdminLoggedIn', 'true');
    set({ isAdminLoggedIn: true });
  },
  logout: () => {
    localStorage.removeItem('isAdminLoggedIn');
    set({ isAdminLoggedIn: false });
  },

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

  addMenuItems: async (items) => {
    let menuItems = get().menuItems;
    let maxId = menuItems.length > 0 ? Math.max(...menuItems.map(m => parseInt(m.id) || 0)) : 0;
    for (const item of items) {
      maxId++;
      const nextId = maxId.toString();
      const newItem: MenuItem = {
        ...item,
        id: nextId,
        available: true
      };
      try {
        await setDoc(doc(db, 'menuItems', nextId), newItem);
      } catch (error) {
        console.error("Error adding menu item in batch:", error);
      }
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
    return onSnapshot(menuCol, (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as MenuItem);
      });
      items.sort((a, b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0));
      set({ menuItems: items, menuItemsLoaded: true });
    }, (error) => {
      console.error("Error in onSnapshot listener for menu items:", error);
    });
  },

  listenToWaiters: () => {
    const waitersCol = collection(db, 'waiters');
    return onSnapshot(waitersCol, (snapshot) => {
      const items: Waiter[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Waiter);
      });
      items.sort((a, b) => a.id.localeCompare(b.id));
      set({ waiters: items });
    }, (error) => {
      console.error("Error in onSnapshot listener for waiters:", error);
    });
  },

  listenToChefs: () => {
    const chefsCol = collection(db, 'chefs');
    return onSnapshot(chefsCol, (snapshot) => {
      const items: Chef[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Chef);
      });
      items.sort((a, b) => a.id.localeCompare(b.id));
      set({ chefs: items });
    }, (error) => {
      console.error("Error in onSnapshot listener for chefs:", error);
    });
  },

  listenToReviews: () => {
    const reviewsCol = collection(db, 'reviews');
    return onSnapshot(reviewsCol, (snapshot) => {
      const items: GuestReview[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as GuestReview);
      });
      items.sort((a, b) => b.date.localeCompare(a.date));
      set({ reviews: items, reviewsLoaded: true });
    }, (error) => {
      console.error("Error in onSnapshot listener for reviews:", error);
    });
  },

  addWaiter: async (waiter) => {
    const waiters = get().waiters;
    const maxId = waiters.length > 0 ? Math.max(...waiters.map(w => {
      const num = parseInt(w.id.replace('W-', ''));
      return isNaN(num) ? 0 : num;
    })) : 0;
    const nextId = `W-${(maxId + 1).toString().padStart(2, '0')}`;
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
    const maxId = chefs.length > 0 ? Math.max(...chefs.map(c => {
      const num = parseInt(c.id.replace('C', ''));
      return isNaN(num) ? 0 : num;
    })) : 0;
    const nextId = `C${maxId + 1}`;
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
