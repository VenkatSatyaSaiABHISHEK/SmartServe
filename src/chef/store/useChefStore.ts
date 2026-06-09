import { create } from 'zustand';
import type { Chef, ChefOrder } from '../types';

interface ChefState {
  activeChef: Chef | null;
  chefs: Chef[];
  orders: ChefOrder[];
  login: (chefId: string) => void;
  logout: () => void;
  addNewOrder: (items: { name: string; quantity: number }[], tableNumber: number, prepTimeMins: number) => void;
  startPreparing: (orderId: string) => void;
  markReady: (orderId: string) => void;
  markCompleted: (orderId: string) => void;
  getChefActiveLoad: (chefId: string) => number;
}

const MOCK_CHEFS: Chef[] = [
  {
    id: 'C1',
    name: 'Chef Ramsay',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=200&auto=format&fit=crop',
    rating: 4.9,
    ordersPrepared: 242,
    activeLoad: 1,
  },
  {
    id: 'C2',
    name: 'Chef Bourdain',
    avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=200&auto=format&fit=crop',
    rating: 4.8,
    ordersPrepared: 198,
    activeLoad: 1,
  },
  {
    id: 'C3',
    name: 'Chef Chang',
    avatar: 'https://images.unsplash.com/photo-1595273670150-db0a3e390294?q=80&w=200&auto=format&fit=crop',
    rating: 4.7,
    ordersPrepared: 156,
    activeLoad: 0,
  }
];

const MOCK_ORDERS: ChefOrder[] = [
  {
    id: 'O201',
    tableNumber: 4,
    items: [{ name: 'Truffle Mushroom Risotto', quantity: 1 }],
    prepTimeMins: 15,
    status: 'Preparing',
    assignedChefId: 'C1',
    timeReceived: '10:35 PM'
  },
  {
    id: 'O202',
    tableNumber: 2,
    items: [{ name: 'Wagyu Beef Burger', quantity: 2 }],
    prepTimeMins: 10,
    status: 'New',
    assignedChefId: 'C1',
    timeReceived: '10:41 PM'
  },
  {
    id: 'O203',
    tableNumber: 9,
    items: [{ name: 'Matcha Lava Cake', quantity: 1 }],
    prepTimeMins: 12,
    status: 'Ready',
    assignedChefId: 'C2',
    timeReceived: '10:28 PM'
  },
  {
    id: 'O204',
    tableNumber: 3,
    items: [{ name: 'Salmon Tartare', quantity: 1 }],
    prepTimeMins: 8,
    status: 'Completed',
    assignedChefId: 'C2',
    timeReceived: '10:05 PM'
  }
];

export const useChefStore = create<ChefState>((set, get) => ({
  activeChef: null,
  chefs: MOCK_CHEFS,
  orders: MOCK_ORDERS,

  login: (chefId) => {
    const chef = get().chefs.find(c => c.id === chefId) || null;
    set({ activeChef: chef });
  },

  logout: () => set({ activeChef: null }),

  getChefActiveLoad: (chefId) => {
    return get().orders.filter(o => 
      o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
    ).length;
  },

  addNewOrder: (items, tableNumber, prepTimeMins) => set((state) => {
    const newOrderId = `O${Math.floor(Math.random() * 900) + 100}`;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // --- AUTOMATIC LOAD BALANCING ALGORITHM ---
    const getActiveLoad = (chefId: string) => {
      return state.orders.filter(o => 
        o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
      ).length;
    };

    const c1Load = getActiveLoad('C1');
    const c2Load = getActiveLoad('C2');
    const c3Load = getActiveLoad('C3');

    let assignedChefId = 'C1';
    
    if (c1Load < 2) {
      assignedChefId = 'C1';
    } else if (c2Load < 2) {
      assignedChefId = 'C2';
    } else if (c3Load < 2) {
      assignedChefId = 'C3';
    } else {
      // Fallback: assign to the chef with the absolute lowest active workload
      const loads = [
        { id: 'C1', load: c1Load },
        { id: 'C2', load: c2Load },
        { id: 'C3', load: c3Load }
      ];
      loads.sort((a, b) => a.load - b.load);
      assignedChefId = loads[0].id;
    }

    const newOrder: ChefOrder = {
      id: newOrderId,
      tableNumber,
      items,
      prepTimeMins,
      status: 'New',
      assignedChefId,
      timeReceived: timeNow
    };

    // Update chef activeLoads list
    const updatedChefs = state.chefs.map(chef => ({
      ...chef,
      activeLoad: chef.id === assignedChefId ? getActiveLoad(assignedChefId) + 1 : getActiveLoad(chef.id)
    }));

    return {
      orders: [newOrder, ...state.orders],
      chefs: updatedChefs
    };
  }),

  startPreparing: (orderId) => set((state) => {
    const updatedOrders = state.orders.map(order => 
      order.id === orderId ? { ...order, status: 'Preparing' as const } : order
    );

    // Update chef activeLoads
    const updatedChefs = state.chefs.map(chef => {
      const getActiveLoad = (chefId: string) => {
        return updatedOrders.filter(o => 
          o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
        ).length;
      };
      return { ...chef, activeLoad: getActiveLoad(chef.id) };
    });

    const activeChef = state.activeChef 
      ? updatedChefs.find(c => c.id === state.activeChef?.id) || null
      : null;

    return {
      orders: updatedOrders,
      chefs: updatedChefs,
      activeChef
    };
  }),

  markReady: (orderId) => set((state) => {
    const updatedOrders = state.orders.map(order => 
      order.id === orderId ? { ...order, status: 'Ready' as const } : order
    );

    // Update chef activeLoads
    const updatedChefs = state.chefs.map(chef => {
      const getActiveLoad = (chefId: string) => {
        return updatedOrders.filter(o => 
          o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
        ).length;
      };
      return { ...chef, activeLoad: getActiveLoad(chef.id) };
    });

    const activeChef = state.activeChef 
      ? updatedChefs.find(c => c.id === state.activeChef?.id) || null
      : null;

    return {
      orders: updatedOrders,
      chefs: updatedChefs,
      activeChef
    };
  }),

  markCompleted: (orderId) => set((state) => {
    const targetOrder = state.orders.find(o => o.id === orderId);
    const wasAlreadyCompleted = targetOrder?.status === 'Completed';
    const chefId = targetOrder?.assignedChefId;

    const updatedOrders = state.orders.map(order => 
      order.id === orderId ? { ...order, status: 'Completed' as const } : order
    );

    // Increment prepared count if it transitioned to completed
    const updatedChefs = state.chefs.map(chef => {
      const getActiveLoad = (chefId: string) => {
        return updatedOrders.filter(o => 
          o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
        ).length;
      };
      
      const isAssigned = chef.id === chefId;
      const increment = (isAssigned && !wasAlreadyCompleted) ? 1 : 0;
      
      return { 
        ...chef, 
        activeLoad: getActiveLoad(chef.id),
        ordersPrepared: chef.ordersPrepared + increment
      };
    });

    const activeChef = state.activeChef 
      ? updatedChefs.find(c => c.id === state.activeChef?.id) || null
      : null;

    return {
      orders: updatedOrders,
      chefs: updatedChefs,
      activeChef
    };
  })
}));
