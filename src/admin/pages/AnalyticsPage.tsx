import { TrendingUp, Clock, DollarSign, Users, Award, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

export function AnalyticsPage() {
  const salesData = [
    { day: 'Mon', sales: 1200, percentage: 65 },
    { day: 'Tue', sales: 1450, percentage: 78 },
    { day: 'Wed', sales: 1100, percentage: 60 },
    { day: 'Thu', sales: 1600, percentage: 85 },
    { day: 'Fri', sales: 2200, percentage: 100 },
    { day: 'Sat', sales: 2400, percentage: 110 },
    { day: 'Sun', sales: 1800, percentage: 95 }
  ];

  const occupancyData = [
    { hour: '12 PM', occupancy: 40, percentage: 40 },
    { hour: '2 PM', occupancy: 60, percentage: 60 },
    { hour: '4 PM', occupancy: 30, percentage: 30 },
    { hour: '6 PM', occupancy: 85, percentage: 85 },
    { hour: '8 PM', occupancy: 95, percentage: 95 },
    { hour: '10 PM', occupancy: 75, percentage: 75 }
  ];

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">ANALYTICS & REPORTS</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Enterprise analytics reports, daily sales performance, and guest seating capacities.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { title: 'Gross Profit Margin', value: '72.4%', change: '+1.5% from Q1', icon: Percent, color: 'text-[#7c3aed] bg-[#f5f3ff]' },
          { title: 'Daily Guest Covers', value: '184 Pax', change: '+12% guest traffic', icon: Users, color: 'text-[#3b82f6] bg-[#eff6ff]' },
          { title: 'Average Ticket Value', value: '$48.50', change: '+3.20 upsell item rate', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
          { title: 'Average Table Turn', value: '52 Mins', change: '-4 mins from peak standard', icon: Clock, color: 'text-amber-600 bg-amber-50' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-[#f1f5f9] rounded-[24px] p-5.5 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-colors">
              <div className={`${stat.color} p-3 rounded-xl border border-black/[0.01]`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{stat.title}</span>
                <span className="text-xl font-black text-[#0f172a] font-poppins mt-0.5 block">{stat.value}</span>
                <span className="text-[10px] font-semibold text-slate-400/80 block mt-0.5">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales trend bar chart */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div>
              <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Weekly Sales Trends</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Revenue in USD</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          {/* Bar chart canvas */}
          <div className="h-64 flex items-end justify-between gap-4.5 pt-6 px-4">
            {salesData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                {/* Popover value */}
                <div className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded shadow-md transition-opacity leading-none">
                  ${data.sales}
                </div>
                {/* Bar */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${data.percentage}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="w-full bg-gradient-to-t from-slate-900 to-slate-700 rounded-t-lg group-hover:from-purple-600 group-hover:to-indigo-500 transition-colors"
                />
                {/* Label */}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy hourly chart */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div>
              <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Hourly Seating Occupancy</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Capacity utilization in percentage</p>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>

          {/* Hourly chart canvas */}
          <div className="h-64 flex items-end justify-between gap-4.5 pt-6 px-4">
            {occupancyData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded shadow-md transition-opacity leading-none">
                  {data.occupancy}%
                </div>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${data.percentage}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="w-full bg-gradient-to-t from-indigo-500 to-blue-500 rounded-t-lg group-hover:from-purple-600 group-hover:to-indigo-500 transition-colors"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">{data.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
