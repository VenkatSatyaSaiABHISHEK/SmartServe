import { useChefStore } from '../store/useChefStore';
import { TrendingUp, Flame, Star, Clock, Trophy, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PerformancePage() {
  const { chefs, orders } = useChefStore();

  // Calculate global kitchen stats
  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const avgPrepTime = completedOrders.length > 0
    ? Math.round(completedOrders.reduce((acc, curr) => acc + curr.prepTimeMins, 0) / completedOrders.length)
    : 12; // default mock fallback

  // Find top performing chef of the day based on rating and orders prepared
  const topChef = [...chefs].sort((a, b) => {
    // Score based on rating (70%) and volume (30%)
    const scoreA = a.rating * 10 + a.ordersPrepared * 0.1;
    const scoreB = b.rating * 10 + b.ordersPrepared * 0.1;
    return scoreB - scoreA;
  })[0];

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">KITCHEN PERFORMANCE ANALYTICS</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Real-time metrics, preparation speed averages, and service quality stats.
        </p>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm flex items-center gap-5">
          <div className="bg-[#f5f3ff] text-[#7c3aed] p-4 rounded-2xl shadow-inner shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Top Station Chef</span>
            <span className="text-lg font-black text-[#0f172a] font-poppins mt-1 block">{topChef?.name || 'Chef Ramsay'}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 block">Station: {topChef?.id}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm flex items-center gap-5">
          <div className="bg-[#eff6ff] text-[#3b82f6] p-4 rounded-2xl shadow-inner shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Cooking Time</span>
            <span className="text-2xl font-black text-[#0f172a] mt-1 block">{avgPrepTime} Mins</span>
            <span className="text-[10px] font-bold text-green-500 uppercase mt-0.5 block">-2.4 mins from last hour</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm flex items-center gap-5">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl shadow-inner shrink-0">
            <Star className="w-7 h-7 fill-emerald-500 stroke-emerald-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Service Rating Avg</span>
            <span className="text-2xl font-black text-[#0f172a] mt-1 block">4.8 / 5.0</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase mt-0.5 block">99.2% positive feedback</span>
          </div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Shift Cooking Volumes per Chef */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Shift Volume Distribution</h3>
            <BarChart2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-5.5">
            {chefs.map((chef) => {
              // Calculate width percentage based on max volume (max is Chef 1)
              const maxPrepared = Math.max(...chefs.map((c) => c.ordersPrepared));
              const widthPct = maxPrepared > 0 ? (chef.ordersPrepared / maxPrepared) * 100 : 0;

              return (
                <div key={chef.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <img src={chef.avatar} alt={chef.name} className="w-6 h-6 rounded-md object-cover" />
                      <span>{chef.name} ({chef.id})</span>
                    </div>
                    <span className="text-[#0f172a] font-black">{chef.ordersPrepared} orders</span>
                  </div>
                  <div className="w-full bg-slate-50 h-3.5 rounded-full overflow-hidden border border-[#f1f5f9]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph 2: Active Loads & Status Breakdown */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Cooking Efficiency Ratings</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-5.5">
            {chefs.map((chef) => {
              // Rating range: 4.0 - 5.0 maps to width
              const ratingPct = ((chef.rating - 4.0) / 1.0) * 100;

              return (
                <div key={chef.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <img src={chef.avatar} alt={chef.name} className="w-6 h-6 rounded-md object-cover" />
                      <span>{chef.name} ({chef.id})</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                      <span>{chef.rating}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-50 h-3.5 rounded-full overflow-hidden border border-[#f1f5f9]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratingPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Leadership Advice / Tip Section */}
      <div className="bg-[#fafafc] border border-[#f1f5f9] p-5 rounded-[22px] flex items-start gap-4">
        <div className="bg-purple-50 text-[#7c3aed] p-2.5 rounded-xl">
          <Flame className="w-5 h-5 text-[#7c3aed]" />
        </div>
        <div>
          <h4 className="font-extrabold text-[13.5px] text-[#0f172a] font-poppins">Kitchen Dispatch Tip:</h4>
          <p className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
            Ensure active meal components are checked off on the Preparing page to minimize miscommunicated platers. High ratings correlate directly with prompt waiter handovers under 12 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
