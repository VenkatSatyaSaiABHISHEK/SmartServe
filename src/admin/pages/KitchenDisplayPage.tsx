import { useState, useEffect } from 'react';
import { useChefStore } from '../../chef/store/useChefStore';
import { ChefHat, Flame, Coffee, CheckCircle, Clock, Send, AlertTriangle, ArrowRight } from 'lucide-react';

export function KitchenDisplayPage() {
  const { chefs, orders } = useChefStore();
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [now, setNow] = useState(Date.now());

  // Tick the local state timer every second and subscribe to chefs/orders
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    
    const unsubChefs = useChefStore.getState().listenToChefs();
    const unsubOrders = useChefStore.getState().listenToOrders();
    
    return () => {
      clearInterval(interval);
      if (unsubChefs) unsubChefs();
      if (unsubOrders) unsubOrders();
    };
  }, []);

  const getChefActiveOrders = (chefId: string) => {
    return orders.filter(o => o.assignedChefId === chefId && o.status !== 'Completed');
  };

  const handleSendChefAlert = (chefId: string) => {
    const text = messages[chefId];
    if (!text) return;
    alert(`Alert sent to ${chefs.find(c => c.id === chefId)?.name} KDS screen: "${text}" 💬`);
    setMessages(prev => ({ ...prev, [chefId]: '' }));
  };

  // Helper to format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filters for orders log
  const incomingOrders = orders.filter(o => o.status === 'New').sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const readyOrders = orders.filter(o => o.status === 'Ready').sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <div className="min-h-screen bg-[#fafafc] text-[#0f172a] p-6 space-y-6 font-sans">
      
      {/* KDS TV Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-[#f1f5f9] rounded-3xl p-6 gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-550/10 text-purple-600 border border-purple-500/20 rounded-2xl">
              <ChefHat className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight font-poppins text-[#0f172a] uppercase">Kitchen Display System (KDS)</h1>
              <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">HQ Big-TV Command Console Mirror</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold">
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-slate-600">Live Station Ticker Sync: Active</span>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Main KDS Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Chef Stations (Col span 8) */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {chefs.map((chef) => {
            const activeOrders = getChefActiveOrders(chef.id);
            const activeOrder = activeOrders.find(o => o.status === 'Preparing');
            const queueOrders = activeOrders.filter(o => o.status === 'New');
            
            const onBreak = chef.breakUntil && now < chef.breakUntil;
            const breakSecsLeft = onBreak ? Math.max(0, Math.round((chef.breakUntil! - now) / 1000)) : 0;

            let cookSecsLeft = 0;
            let cookElapsedPercent = 0;
            if (activeOrder && activeOrder.completedAt && activeOrder.startedPreparingAt) {
              const totalSecs = Math.round((activeOrder.completedAt - activeOrder.startedPreparingAt) / 1000);
              cookSecsLeft = Math.max(0, Math.round((activeOrder.completedAt - now) / 1000));
              cookElapsedPercent = totalSecs > 0 ? ((totalSecs - cookSecsLeft) / totalSecs) * 100 : 0;
            }

            return (
              <div key={chef.id} className="bg-white border border-[#f1f5f9] rounded-[32px] overflow-hidden flex flex-col h-[560px] justify-between shadow-sm">
                
                {/* Station Title Banner */}
                <div>
                  <div className="p-4 border-b border-[#f1f5f9] bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={chef.avatar} alt={chef.name} className="w-10 h-10 rounded-xl object-cover border border-[#f1f5f9]" />
                      <div>
                        <h4 className="font-extrabold text-[13.5px] text-[#0f172a] font-poppins leading-tight">{chef.name}</h4>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 block">{chef.id} Terminal</span>
                      </div>
                    </div>
                    
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                      onBreak ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                      activeOrder ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {onBreak ? 'BREAK' : activeOrder ? 'COOKING' : 'STANDBY'}
                    </span>
                  </div>

                  {/* Active Station State Screen */}
                  <div className="p-4 border-b border-[#f1f5f9] bg-slate-50/20 min-h-[170px] flex items-center justify-center">
                    {onBreak ? (
                      <div className="text-center space-y-2.5 w-full">
                        <div className="inline-flex p-3 bg-indigo-50 text-indigo-500 border border-indigo-100 rounded-2xl animate-bounce">
                          <Coffee className="w-6 h-6" />
                        </div>
                        <h5 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Chef Recuperation</h5>
                        <p className="text-3xl font-black text-[#0f172a] font-poppins">{formatTime(breakSecsLeft)}</p>
                        <div className="w-40 bg-slate-200 h-1.5 rounded-full overflow-hidden mx-auto">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${(breakSecsLeft / 120) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : activeOrder ? (
                      <div className="w-full flex items-center gap-4">
                        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                          {/* Circle countdown */}
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="48" cy="48" r="40" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                            <circle 
                              cx="48" 
                              cy="48" 
                              r="40" 
                              fill="none" 
                              stroke="#f59e0b" 
                              strokeWidth="4" 
                              strokeLinecap="round"
                              strokeDasharray="251"
                              strokeDashoffset={251 - (251 * cookElapsedPercent) / 100}
                            />
                          </svg>
                          <span className="text-lg font-black text-slate-800 font-poppins">{formatTime(cookSecsLeft)}</span>
                        </div>
                        
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-orange-600">{activeOrder.id}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">T{activeOrder.tableNumber}</span>
                          </div>
                          <div className="max-h-[60px] overflow-y-auto space-y-0.5 pr-1">
                            {activeOrder.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] font-semibold text-slate-600">
                                <span className="truncate">{item.name}</span>
                                <span className="text-slate-400">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 space-y-2">
                        <div className="inline-flex p-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-2xl">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Station Standby</h5>
                        <p className="text-[10px] font-semibold text-slate-400/80 max-w-[170px] mx-auto">Idle & ready to receive load balanced orders.</p>
                      </div>
                    )}
                  </div>

                  {/* Active station queue log */}
                  <div className="p-4 space-y-3.5">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Queue Roster ({queueOrders.length})</h5>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {queueOrders.length === 0 ? (
                        <p className="text-[11px] font-bold text-slate-400 italic">No pending queues.</p>
                      ) : (
                        queueOrders.map((order) => (
                          <div key={order.id} className="bg-[#fafafc] border border-[#f1f5f9] rounded-xl p-2.5 flex justify-between items-center text-xs">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-[#0f172a]">{order.id}</span>
                                <span className="text-[9px] font-bold text-slate-400">Table {order.tableNumber}</span>
                              </div>
                              <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                                {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                              </p>
                            </div>
                            <span className="text-[9px] font-black text-slate-500 bg-white border border-[#f1f5f9] px-1.5 py-0.5 rounded">
                              ⏱️ {order.prepTimeMins}m
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Station Messaging Box */}
                <div className="p-4 border-t border-[#f1f5f9] bg-[#fafafc]/40 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Alert ${chef.name}...`}
                    value={messages[chef.id] || ''}
                    onChange={(e) => setMessages(prev => ({ ...prev, [chef.id]: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0f172a] placeholder-slate-450 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleSendChefAlert(chef.id)}
                    className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] p-2 rounded-xl cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Side Feeds (Col span 4) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Incoming Orders Feed */}
          <div className="bg-white border border-[#f1f5f9] rounded-[32px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-black uppercase text-[#0f172a] tracking-widest">Incoming Orders</h3>
              </div>
              <span className="text-[10px] font-black bg-blue-550/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-md">
                {incomingOrders.length} Pending
              </span>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {incomingOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold italic">
                  No incoming orders pending.
                </div>
              ) : (
                incomingOrders.map((order) => (
                  <div key={order.id} className="bg-[#fafafc] border border-[#f1f5f9] rounded-2xl p-3.5 flex justify-between items-center gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-blue-650">{order.id}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">T{order.tableNumber}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-650 truncate">
                        {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    
                    <div className="shrink-0 text-right">
                      <span className="text-[9.5px] font-black bg-white border border-[#f1f5f9] text-slate-600 px-2 py-0.5 rounded-md block">
                        ⏱️ {order.prepTimeMins}m
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase mt-1.5 block">
                        {chefs.find(c => c.id === order.assignedChefId)?.name || 'Assigned'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Plated / Ready Pass-through Feed */}
          <div className="bg-white border border-[#f1f5f9] rounded-[32px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black uppercase text-[#0f172a] tracking-widest">Awaiting pickup pass</h3>
              </div>
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md">
                {readyOrders.length} Ready
              </span>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {readyOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold italic">
                  Pass-through counter is clear.
                </div>
              ) : (
                readyOrders.map((order) => (
                  <div key={order.id} className="bg-emerald-50/10 border border-emerald-100/50 rounded-2xl p-3.5 flex justify-between items-center gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-emerald-700">{order.id}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Table {order.tableNumber}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-650 truncate">
                        {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg block">
                        READY 🛎️
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 mt-1 block uppercase">
                        By {chefs.find(c => c.id === order.assignedChefId)?.name}
                      </span>
                    </div>
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
