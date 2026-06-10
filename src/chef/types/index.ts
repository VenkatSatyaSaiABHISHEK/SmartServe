export interface Chef {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  ordersPrepared: number;
  activeLoad: number;
  pin?: string;
  section?: string;
  shiftWindow?: string;
  breakRemainingSecs?: number;
  breakUntil?: number | null;
}

export interface ChefOrder {
  id: string;
  tableNumber: number;
  items: { name: string; quantity: number }[];
  prepTimeMins: number;
  status: 'New' | 'Preparing' | 'Ready' | 'Picked Up' | 'Completed' | 'Delivered' | 'Cancelled';
  assignedChefId: string;
  timeReceived: string;
  createdAt?: number;
  startedPreparingAt?: number | null;
  completedAt?: number | null;
  remainingPrepTimeSecs?: number;
  price?: number;
  paymentMethod?: string;
  paymentStatus?: 'Unpaid' | 'Paid';
}

