import { useWaiterStore } from '../store/useWaiterStore';
import { 
  TrendingUp, Clock, Award, Zap, ChevronRight, DollarSign, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export function PerformancePage() {
  const { waiter } = useWaiterStore();

  if (!waiter) return null;

  // Mock data for weekly earnings line chart (Mon to Sun)
  const earningsData = [45, 60, 55, 80, 75, 110, 95];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Map earnings to SVG coordinates
  // width: 320, height: 120
  // padding-x: 20, padding-y: 20
  const maxVal = Math.max(...earningsData);
  const minVal = Math.min(...earningsData);
  const range = maxVal - minVal;

  const points = earningsData.map((val, idx) => {
    const x = 20 + (idx * (280 / (earningsData.length - 1)));
    const y = 100 - ((val - minVal) / range) * 80;
    return `${x},${y}`;
  }).join(' ');

  const gridLines = Array.from({ length: 4 }).map((_, idx) => {
    const y = 20 + idx * 26.6;
    return y;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins">Analytics</h1>
        <p className="text-[#64748b] text-[13px] mt-0.5">Track your weekly performance, ratings, and tips.</p>
      </div>

      {/* SVG Line Chart Card */}
      <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-[#0f172a] text-[15px] font-poppins flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
              Weekly Tips Trend
            </h3>
            <p className="text-[12px] text-slate-400">Monday, June 08 - Sunday, June 14</p>
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
            +18.4%
          </span>
        </div>

        {/* Line Chart */}
        <div className="relative h-32 w-full mt-2 select-none">
          <svg className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {gridLines.map((y, idx) => (
              <line
                key={idx}
                x1="20"
                y1={y}
                x2="300"
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}
            
            {/* Smooth Line Path */}
            <motion.polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              points={points}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* Glowing dots */}
            {earningsData.map((val, idx) => {
              const x = 20 + (idx * (280 / (earningsData.length - 1)));
              const y = 100 - ((val - minVal) / range) * 80;
              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#2563eb"
                    className="cursor-pointer"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#2563eb"
                    fillOpacity="0.15"
                    className="animate-ping"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Days labels */}
        <div className="flex justify-between px-3.5 text-xs font-extrabold text-slate-400">
          {days.map((day, idx) => (
            <span key={idx} className="w-6 text-center">{day}</span>
          ))}
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4.5 rounded-[24px] border border-[#f1f5f9] shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider">Avg Speed</p>
            <p className="text-base font-black text-[#0f172a] mt-0.5">12 mins</p>
            <span className="text-[10px] text-green-500 font-bold">Fast (+2m)</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-[24px] border border-[#f1f5f9] shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 fill-amber-400/10" />
          </div>
          <div>
            <p className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider">Shifts</p>
            <p className="text-base font-black text-[#0f172a] mt-0.5">18 shifts</p>
            <span className="text-[10px] text-slate-400 font-bold">Active</span>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm">
        <h3 className="font-bold text-[#0f172a] text-[15px] font-poppins mb-4 flex items-center gap-1.5">
          <Zap className="w-4.5 h-4.5 text-amber-500 fill-amber-500/20" />
          Weekly Achievements
        </h3>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-start p-3 bg-indigo-50/20 border border-indigo-50/60 rounded-2xl">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 text-sm">🏆</div>
            <div>
              <h4 className="font-extrabold text-[#1e293b] text-[13px] leading-tight">Top Performer Badge</h4>
              <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                You are in the top 5% of service staff this week! Keep it up.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 bg-amber-50/15 border border-amber-50/60 rounded-2xl">
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl shrink-0 text-sm">⚡</div>
            <div>
              <h4 className="font-extrabold text-[#1e293b] text-[13px] leading-tight">Speedy Server</h4>
              <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                Your average collection-to-table delivery time is under 12 minutes.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 bg-blue-50/15 border border-blue-50/60 rounded-2xl">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl shrink-0 text-sm">⭐️</div>
            <div>
              <h4 className="font-extrabold text-[#1e293b] text-[13px] leading-tight">5-Star Customer Streak</h4>
              <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                Your last 12 delivered tables all submitted 5-star ratings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
