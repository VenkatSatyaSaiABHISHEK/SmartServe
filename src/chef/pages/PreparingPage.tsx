import { useState, useEffect } from 'react';
import { useChefStore } from '../store/useChefStore';
import { Flame, Clock, Coffee, Clipboard, User, Play, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PreparingPage() {
  const { activeChef, orders, markReady, startPreparing } = useChefStore();
  const [now, setNow] = useState(Date.now());

  // Tick the local state timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!activeChef) return null;

  // Filter orders assigned to this chef
  const chefOrders = orders.filter((o) => o.assignedChefId === activeChef.id);
  const activeOrder = chefOrders.find((o) => o.status === 'Preparing');
  const pendingOrders = chefOrders.filter((o) => o.status === 'New').sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const readyOrders = chefOrders.filter((o) => o.status === 'Ready');

  const onBreak = activeChef.breakUntil && now < activeChef.breakUntil;
  const breakSecondsLeft = onBreak ? Math.max(0, Math.round((activeChef.breakUntil! - now) / 1000)) : 0;

  // Formatting helper for MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate cooking progress
  let secondsLeft = 0;
  let totalSeconds = 0;
  let elapsedPercent = 0;

  if (activeOrder && activeOrder.completedAt && activeOrder.startedPreparingAt) {
    totalSeconds = Math.round((activeOrder.completedAt - activeOrder.startedPreparingAt) / 1000);
    secondsLeft = Math.max(0, Math.round((activeOrder.completedAt - now) / 1000));
    elapsedPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  }

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-[28px] border border-[#f1f5f9] shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={activeChef.avatar} 
              alt={activeChef.name} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/20"
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              onBreak ? 'bg-indigo-500' : activeOrder ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800 font-poppins">{activeChef.name}</h1>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {activeChef.id}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{activeChef.section || 'Kitchen Station'}</p>
          </div>
        </div>

        {/* Global Station Status */}
        <div className="flex items-center gap-3">
          {onBreak ? (
            <div className="flex items-center gap-2.5 px-4.5 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-xs font-black uppercase tracking-wider">
              <Coffee className="w-4 h-4 text-indigo-500 animate-bounce" />
              <span>ON BREAK ({formatTime(breakSecondsLeft)})</span>
            </div>
          ) : activeOrder ? (
            <div className="flex items-center gap-2.5 px-4.5 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl text-xs font-black uppercase tracking-wider">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>COOKING ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4.5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-xs font-black uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>STANDBY AVAILABLE</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Console Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Large Active Workspace (Cooking Timer / Break Timer) */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* Break Time Screen */}
            {onBreak && (
              <motion.div
                key="break-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-[#f1f5f9] rounded-[36px] p-8 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[420px] text-center"
              >
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.04),transparent_60%)]" />
                
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex p-6 bg-indigo-50 text-indigo-500 border border-indigo-100 rounded-[28px] animate-pulse">
                    <Coffee className="w-16 h-16 stroke-[1.2]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black font-poppins tracking-wide text-slate-800">Chef's Recuperation Break</h2>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto font-medium">
                      5-minute rest period. Next order in your queue will automatically begin once break ends.
                    </p>
                  </div>
                  
                  {/* Break Timer Countdown */}
                  <div className="py-2">
                    <span className="text-7xl font-black font-poppins tracking-wider text-[#7c3aed] select-none">
                      {formatTime(breakSecondsLeft)}
                    </span>
                    <span className="block text-[10px] uppercase tracking-widest font-black text-indigo-500 mt-2">
                      Seconds Remaining
                    </span>
                  </div>

                  {/* Progress bar for break */}
                  <div className="w-64 bg-slate-100 h-2 rounded-full overflow-hidden mx-auto border border-slate-200/50">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: `${(breakSecondsLeft / 300) * 100}%` }}
                      transition={{ ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Cooking Ticket */}
            {!onBreak && activeOrder && (
              <motion.div
                key="cooking-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-[#f1f5f9] rounded-[36px] p-8 shadow-sm flex flex-col justify-between min-h-[420px] relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-slate-800 font-poppins tracking-tight">
                        {activeOrder.id}
                      </span>
                      <span className="text-xs font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-xl border border-orange-100 flex items-center gap-1.5 uppercase">
                        <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                        Cooking
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      Received at {activeOrder.timeReceived}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xl font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100 shadow-sm block">
                      Table {activeOrder.tableNumber}
                    </span>
                  </div>
                </div>

                {/* Body: Prep Countdown Timer & Progress Bar */}
                <div className="flex flex-col md:flex-row items-center gap-8 py-8">
                  {/* Progress Circle & Text Countdown */}
                  <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="78"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="88"
                        cy="88"
                        r="78"
                        fill="none"
                        stroke="url(#cook-gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "490", strokeDashoffset: "490" }}
                        animate={{ strokeDashoffset: 490 - (490 * elapsedPercent) / 100 }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                      <defs>
                        <linearGradient id="cook-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-800 font-poppins tracking-tight">
                        {formatTime(secondsLeft)}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Time Remaining
                      </span>
                    </div>
                  </div>

                  {/* Cooking Details & Automatic Progress Checklist */}
                  <div className="flex-1 space-y-4.5 w-full">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400 tracking-wider">
                      <span>Recipe Itemization</span>
                      <span className="text-orange-500">Total Prep Time: {activeOrder.prepTimeMins}m</span>
                    </div>
                    
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {activeOrder.items.map((item, idx) => {
                        // Let's create a mock automated cook checklist:
                        // As time progresses, checking items sequentially
                        // E.g. Item 1 completes in first half, Item 2 completes in second half
                        const itemThreshold = (idx + 1) * (totalSeconds / activeOrder.items.length);
                        const elapsedSecs = totalSeconds - secondsLeft;
                        const isItemAutoCooked = elapsedSecs >= itemThreshold;

                        return (
                          <div 
                            key={idx} 
                            className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all ${
                              isItemAutoCooked 
                                ? 'bg-emerald-50/40 border-emerald-100 text-slate-400' 
                                : 'bg-[#fafafc] border-[#f1f5f9] text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                isItemAutoCooked 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'bg-white border-slate-200 text-transparent'
                              }`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[13.5px] font-extrabold truncate max-w-[200px] ${
                                isItemAutoCooked ? 'line-through text-slate-400' : ''
                              }`}>
                                {item.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-lg ${
                                isItemAutoCooked ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-[#f1f5f9] text-amber-500'
                              }`}>
                                {isItemAutoCooked ? 'COCKED' : 'COOKING'}
                              </span>
                              <span className="text-[13px] font-black text-slate-400">
                                x{item.quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer and Debug Override button */}
                <div className="border-t border-slate-50 pt-4 flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Station: {activeChef.id}</span>
                  </div>
                  
                  {/* Manual testing trigger button (styled small) */}
                  <button 
                    onClick={() => markReady(activeOrder.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10.5px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Force Mark Ready (Manual Override)
                  </button>
                </div>
              </motion.div>
            )}

            {/* Standby/Empty Screen */}
            {!onBreak && !activeOrder && (
              <motion.div
                key="standby-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-[#f1f5f9] rounded-[36px] p-8 shadow-sm flex flex-col items-center justify-center min-h-[420px] text-center"
              >
                <div className="inline-flex p-6 bg-slate-50 text-slate-400 border border-slate-100 rounded-[28px] mb-5">
                  <Flame className="w-12 h-12 stroke-[1.2]" />
                </div>
                <h3 className="text-lg font-black text-slate-800 font-poppins">All Dishes Plated</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1 max-w-xs mx-auto leading-relaxed">
                  Your cooking terminal is currently standby. Incoming orders assigned to your station will automatically start preparation.
                </p>
                
                {/* Manual Start button for any New orders */}
                {pendingOrders.length > 0 && (
                  <button 
                    onClick={() => startPreparing(pendingOrders[0].id)}
                    className="mt-6 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Next Order Now
                  </button>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Side: Upcoming Queue & Counter Pass */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Queue */}
          <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-slate-400" />
                <h3 className="text-[13.5px] font-black text-slate-800 uppercase tracking-wider">Upcoming Queue</h3>
              </div>
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                {pendingOrders.length} Tickets
              </span>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {pendingOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  Queue is clear.
                </div>
              ) : (
                pendingOrders.map((order, idx) => (
                  <div key={order.id} className="bg-[#fafafc] border border-[#f1f5f9] rounded-2xl p-4 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-800">{order.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Table {order.tableNumber}</span>
                      </div>
                      <p className="text-[11.5px] font-extrabold text-slate-500 truncate mt-1">
                        {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md block text-center">
                        ⏱️ {order.prepTimeMins}m
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 mt-1 block uppercase">
                        {idx === 0 ? 'Up Next' : `Wait #${idx}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Plated Awaiting Pickup (Ready) */}
          <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className="text-[13.5px] font-black text-slate-800 uppercase tracking-wider">Awaiting Pickup</h3>
              </div>
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full">
                {readyOrders.length} Plated
              </span>
            </div>

            <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
              {readyOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  Counter is clear.
                </div>
              ) : (
                readyOrders.map((order) => (
                  <div key={order.id} className="bg-emerald-50/10 border border-emerald-100/40 rounded-2xl p-4 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-emerald-700">{order.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Table {order.tableNumber}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 truncate mt-1">
                        {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    
                    <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                      Ready 🛎️
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
