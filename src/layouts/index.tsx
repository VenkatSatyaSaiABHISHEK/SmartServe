import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAdminStore } from "../admin/store/useAdminStore";
import { useChefStore } from "../chef/store/useChefStore";
import { useWaiterStore } from "../waiter/store/useWaiterStore";

export function RootLayout() {
  const listenToMenuItems = useAdminStore((state) => state.listenToMenuItems);
  const listenToWaiters = useAdminStore((state) => state.listenToWaiters);
  const listenToChefs = useAdminStore((state) => state.listenToChefs);

  useEffect(() => {
    const unsubMenu = listenToMenuItems();
    const unsubWaiters = listenToWaiters();
    const unsubChefs = listenToChefs();
    
    // Subscribe to Firestore orders collections globally
    const unsubOrdersChef = useChefStore.getState().listenToOrders();
    const unsubOrdersWaiter = useWaiterStore.getState().listenToOrders();
    
    // Start background kitchen tick scheduler
    useChefStore.getState().startTicking();
    
    return () => {
      if (unsubMenu) unsubMenu();
      if (unsubWaiters) unsubWaiters();
      if (unsubChefs) unsubChefs();
      if (unsubOrdersChef) unsubOrdersChef();
      if (unsubOrdersWaiter) unsubOrdersWaiter();
      useChefStore.getState().stopTicking();
    };
  }, [listenToMenuItems, listenToWaiters, listenToChefs]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
    </div>
  );
}

