import { create } from 'zustand';

export type OrderStatus = 'Confirmed' | 'Preparing' | 'On The Way' | 'Delivered';

interface OrderState {
  status: OrderStatus;
  estimatedTimeMins: number;
  orderId: string | null;
  setStatus: (status: OrderStatus) => void;
  setEstimatedTime: (mins: number) => void;
  setOrderId: (orderId: string) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  status: 'Confirmed',
  estimatedTimeMins: 12,
  orderId: null,
  setStatus: (status) => set({ status }),
  setEstimatedTime: (mins) => set({ estimatedTimeMins: mins }),
  setOrderId: (orderId) => set({ orderId }),
}));
