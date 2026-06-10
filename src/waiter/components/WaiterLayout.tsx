import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { 
  LayoutDashboard, ClipboardList, Grid, History, TrendingUp, User, Bell, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function WaiterLayout() {
  const { waiter, notifications, toggleOnlineStatus, logout, listenToWaiters } = useWaiterStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Subscribe to real-time waiter changes in Firestore
  useEffect(() => {
    const unsubscribe = listenToWaiters();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [listenToWaiters]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!waiter) {
      navigate('/waiter/login');
    }
  }, [waiter, navigate]);

  // Monitor notifications to display floating toast alerts
  useEffect(() => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0 && location.pathname !== '/waiter/notifications') {
      setActiveToast(unread[0].message);
      const timer = setTimeout(() => setActiveToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notifications, location.pathname]);

  if (!waiter) return null;

  const tabs = [
    { path: '/waiter', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/waiter/assigned', label: 'Assigned', icon: ClipboardList },
    { path: '/waiter/tables', label: 'Tables', icon: Grid },
    { path: '/waiter/history', label: 'History', icon: History },
    { path: '/waiter/performance', label: 'Analytics', icon: TrendingUp },
    { path: '/waiter/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] pb-24 font-sans select-none relative">
      {/* Real-time floating Notification Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="fixed top-4 left-4 right-4 z-50 bg-slate-900 text-white p-4 rounded-[20px] shadow-xl flex items-start gap-3 border border-slate-700/50 backdrop-blur-md max-w-sm mx-auto"
          >
            <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[14px]">New Table Alert</p>
              <p className="text-slate-300 text-[13px] mt-0.5 leading-tight">{activeToast}</p>
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white font-bold text-sm px-1.5"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="bg-white/85 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.015)] max-w-md mx-auto w-full">
        <Link to="/waiter/profile" className="relative cursor-pointer shrink-0">
          <img src={waiter.avatar} alt={waiter.name} className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm" />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
            waiter.onlineStatus ? 'bg-green-500' : 'bg-slate-350'
          }`} />
        </Link>

        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center select-none">
          {waiter.name.toUpperCase()} • {waiter.onlineStatus ? 'ACTIVE' : 'OFFLINE'}
        </div>

        <Link 
          to="/waiter/notifications"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-[#1e293b] border border-[#f1f5f9] relative"
        >
          <Bell className="w-4 h-4" />
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute top-1 right-1 bg-[#ef4444] w-1.5 h-1.5 rounded-full ring-1 ring-white" />
          )}
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto px-4 py-5">
        <Outlet />
      </div>

      {/* Bottom Sticky Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#f1f5f9] py-2.5 px-4 flex justify-between items-center z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
        <div className="flex justify-around items-center w-full max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = location.pathname === tab.path || (tab.path !== '/waiter' && location.pathname.startsWith(tab.path));
            
            return (
              <Link 
                key={tab.path} 
                to={tab.path}
                className="flex flex-col items-center gap-1 flex-1 relative py-1 cursor-pointer"
              >
                <motion.div 
                  animate={{ scale: isSelected ? 1.1 : 1 }}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isSelected ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </motion.div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                  isSelected ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {tab.label}
                </span>
                
                {/* Micro active layout bar */}
                {isSelected && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-[-6px] w-6 h-[3px] bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
