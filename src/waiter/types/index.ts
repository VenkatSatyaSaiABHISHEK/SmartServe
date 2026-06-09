export interface Waiter {
  id: string;
  name: string;
  email: string;
  avatar: string;
  onlineStatus: boolean;
  rating: number;
  totalDeliveries: number;
  todayTips: number;
}

export interface WaiterOrder {
  id: string;
  tableId: string;
  items: { name: string; quantity: number }[];
  price: number;
  status: 'Preparing' | 'Ready' | 'Picked Up' | 'Delivered';
  timeOrdered: string;
}

export interface ActiveTable {
  id: string;
  number: number;
  capacity: number;
  status: 'occupied' | 'ordering' | 'waiting' | 'billing' | 'idle';
  assignedWaiterId?: string;
}

export interface WaiterNotification {
  id: string;
  type: 'table_ready' | 'call_waiter' | 'billing_request';
  message: string;
  time: string;
  read: boolean;
}
