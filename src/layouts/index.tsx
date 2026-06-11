import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAdminStore } from "../admin/store/useAdminStore";
import { useChefStore } from "../chef/store/useChefStore";
import { useWaiterStore } from "../waiter/store/useWaiterStore";

export function RootLayout() {
  const listenToMenuItems = useAdminStore((state) => state.listenToMenuItems);
  const listenToWaiters = useAdminStore((state) => state.listenToWaiters);
  const listenToChefs = useAdminStore((state) => state.listenToChefs);
  const listenToReviews = useAdminStore((state) => state.listenToReviews);

  useEffect(() => {
    const unsubMenu = listenToMenuItems();
    const unsubWaiters = listenToWaiters();
    const unsubChefs = listenToChefs();
    const unsubReviews = listenToReviews();
    
    // Subscribe to Firestore collections globally
    const unsubChefsChefStore = useChefStore.getState().listenToChefs();
    const unsubOrdersChef = useChefStore.getState().listenToOrders();
    const unsubOrdersWaiter = useWaiterStore.getState().listenToOrders();
    const unsubTables = useWaiterStore.getState().listenToTables();
    const unsubNotifications = useWaiterStore.getState().listenToNotifications();
    
    // Start background kitchen tick scheduler
    useChefStore.getState().startTicking();
    
    return () => {
      if (unsubMenu) unsubMenu();
      if (unsubWaiters) unsubWaiters();
      if (unsubChefs) unsubChefs();
      if (unsubReviews) unsubReviews();
      if (unsubChefsChefStore) unsubChefsChefStore();
      if (unsubOrdersChef) unsubOrdersChef();
      if (unsubOrdersWaiter) unsubOrdersWaiter();
      if (unsubTables) unsubTables();
      if (unsubNotifications) unsubNotifications();
      useChefStore.getState().stopTicking();
    };
  }, [listenToMenuItems, listenToWaiters, listenToChefs, listenToReviews]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
    </div>
  );
}

