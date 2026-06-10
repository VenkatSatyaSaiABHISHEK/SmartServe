import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useChefStore } from '../store/useChefStore';
import { 
  LayoutDashboard, ClipboardList, Flame, CheckCircle2, History, TrendingUp, User, LogOut, Menu, X, Bell, Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChefLayout() {
  const { activeChef, orders, logout, listenToChefs } = useChefStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(orders.length);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Subscribe to real-time chef changes in Firestore
  useEffect(() => {
    const unsubscribe = listenToChefs();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [listenToChefs]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!activeChef) {
      navigate('/chef/login');
    }
  }, [activeChef, navigate]);



  // Monitor incoming orders to show a top alert banner
  useEffect(() => {
    if (orders.length > lastOrderCount) {
      const newOrder = orders[0];
      if (activeChef && newOrder.assignedChefId === activeChef.id) {
        setShowNotification(`New Order ${newOrder.id} assigned to you! Table ${newOrder.tableNumber} 🍕`);
        const timer = setTimeout(() => setShowNotification(null), 4000);
        setLastOrderCount(orders.length);
        return () => clearTimeout(timer);
      }
      setLastOrderCount(orders.length);
    }
  }, [orders, lastOrderCount, activeChef]);

  if (!activeChef) return null;

  // Count active orders assigned to the logged-in chef
  const newCount = orders.filter(o => o.assignedChefId === activeChef.id && o.status === 'New').length;
  const preparingCount = orders.filter(o => o.assignedChefId === activeChef.id && o.status === 'Preparing').length;
  const totalActiveCount = newCount + preparingCount;

  const menuItems = [
    { path: '/chef', label: 'Workload Dashboard', icon: LayoutDashboard },
    { path: '/chef/preparing', label: 'Hands-Free Terminal', icon: Flame, badge: totalActiveCount, badgeColor: 'bg-orange-500 animate-pulse' },
    { path: '/admin/kds', label: 'KDS TV Mirror', icon: Tv },
    { path: '/chef/history', label: 'Order History', icon: History },
    { path: '/chef/performance', label: 'Analytics', icon: TrendingUp },
    { path: '/chef/profile', label: 'Station Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] flex font-sans select-none overflow-hidden relative">
      {/* Floating KDS Toast Alerts */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white p-4.5 rounded-[22px] shadow-2xl flex items-center gap-3 border border-slate-700/60 backdrop-blur-md max-w-sm w-full"
          >
            <div className="bg-[#7c3aed]/20 p-2 rounded-xl text-[#a78bfa]">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <p className="font-bold text-[13px] text-slate-100 flex-1 leading-snug">{showNotification}</p>
            <button onClick={() => setShowNotification(null)} className="text-slate-400 hover:text-white font-bold text-lg px-1">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside 
        className={`bg-white border-r border-[#f1f5f9] h-screen flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand/Station Header */}
          <div className="px-6 py-5 border-b border-[#f1f5f9] flex justify-between items-center bg-slate-50/50">
            <span className={`font-black tracking-tight text-[#0f172a] font-poppins transition-opacity ${
              sidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden'
            }`}>
              KITCHEN TERMINAL
            </span>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Active Chef Bio */}
          <div className={`p-4 border-b border-[#f1f5f9] flex items-center gap-3 ${
            sidebarOpen ? 'justify-start' : 'justify-center'
          }`}>
            <img src={activeChef.avatar} alt={activeChef.name} className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-100" />
            {sidebarOpen && (
              <div className="min-w-0">
                <h4 className="font-extrabold text-[#0f172a] text-[13.5px] truncate font-poppins leading-tight">{activeChef.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Active Station</p>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col gap-1.5 p-3 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = location.pathname === item.path || (item.path !== '/chef' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl font-semibold text-[13.5px] transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#f5f3ff] text-[#7c3aed] shadow-sm shadow-purple-500/[0.01]' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  } ${sidebarOpen ? 'justify-start px-4' : 'justify-center'}`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#7c3aed]' : 'text-slate-400'}`} />
                  {sidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                  {sidebarOpen && item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout button at bottom */}
        <div className="p-3 border-t border-[#f1f5f9]">
          <button
            onClick={logout}
            className={`flex items-center gap-3 p-3 rounded-xl font-bold text-[13.5px] text-red-500 hover:bg-red-50 w-full cursor-pointer ${
              sidebarOpen ? 'justify-start px-4' : 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5 text-red-500" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#fafafc] px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
