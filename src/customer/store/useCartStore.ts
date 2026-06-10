import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  dietPreference: 'all' | 'veg' | 'non-veg';
  tableNumber: number;
  guestsCount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  setDietPreference: (preference: 'all' | 'veg' | 'non-veg') => void;
  setTableNumber: (num: number) => void;
  setGuestsCount: (num: number) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  dietPreference: 'all',
  tableNumber: 12,
  guestsCount: 4,
  setDietPreference: (preference) => set({ dietPreference: preference }),
  setTableNumber: (num) => set({ tableNumber: num }),
  setGuestsCount: (num) => set({ guestsCount: num }),
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(item => item.id === newItem.id);
    if (existingItem) {
      return {
        items: state.items.map(item =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        )
      };
    }
    return { items: [...state.items, newItem] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity > 0
      ? state.items.map(item => item.id === id ? { ...item, quantity } : item)
      : state.items.filter(item => item.id !== id)
  })),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => {
    const state = get();
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  getCartCount: () => {
    const state = get();
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }
}));
