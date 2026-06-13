import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts';
import { WelcomePage } from '../customer/pages/WelcomePage';
import { HomePage } from '../customer/pages/HomePage';
import { PaymentPage } from '../customer/pages/PaymentPage';
import { OrderTrackingPage } from '../customer/pages/OrderTrackingPage';

// Waiter Module Page Imports
import { WaiterLayout } from '../waiter/components/WaiterLayout';
import { LoginPage } from '../waiter/pages/LoginPage';
import { DashboardPage } from '../waiter/pages/DashboardPage';
import { AssignedOrdersPage } from '../waiter/pages/AssignedOrdersPage';
import { OrderDetailsPage } from '../waiter/pages/OrderDetailsPage';
import { ActiveTablesPage } from '../waiter/pages/ActiveTablesPage';
import { DeliveryHistoryPage } from '../waiter/pages/DeliveryHistoryPage';
import { PerformancePage } from '../waiter/pages/PerformancePage';
import { ProfilePage, SettingsPage } from '../waiter/pages/ProfilePage';
import { NotificationsPage } from '../waiter/pages/NotificationsPage';

// Chef Module Page Imports
import { ChefLayout } from '../chef/components/ChefLayout';
import { LoginPage as ChefLoginPage } from '../chef/pages/LoginPage';
import { DashboardPage as ChefDashboardPage } from '../chef/pages/DashboardPage';
import { ActiveOrdersPage as ChefActiveOrdersPage } from '../chef/pages/ActiveOrdersPage';
import { PreparingPage as ChefPreparingPage } from '../chef/pages/PreparingPage';
import { ReadyOrdersPage as ChefReadyOrdersPage } from '../chef/pages/ReadyOrdersPage';
import { OrderHistoryPage as ChefOrderHistoryPage } from '../chef/pages/OrderHistoryPage';
import { PerformancePage as ChefPerformancePage } from '../chef/pages/PerformancePage';
import { ProfilePage as ChefProfilePage, SettingsPage as ChefSettingsPage } from '../chef/pages/ProfilePage';

// Admin Module Page Imports
import { AdminLayout } from '../admin/components/AdminLayout';
import { LoginPage as AdminLoginPage } from '../admin/pages/LoginPage';
import { DashboardPage as AdminDashboardPage } from '../admin/pages/DashboardPage';
import { OrdersPage as AdminOrdersPage } from '../admin/pages/OrdersPage';
import { MenuManagementPage as AdminMenuManagementPage } from '../admin/pages/MenuManagementPage';
import { InventoryPage as AdminInventoryPage } from '../admin/pages/InventoryPage';
import { ReservationPage as AdminReservationPage } from '../admin/pages/ReservationPage';
import { QrGeneratorPage as AdminQrGeneratorPage } from '../admin/pages/QrGeneratorPage';
import { WaiterManagementPage as AdminWaiterManagementPage } from '../admin/pages/WaiterManagementPage';
import { ChefManagementPage as AdminChefManagementPage } from '../admin/pages/ChefManagementPage';
import { KitchenDisplayPage as AdminKitchenDisplayPage } from '../admin/pages/KitchenDisplayPage';
import { FeedbackPage as AdminFeedbackPage } from '../admin/pages/FeedbackPage';
import { AnalyticsPage as AdminAnalyticsPage } from '../admin/pages/AnalyticsPage';
import { CameraMonitoringPage as AdminCameraMonitoringPage } from '../admin/pages/CameraMonitoringPage';
import { NotificationsPage as AdminNotificationsPage } from '../admin/pages/NotificationsPage';
import { ProfilePage as AdminProfilePage } from '../admin/pages/ProfilePage';
import { SettingsPage as AdminSettingsPage } from '../admin/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <WelcomePage />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "payment",
        element: <PaymentPage />,
      },
      {
        path: "tracking",
        element: <OrderTrackingPage />,
      },
      // Standalone Waiter PIN Login
      {
        path: "waiter/login",
        element: <LoginPage />,
      },
      // Full Screen Waiter Order Details
      {
        path: "waiter/order/:id",
        element: <OrderDetailsPage />,
      },
      // Waiter Application Shell Layout with Tab Bar
      {
        path: "waiter",
        element: <WaiterLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "assigned",
            element: <AssignedOrdersPage />,
          },
          {
            path: "tables",
            element: <ActiveTablesPage />,
          },
          {
            path: "history",
            element: <DeliveryHistoryPage />,
          },
          {
            path: "performance",
            element: <PerformancePage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          }
        ]
      },
      // Standalone Chef PIN Login
      {
        path: "chef/login",
        element: <ChefLoginPage />,
      },
      // Chef Application Shell Layout with Collapsible Sidebar
      {
        path: "chef",
        element: <ChefLayout />,
        children: [
          {
            index: true,
            element: <ChefDashboardPage />,
          },
          {
            path: "active",
            element: <ChefActiveOrdersPage />,
          },
          {
            path: "preparing",
            element: <ChefPreparingPage />,
          },
          {
            path: "ready",
            element: <ChefReadyOrdersPage />,
          },
          {
            path: "history",
            element: <ChefOrderHistoryPage />,
          },
          {
            path: "performance",
            element: <ChefPerformancePage />,
          },
          {
            path: "profile",
            element: <ChefProfilePage />,
          },
          {
            path: "settings",
            element: <ChefSettingsPage />,
          }
        ]
      },
      // Standalone Admin PIN Login
      {
        path: "admin/login",
        element: <AdminLoginPage />,
      },
      // Standalone TV KDS Console Screen (No Sidebar or Top Header)
      {
        path: "admin/kds",
        element: <AdminKitchenDisplayPage />,
      },
      // Admin Layout with Sidebar
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: "orders",
            element: <AdminOrdersPage />,
          },
          {
            path: "menu",
            element: <AdminMenuManagementPage />,
          },
          {
            path: "inventory",
            element: <AdminInventoryPage />,
          },
          {
            path: "reservations",
            element: <AdminReservationPage />,
          },
          {
            path: "qr",
            element: <AdminQrGeneratorPage />,
          },
          {
            path: "waiters",
            element: <AdminWaiterManagementPage />,
          },
          {
            path: "chefs",
            element: <AdminChefManagementPage />,
          },
          {
            path: "cameras",
            element: <AdminCameraMonitoringPage />,
          },
          {
            path: "feedback",
            element: <AdminFeedbackPage />,
          },
          {
            path: "analytics",
            element: <AdminAnalyticsPage />,
          },
          {
            path: "notifications",
            element: <AdminNotificationsPage />,
          },
          {
            path: "profile",
            element: <AdminProfilePage />,
          },
          {
            path: "settings",
            element: <AdminSettingsPage />,
          }
        ]
      }
    ]
  }
]);
