export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  visitCount: number;
  totalSpent: number;
  avgRating: number;
  dietPreference: 'Veg' | 'Non-Veg' | 'All';
  lastVisitDate: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  tableNumber: number;
  date: string;
  time: string;
  guestCount: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  specialRequest?: string;
}

export interface CCTVCamera {
  id: string;
  name: string;
  status: 'Online' | 'Offline';
  fps: number;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'System' | 'Order' | 'Staff' | 'Reservation';
  time: string;
  read: boolean;
}
