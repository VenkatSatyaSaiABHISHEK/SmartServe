import { useChefStore } from '../store/useChefStore';
import { ChefHat, TrendingUp, Flame, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardPage() {
  const { chefs, orders } = useChefStore();

  // Kitchen Metrics
  const totalIncoming = orders.length;
  const pendingCount = orders.filter(o => o.status === 'New').length;
  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const readyCount = orders.filter(o => o.status === 'Ready').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;

  // Determine which chef will receive the NEXT order based on load balancing algorithm:
  // Chef 1 gets it if load < 2, then Chef 2 if load < 2, then Chef 3 if load < 2. Otherwise lowest load.
  const getChefActiveLoad = (chefId: string) => {
    return orders.filter(o => 
      o.assignedChefId === chefId && (o.status === 'New' || o.status === 'Preparing')
    ).length;
  };

  const c1Load = getChefActiveLoad('C1');
  const c2Load = getChefActiveLoad('C2');
  const c3Load = getChefActiveLoad('C3');

  let nextChefId = 'C1';
  let routingReason = '';

  if (c1Load < 2) {
    nextChefId = 'C1';
    routingReason = 'Chef 1 workload is under the threshold (< 2 active orders)';
  } else if (c2Load < 2) {
    nextChefId = 'C2';
    routingReason = 'Chef 1 is FULL (>= 2). Cascading to Chef 2 (under threshold)';
  } else if (c3Load < 2) {
    nextChefId = 'C3';
    routingReason = 'Chef 1 and Chef 2 are FULL (>= 2). Cascading to Chef 3 (under threshold)';
  } else {
    // Fallback: assign to the chef with the absolute lowest active workload
    const loads = [
      { id: 'C1', load: c1Load },
      { id: 'C2', load: c2Load },
      { id: 'C3', load: c3Load }
    ];
    loads.sort((a, b) => a.load - b.load);
    nextChefId = loads[0].id;
    routingReason = `All Chefs are busy (>= 2). Fallback routing to absolute lowest workload: ${chefs.find(c => c.id === nextChefId)?.name} (${loads[0].load} active)`;
  }

  const nextChef = chefs.find(c => c.id === nextChefId);

  return (
    <div className="space-y-7 pb-10">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">KITCHEN MONITOR & LOAD BALANCER</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Live KDS Node Workloads and Routing Analytics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#7c3aed] border border-purple-100 rounded-[15px] text-[12.5px] font-bold">
          <Sparkles className="w-4 h-4 animate-spin-slow text-purple-500" />
          <span>Load Balancing System: ACTIVE</span>
        </div>
      </div>

      {/* Metrics Counters Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Kitchen Orders', count: totalIncoming, color: 'text-purple-600', bg: 'bg-purple-50' },
          { title: 'New (Assigned)', count: pendingCount, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Preparing', count: preparingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Ready for Pickup', count: readyCount, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Completed Today', count: completedCount, color: 'text-slate-600', bg: 'bg-slate-50' }
        ].map((item, idx) => (
          <div key={idx} className={`${item.bg} p-5 rounded-[22px] border border-black/[0.02] flex flex-col justify-between min-h-[110px]`}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-snug">{item.title}</span>
            <span className={`text-3xl font-black ${item.color} mt-2`}>{item.count}</span>
          </div>
        ))}
      </div>

      {/* Load Balancing Router Info Banner */}
      <div className="bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white p-5 rounded-[24px] shadow-lg shadow-purple-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-2.5 rounded-xl border border-white/20">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] font-poppins tracking-wide">Next Order Auto-Routing Target</h3>
            <p className="text-xs text-white/80 font-medium mt-1 leading-relaxed">{routingReason}</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl self-stretch md:self-auto justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Directing To:</span>
          <div className="flex items-center gap-2">
            <img src={nextChef?.avatar} alt={nextChef?.name} className="w-7 h-7 rounded-lg object-cover border border-white/20" />
            <span className="font-black text-xs">{nextChef?.name}</span>
          </div>
        </div>
      </div>

      {/* Live Side-by-Side Station Monitors */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {chefs.map((chef) => {
          const chefActiveOrders = orders.filter(o => o.assignedChefId === chef.id && o.status !== 'Completed');
          const chefLoad = chefActiveOrders.length;
          const isFull = chefLoad >= 2;

          return (
            <div key={chef.id} className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm flex flex-col h-[520px]">
              {/* Chef Header */}
              <div className="p-5 border-b border-[#f1f5f9] bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={chef.avatar} alt={chef.name} className="w-12 h-12 rounded-[16px] object-cover shadow-sm border border-slate-200" />
                  <div>
                    <h4 className="font-extrabold text-[15px] text-[#0f172a] font-poppins leading-tight">{chef.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">{chef.id} Station</span>
                  </div>
                </div>
                <div className="text-right">
                  {/* Status Badge */}
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    isFull 
                      ? 'bg-red-50 text-red-500 border border-red-100' 
                      : 'bg-green-50 text-green-500 border border-green-100'
                  }`}>
                    {isFull ? 'STATION FULL' : 'READY TO TAKE'}
                  </span>
                  <div className="text-[11px] font-bold text-slate-400 mt-2">
                    Load: <span className="font-black text-[#0f172a]">{chefLoad}/2</span>
                  </div>
                </div>
              </div>

              {/* Order Queue Container */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-[#fcfcfe]/60">
                {chefActiveOrders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <ChefHat className="w-12 h-12 stroke-[1.2] text-slate-300 mb-3" />
                    <p className="text-xs font-bold">No Active Orders Assigned</p>
                    <p className="text-[10px] font-semibold text-slate-400/80 mt-1 max-w-[200px] leading-relaxed">
                      Orders balancing will auto-route to this queue when loads dictate.
                    </p>
                  </div>
                ) : (
                  chefActiveOrders.map((order) => {
                    const statusColors = {
                      'New': 'bg-blue-50 text-blue-600 border border-blue-100',
                      'Preparing': 'bg-amber-50 text-amber-600 border border-amber-100',
                      'Ready': 'bg-green-50 text-green-600 border border-green-100',
                      'Picked Up': 'bg-purple-50 text-purple-600 border border-purple-100',
                      'Completed': 'bg-slate-50 text-slate-500 border border-slate-100',
                      'Delivered': 'bg-slate-50 text-slate-500 border border-slate-105'
                    };

                    return (
                      <div 
                        key={order.id}
                        className="bg-white border border-[#f1f5f9] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-black text-sm text-[#0f172a] tracking-tight">{order.id}</span>
                            <span className="text-[11px] font-bold text-slate-400 ml-2">Table {order.tableNumber}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs font-bold text-slate-600">
                              <span className="truncate max-w-[170px]">{item.name}</span>
                              <span className="text-slate-400">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Prep progress bar */}
                        <div className="pt-2 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>Prep Time: {order.prepTimeMins} mins</span>
                          <span>{order.timeReceived}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Station Footer Stats */}
              <div className="p-4.5 border-t border-[#f1f5f9] bg-slate-50/50 flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Completed Shift Orders:</span>
                <span className="font-black text-[#0f172a] text-sm">{chef.ordersPrepared}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
