import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';
import { 
  LayoutDashboard, ClipboardList, Utensils, Calendar, Users, 
  ChefHat, UserSquare2, Tv, MonitorPlay, MessageSquare, 
  BarChart3, BellRing, UserCircle, Settings, LogOut, Menu, X, HelpCircle, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminLayout() {
  const { isAdminLoggedIn, logout, notifications } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auth Guard
  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
    }
  }, [isAdminLoggedIn, navigate]);

  if (!isAdminLoggedIn) return null;

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/orders', label: 'Live Orders', icon: ClipboardList },
    { path: '/admin/menu', label: 'Menu Manager', icon: Utensils },
    { path: '/admin/reservations', label: 'Reservations', icon: Calendar },
    { path: '/admin/qr', label: 'QR Generator', icon: QrCode },
    { path: '/admin/waiters', label: 'Waiters Log', icon: UserSquare2 },
    { path: '/admin/chefs', label: 'Chefs Log', icon: ChefHat },
    { path: '/admin/kds', label: 'Kitchen Mirror', icon: Tv },
    { path: '/admin/cameras', label: 'CCTV Feed', icon: MonitorPlay },
    { path: '/admin/feedback', label: 'Guest Reviews', icon: MessageSquare },
    { path: '/admin/analytics', label: 'Reports & Stats', icon: BarChart3 },
    { path: '/admin/notifications', label: 'Broadcast Center', icon: BellRing, badge: unreadNotifsCount, badgeColor: 'bg-red-500' },
    { path: '/admin/profile', label: 'Admin Profile', icon: UserCircle },
    { path: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] flex font-sans select-none overflow-hidden relative">
      {/* Admin Sidebar */}
      <aside 
        className={`bg-white border-r border-[#f1f5f9] h-screen flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5.5 border-b border-[#f1f5f9] flex justify-between items-center bg-slate-50/50 shrink-0">
            <span className={`font-black tracking-tight text-[15px] text-[#0f172a] font-poppins transition-opacity ${
              sidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden'
            }`}>
              HQ ERP PORTAL
            </span>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl font-bold text-[13.5px] transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  } ${sidebarOpen ? 'justify-start px-4' : 'justify-center'}`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
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

          {/* Sign Out */}
          <div className="p-3 border-t border-[#f1f5f9] shrink-0">
            <button
              onClick={logout}
              className={`flex items-center gap-3 p-3 rounded-xl font-bold text-[13.5px] text-red-500 hover:bg-red-50 w-full cursor-pointer ${
                sidebarOpen ? 'justify-start px-4' : 'justify-center'
              }`}
            >
              <LogOut className="w-4.5 h-4.5 shrink-0" />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar */}
        <header className="h-16 border-b border-[#f1f5f9] bg-white px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live System Sync Connected</span>
          </div>
          
          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <span className="block text-xs font-black text-[#0f172a] font-poppins">Admin Portal</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Role: Head Manager</span>
            </div>
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs font-poppins shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Pages Area */}
        <main className="flex-1 overflow-y-auto bg-[#fafafc] px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
