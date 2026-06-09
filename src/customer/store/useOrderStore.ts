import { create } from 'zustand';

export type OrderStatus = 'Confirmed' | 'Preparing' | 'On The Way' | 'Delivered';

interface OrderState {
  status: OrderStatus;
  estimatedTimeMins: number;
  setStatus: (status: OrderStatus) => void;
  setEstimatedTime: (mins: number) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  status: 'Confirmed',
  estimatedTimeMins: 12,
  setStatus: (status) => set({ status }),
  setEstimatedTime: (mins) => set({ estimatedTimeMins: mins }),
}));
