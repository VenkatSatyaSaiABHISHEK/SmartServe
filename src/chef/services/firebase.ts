import { useChefStore } from '../store/useChefStore';

const MOCK_ITEMS_POOL = [
  { name: 'Truffle Mushroom Risotto', prepTime: 15 },
  { name: 'Wagyu Beef Burger', prepTime: 10 },
  { name: 'Salmon Tartare', prepTime: 8 },
  { name: 'Hyderabadi Dum Biryani', prepTime: 18 },
  { name: 'Matcha Lava Cake', prepTime: 12 },
  { name: 'Artisan Burrata', prepTime: 5 }
];

let chefSimulationInterval: number | any = null;

export const startChefSimulation = () => {
  if (chefSimulationInterval) return;

  chefSimulationInterval = setInterval(() => {
    const store = useChefStore.getState();
    
    // Select 1 to 3 random items
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const itemsSelected: { name: string; quantity: number }[] = [];
    let totalPrepTime = 0;

    for (let i = 0; i < itemCount; i++) {
      const randomItem = MOCK_ITEMS_POOL[Math.floor(Math.random() * MOCK_ITEMS_POOL.length)];
      
      const existing = itemsSelected.find(item => item.name === randomItem.name);
      if (existing) {
        existing.quantity += 1;
      } else {
        itemsSelected.push({ name: randomItem.name, quantity: 1 });
      }
      
      totalPrepTime += randomItem.prepTime;
    }

    const randomTableNum = Math.floor(Math.random() * 12) + 1;

    // Trigger adding a new order (which automatically runs load-balancing)
    store.addNewOrder(itemsSelected, randomTableNum, totalPrepTime);
  }, 25000); // 25 seconds interval
};

export const stopChefSimulation = () => {
  if (chefSimulationInterval) {
    clearInterval(chefSimulationInterval);
    chefSimulationInterval = null;
  }
};
