import { useAdminStore } from '../store/useAdminStore';
import { useChefStore } from '../../chef/store/useChefStore';
import { 
  TrendingUp, Users, Utensils, DollarSign, Calendar, Star,
  Bell, AlertCircle, ShoppingBag, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardPage() {
  const { menuItems, reservations, notifications } = useAdminStore();
  const chefOrders = useChefStore(state => state.orders);

  // Financial Metrics calculations
  const totalSalesVal = 14285.50;
  const salesToday = 1432.20;
  const salesThisWeek = 9820.80;
  
  // Total orders completed
  const completedOrders = chefOrders.filter(o => o.status === 'Completed').length;
  
  // Popular items calculated from menu items & mock percentages
  const popularDishes = [
    { name: 'Truffle Mushroom Risotto', count: 148, revenue: 3698.52, percentage: 92 },
    { name: 'Wagyu Beef Burger', count: 124, revenue: 3658.00, percentage: 80 },
    { name: 'Hyderabadi Dum Biryani', count: 110, revenue: 2420.00, percentage: 71 },
    { name: 'Artisan Burrata', count: 85, revenue: 1402.50, percentage: 55 }
  ];

  return (
    <div className="space-y-7 pb-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">ERP EXECUTIVE HUB</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Restaurant overview, financial logs, and active client statistics.</p>
        </div>
        <div className="text-xs font-bold text-slate-500 bg-white border border-[#f1f5f9] px-4 py-2.5 rounded-[15px] shadow-sm">
          Shift Date: <span className="text-[#0f172a] font-black">June 9, 2026</span>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Total Revenue', value: `$${totalSalesVal.toLocaleString()}`, change: '+14% from last month', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
          { title: 'Sales Today', value: `$${salesToday.toLocaleString()}`, change: '+4.2% since morning', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Orders Cooked Today', value: completedOrders, change: `${chefOrders.filter(o => o.status !== 'Completed').length} orders in progress`, icon: Utensils, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Pending Bookings', value: reservations.filter(r => r.status === 'Pending').length, change: 'For tomorrow/weekend', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.title}</span>
                <div className={`${item.bg} ${item.color} p-2 rounded-xl border border-black/[0.01]`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-[#0f172a] font-poppins">{item.value}</span>
                <span className="block text-[10.5px] font-bold text-slate-400 mt-1">{item.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Graphs and Feeds Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Popular Dishes Chart */}
        <div className="lg:col-span-2 bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Dishes Volume Leaders</h3>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">Popularity Index</span>
          </div>

          <div className="space-y-5">
            {popularDishes.map((dish, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="text-[#0f172a] truncate max-w-[240px]">{dish.name}</span>
                  <div className="text-right">
                    <span className="text-[#0f172a] font-black">{dish.count} orders </span>
                    <span className="text-slate-400">(${dish.revenue.toFixed(2)})</span>
                  </div>
                </div>
                <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-[#f1f5f9]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dish.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-slate-900 to-slate-700 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Logs Feed */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="space-y-5">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">HQ Security Alerts</h3>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 text-xs font-bold text-slate-600">
                  <div className="mt-0.5 bg-red-50 text-red-500 p-1.5 rounded-lg border border-red-100/50 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[#0f172a] truncate font-extrabold">{notif.title}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{notif.message}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-auto">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Terminal status: Online</span>
            <span>Version ERP 1.4.0</span>
          </div>
        </div>

      </div>

      {/* Live Order Workflow Progress Board */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">KITCHEN WORKFLOW PIPELINE</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Real-time status tracking of cooking cycles and delivery queues.</p>
          </div>
          
          {/* Progress Bar completed vs total */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100/60 p-2.5 rounded-xl self-start">
            <span className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider">Overall Dispatch:</span>
            <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${chefOrders.length > 0 ? (chefOrders.filter(o => o.status === 'Completed').length / chefOrders.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[11px] font-black text-slate-700">
              {chefOrders.filter(o => o.status === 'Completed').length}/{chefOrders.length} Done
            </span>
          </div>
        </div>

        {/* 4 Pipeline Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['New', 'Preparing', 'Ready', 'Completed'] as const).map((stage) => {
            const stageOrders = chefOrders.filter(o => o.status === stage);
            
            const styles = {
              'New': { headerBg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500', label: 'Incoming Tickets' },
              'Preparing': { headerBg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500', label: 'Chef Stirring' },
              'Ready': { headerBg: 'bg-green-50 text-green-600', dot: 'bg-green-500', label: 'Pass Counter' },
              'Completed': { headerBg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-500', label: 'Dispatched' }
            }[stage];

            return (
              <div key={stage} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 flex flex-col min-h-[200px]">
                {/* Column Header */}
                <div className={`flex items-center justify-between p-2 rounded-xl mb-3.5 ${styles.headerBg} font-black text-[10.5px] uppercase tracking-wider`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                    <span>{stage}</span>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded-md text-[9px] shadow-sm">{stageOrders.length}</span>
                </div>

                <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2.5">{styles.label}</div>

                {/* Orders List */}
                <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[220px] scrollbar-none">
                  {stageOrders.length === 0 ? (
                    <div className="text-center py-6 text-slate-300 text-[10px] font-bold border border-dashed border-slate-200/50 rounded-xl flex-1 flex items-center justify-center">
                      Empty
                    </div>
                  ) : (
                    stageOrders.map(order => (
                      <div key={order.id} className="bg-white border border-slate-100 shadow-sm p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-[#0f172a] text-xs">#{order.id}</span>
                          <span className="bg-slate-100 text-slate-600 border border-slate-100/60 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            T {order.tableNumber}
                          </span>
                        </div>

                        {/* Dishes list */}
                        <div className="space-y-0.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[10px] font-semibold text-slate-600">
                              <span className="truncate max-w-[120px]">{item.name}</span>
                              <span className="text-slate-400">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Stats */}
                        <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-[9px] font-bold text-slate-400 uppercase">
                          <span>Prep: {order.prepTimeMins}m</span>
                          <span>{order.timeReceived}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent reservations grid map preview */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Active Floor Bookings</h3>
          <span className="text-[10.5px] font-bold text-slate-400">Total Reservations Confirmed: {reservations.filter(r => r.status === 'Confirmed').length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {reservations.slice(0, 4).map((res) => (
            <div key={res.id} className="bg-[#fafafc] border border-[#f1f5f9] rounded-2xl p-4.5 space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-black text-xs text-[#0f172a] truncate max-w-[120px]">{res.customerName}</span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  res.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  res.status === 'Completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                  res.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {res.status}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 space-y-1">
                <div>Table {res.tableNumber} • {res.guestCount} Guests</div>
                <div>Time: {res.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
