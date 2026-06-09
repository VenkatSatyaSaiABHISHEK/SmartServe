import { useWaiterStore } from '../store/useWaiterStore';

const MOCK_MESSAGES = [
  { type: 'table_ready', message: 'Table 2: Wagyu Beef Burger is ready for collection 🍔' },
  { type: 'call_waiter', message: 'Table 4 is requesting assistance 🔔' },
  { type: 'billing_request', message: 'Table 3 requested the bill 💳' },
  { type: 'table_ready', message: 'Table 12: Truffle Risotto is ready 🍽️' },
  { type: 'call_waiter', message: 'Table 10 is calling a waiter 🔔' },
  { type: 'billing_request', message: 'Table 11 requested checkout 💳' }
];

let simulationInterval: number | any = null;

export const startWaiterSimulation = () => {
  if (simulationInterval) return;

  // Simulate a real-time event arriving every 20 seconds
  simulationInterval = setInterval(() => {
    const store = useWaiterStore.getState();
    
    // Only dispatch alerts if the waiter is logged in and active (Online)
    if (store.waiter && store.waiter.onlineStatus) {
      const randomIndex = Math.floor(Math.random() * MOCK_MESSAGES.length);
      const selected = MOCK_MESSAGES[randomIndex];
      
      store.addNotification({
        type: selected.type as any,
        message: selected.message,
      });

      // Periodically update active tables state to simulate other diners
      if (Math.random() > 0.4) {
        const randomTableNum = Math.floor(Math.random() * 12) + 1;
        const statuses: ('idle' | 'ordering' | 'waiting' | 'billing' | 'occupied')[] = 
          ['idle', 'ordering', 'waiting', 'billing', 'occupied'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        store.updateTableStatus(randomTableNum.toString(), randomStatus);
      }
    }
  }, 20000);
};

export const stopWaiterSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};
