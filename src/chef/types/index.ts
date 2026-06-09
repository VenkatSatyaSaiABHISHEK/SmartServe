export interface Chef {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  ordersPrepared: number;
  activeLoad: number;
}

export interface ChefOrder {
  id: string;
  tableNumber: number;
  items: { name: string; quantity: number }[];
  prepTimeMins: number;
  status: 'New' | 'Preparing' | 'Ready' | 'Completed';
  assignedChefId: string;
  timeReceived: string;
}
