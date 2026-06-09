import { Link, useNavigate } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { 
  CheckCircle2, DollarSign, Star, ClipboardList, Grid, ChevronRight, Bell, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardPage() {
  const { waiter, orders, notifications, toggleOnlineStatus, markNotificationRead } = useWaiterStore();
  const navigate = useNavigate();

  if (!waiter) return null;

  // Active orders assigned to the waiter
  const activeOrders = orders.filter(o => o.status !== 'Delivered');

  // Filter recent 3 notifications
  const recentNotifications = notifications.slice(0, 3);

  // Calculations for wages/earnings (e.g. $8 base wage per delivery + tips)
  const baseSalary = waiter.totalDeliveries * 8;
  const totalEarnings = baseSalary + waiter.todayTips;

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top Banner Greetings */}
      <div>
        <h1 className="text-[26px] font-black text-[#0f172a] leading-tight font-poppins">
          Hello, {waiter.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-[#64748b] text-[14px] mt-0.5">
          {waiter.onlineStatus ? 'You are active and receiving table alerts.' : 'You are offline. Turn on status to receive alerts.'}
        </p>
      </div>

      {/* Online Status Toggle Panel */}
      <div className="bg-white p-4 rounded-[24px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-3.5 h-3.5 rounded-full ${waiter.onlineStatus ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
          <div>
            <p className="text-[#1e293b] font-bold text-[14px]">Terminal Availability</p>
            <p className="text-[12px] text-slate-500">{waiter.onlineStatus ? 'Online & Active' : 'Offline (Busy)'}</p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button 
          onClick={toggleOnlineStatus}
          className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
            waiter.onlineStatus ? 'bg-[#7c3aed]' : 'bg-slate-200'
          }`}
        >
          <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform duration-300 ${
            waiter.onlineStatus ? 'translate-x-[22px]' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-[22px] border border-[#f1f5f9] shadow-sm flex flex-col justify-between h-28">
          <div className="w-8 h-8 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider">Deliveries</p>
            <p className="text-lg font-black text-[#0f172a]">{waiter.totalDeliveries}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[22px] border border-[#f1f5f9] shadow-sm flex flex-col justify-between h-28">
          <div className="w-8 h-8 bg-purple-50 text-[#7c3aed] rounded-xl flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider">Tips Today</p>
            <p className="text-lg font-black text-[#0f172a]">${waiter.todayTips.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[22px] border border-[#f1f5f9] shadow-sm flex flex-col justify-between h-28">
          <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider">Rating</p>
            <p className="text-lg font-black text-[#0f172a]">{waiter.rating}</p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="flex flex-col gap-3">
        <Link 
          to="/waiter/assigned"
          className="bg-white p-4 rounded-[24px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#1e293b] font-bold text-[14px]">Assigned Orders</p>
              <p className="text-[12px] text-slate-500">
                {activeOrders.length === 0 ? 'No active orders' : `${activeOrders.length} orders in progress`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeOrders.length > 0 && (
              <span className="bg-[#7c3aed] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {activeOrders.length}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link 
          to="/waiter/tables"
          className="bg-white p-4 rounded-[24px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#1e293b] font-bold text-[14px]">Active Table Layout</p>
              <p className="text-[12px] text-slate-500">Monitor dining floor statuses</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Recent Alerts Feed */}
      <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#0f172a] text-[15px] font-poppins flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-[#7c3aed]" />
            Recent Terminal Alerts
          </h3>
          <Link to="/waiter/notifications" className="text-xs font-bold text-[#7c3aed] hover:underline">
            View All
          </Link>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="text-center py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
            <AlertCircle className="w-8 h-8 stroke-[1.5]" />
            <p className="text-xs font-medium">No recent alerts received</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentNotifications.map((noti) => (
              <div 
                key={noti.id}
                onClick={() => markNotificationRead(noti.id)}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-all cursor-pointer ${
                  noti.read 
                    ? 'bg-slate-50/50 border-slate-100/60 opacity-60' 
                    : 'bg-purple-50/10 border-purple-50/60 shadow-[0_2px_8px_rgba(124,58,237,0.02)] hover:border-purple-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-[12.5px] leading-tight font-medium ${noti.read ? 'text-[#64748b]' : 'text-[#1e293b]'}`}>
                    {noti.message}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                    {noti.time}
                  </span>
                </div>
                {!noti.read && (
                  <span className="w-2 h-2 rounded-full bg-[#7c3aed] mt-1.5 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
