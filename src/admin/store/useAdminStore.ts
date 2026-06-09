import { create } from 'zustand';
import type { AdminCustomer, Reservation, CCTVCamera, AdminNotification } from '../types';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  type: 'veg' | 'non-veg';
  available: boolean;
}

interface AdminState {
  isAdminLoggedIn: boolean;
  menuItems: MenuItem[];
  customers: AdminCustomer[];
  reservations: Reservation[];
  cameras: CCTVCamera[];
  notifications: AdminNotification[];
  taxRate: number;
  currency: string;
  
  // Auth actions
  login: () => void;
  logout: () => void;
  
  // Menu actions
  addMenuItem: (item: Omit<MenuItem, 'id' | 'available'>) => void;
  updateMenuItem: (id: string, updatedFields: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
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
  { id: '1', name: 'Truffle Mushroom Risotto', price: 24.99, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop', category: 'Main Course', type: 'veg', available: true },
  { id: '2', name: 'Wagyu Beef Burger', price: 29.50, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop', category: 'Main Course', type: 'non-veg', available: true },
  { id: '3', name: 'Salmon Tartare', price: 18.00, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop', category: 'Starters', type: 'non-veg', available: true },
  { id: '4', name: 'Hyderabadi Dum Biryani', price: 22.00, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop', category: 'Biryani', type: 'non-veg', available: true },
  { id: '5', name: 'Matcha Lava Cake', price: 12.99, image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?q=80&w=400&auto=format&fit=crop', category: 'Desserts', type: 'veg', available: true },
  { id: '6', name: 'Artisan Burrata', price: 16.50, image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=400&auto=format&fit=crop', category: 'Starters', type: 'veg', available: true },
];

const INITIAL_CUSTOMERS: AdminCustomer[] = [
  { id: 'CUST-301', name: 'Alexander Wright', email: 'alex@wright.co', phone: '+1 555-0192', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop', visitCount: 42, totalSpent: 1845.50, avgRating: 4.9, dietPreference: 'All', lastVisitDate: '2026-06-09' },
  { id: 'CUST-302', name: 'Meera Patel', email: 'meera.patel@gmail.com', phone: '+1 555-0143', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop', visitCount: 28, totalSpent: 924.00, avgRating: 4.8, dietPreference: 'Veg', lastVisitDate: '2026-06-08' },
  { id: 'CUST-303', name: 'Marcus Chen', email: 'marcus@chencorp.org', phone: '+1 555-0129', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop', visitCount: 15, totalSpent: 512.20, avgRating: 4.6, dietPreference: 'Non-Veg', lastVisitDate: '2026-06-07' },
  { id: 'CUST-304', name: 'Sophia Loren', email: 'sophia@loren.it', phone: '+1 555-0111', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop', visitCount: 31, totalSpent: 1240.80, avgRating: 5.0, dietPreference: 'Veg', lastVisitDate: '2026-06-05' },
  { id: 'CUST-305', name: 'Devon Carter', email: 'devon@carter.dev', phone: '+1 555-0178', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop', visitCount: 9, totalSpent: 288.50, avgRating: 4.2, dietPreference: 'All', lastVisitDate: '2026-06-02' }
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
  menuItems: INITIAL_FOODS,
  customers: INITIAL_CUSTOMERS,
  reservations: INITIAL_RESERVATIONS,
  cameras: INITIAL_CAMERAS,
  notifications: INITIAL_NOTIFICATIONS,
  taxRate: 5, // 5% GST
  currency: '$',

  login: () => set({ isAdminLoggedIn: true }),
  logout: () => set({ isAdminLoggedIn: false }),

  addMenuItem: (item) => set((state) => {
    const nextId = (Math.max(...state.menuItems.map(m => parseInt(m.id))) + 1).toString();
    const newItem: MenuItem = {
      ...item,
      id: nextId,
      available: true
    };
    return { menuItems: [...state.menuItems, newItem] };
  }),

  updateMenuItem: (id, updatedFields) => set((state) => ({
    menuItems: state.menuItems.map(m => m.id === id ? { ...m, ...updatedFields } : m)
  })),

  deleteMenuItem: (id) => set((state) => ({
    menuItems: state.menuItems.filter(m => m.id !== id)
  })),

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
