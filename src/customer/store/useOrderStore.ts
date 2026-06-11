import { create } from 'zustand';

export type OrderStatus = 'Confirmed' | 'Preparing' | 'On The Way' | 'Delivered' | 'Cancelled';

interface OrderState {
  status: OrderStatus;
  estimatedTimeMins: number;
  orderId: string | null;
  previousOrderId: string | null;
  trackingStartTime: number | null;
  setStatus: (status: OrderStatus) => void;
  setEstimatedTime: (mins: number) => void;
  setOrderId: (orderId: string | null) => void;
  setPreviousOrderId: (orderId: string | null) => void;
  setTrackingStartTime: (time: number | null) => void;
  clearActiveOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => {
  const orderId = localStorage.getItem('activeOrderId') || null;
  const previousOrderId = localStorage.getItem('previousOrderId') || null;
  const status = (localStorage.getItem('activeOrderStatus') as OrderStatus) || 'Confirmed';
  const estimatedTimeMins = parseInt(localStorage.getItem('activeOrderEstTime') || '12');
  const trackingStartTimeVal = localStorage.getItem('activeOrderTrackingStartTime');
  const trackingStartTime = trackingStartTimeVal ? parseInt(trackingStartTimeVal) : null;

  return {
    status,
    estimatedTimeMins,
    orderId,
    previousOrderId,
    trackingStartTime,
    setStatus: (status) => {
      localStorage.setItem('activeOrderStatus', status);
      set({ status });
    },
    setEstimatedTime: (mins) => {
      localStorage.setItem('activeOrderEstTime', mins.toString());
      set({ estimatedTimeMins: mins });
    },
    setOrderId: (id) => {
      if (id) {
        localStorage.setItem('activeOrderId', id);
        if (!localStorage.getItem('activeOrderTrackingStartTime')) {
          const nowStr = Date.now().toString();
          localStorage.setItem('activeOrderTrackingStartTime', nowStr);
          set({ trackingStartTime: parseInt(nowStr) });
        }
      } else {
        localStorage.removeItem('activeOrderId');
        localStorage.removeItem('activeOrderTrackingStartTime');
        set({ trackingStartTime: null });
      }
      set({ orderId: id });
    },
    setPreviousOrderId: (id) => {
      if (id) {
        localStorage.setItem('previousOrderId', id);
      } else {
        localStorage.removeItem('previousOrderId');
      }
      set({ previousOrderId: id });
    },
    setTrackingStartTime: (time) => {
      if (time) {
        localStorage.setItem('activeOrderTrackingStartTime', time.toString());
      } else {
        localStorage.removeItem('activeOrderTrackingStartTime');
      }
      set({ trackingStartTime: time });
    },
    clearActiveOrder: () => {
      localStorage.removeItem('activeOrderId');
      localStorage.removeItem('activeOrderStatus');
      localStorage.removeItem('activeOrderEstTime');
      localStorage.removeItem('activeOrderTrackingStartTime');
      set({ orderId: null, status: 'Confirmed', estimatedTimeMins: 12, trackingStartTime: null });
    }
  };
});
