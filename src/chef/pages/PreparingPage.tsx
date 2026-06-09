import { useState } from 'react';
import { useChefStore } from '../store/useChefStore';
import { Flame, Clock, CheckSquare, Square, User, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PreparingPage() {
  const { activeChef, orders, markReady } = useChefStore();
  
  // Track checked sub-items in preparation (checklist state per order item)
  // Key format: orderId-itemIndex
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!activeChef) return null;

  // Filter active preparing orders assigned to this chef
  const preparingOrders = orders.filter(
    (o) => o.assignedChefId === activeChef.id && o.status === 'Preparing'
  );

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">PREPARING TERMINAL</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Active cooking line. Check off items as they finish plating, then press "Mark Ready" to alert the waiters.
        </p>
      </div>

      {/* Orders Grid */}
      {preparingOrders.length === 0 ? (
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-12 text-center max-w-lg mx-auto shadow-sm mt-10">
          <div className="inline-flex p-4 bg-amber-50 text-amber-500 rounded-2xl mb-4.5">
            <Flame className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-[17px] font-black text-[#0f172a] font-poppins">Cooking Line is Clear</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-sm mx-auto">
            You have no active meals cooking right now. Check the "Incoming Queue" tab to start preparing assigned tickets.
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {preparingOrders.map((order) => {
              // Calculate checklist progress
              const totalItems = order.items.length;
              const completedCount = order.items.filter((_, idx) => checkedItems[`${order.id}-${idx}`]).length;
              const progressPercent = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-start bg-amber-50/10">
                    <div>
                      <span className="text-2xl font-black text-[#0f172a] tracking-tight">{order.id}</span>
                      <div className="text-[11px] font-bold text-[#d97706] mt-0.5 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 animate-pulse" />
                        Cooking Line Active
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-amber-600 bg-amber-50 px-3.5 py-1 rounded-xl border border-amber-100">
                        Table {order.tableNumber}
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="px-6 pt-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                      <span>Plating Progress</span>
                      <span className="text-amber-600">{completedCount}/{totalItems} Done</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Items Checklist */}
                  <div className="p-6 space-y-3">
                    {order.items.map((item, idx) => {
                      const isItemChecked = !!checkedItems[`${order.id}-${idx}`];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleItemCheck(order.id, idx)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isItemChecked 
                              ? 'bg-slate-50 border-slate-100 text-slate-400' 
                              : 'bg-[#fafafc] border-[#f1f5f9] text-[#0f172a]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isItemChecked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300 shrink-0" />
                            )}
                            <span className={`font-extrabold text-[13.5px] truncate ${isItemChecked ? 'line-through text-slate-400' : ''}`}>
                              {item.name}
                            </span>
                          </div>
                          <span className={`font-black text-[12.5px] px-2.5 py-0.5 rounded-lg shrink-0 ${
                            isItemChecked ? 'bg-slate-100 text-slate-400' : 'bg-white border border-[#f1f5f9] text-amber-500'
                          }`}>
                            x{item.quantity}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer & Actions */}
                  <div className="p-6 pt-0 space-y-4">
                    {/* Stats info */}
                    <div className="flex items-center gap-4.5 text-xs text-slate-500 font-bold border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Estimated: {order.prepTimeMins} mins</span>
                      </div>
                      <div className="w-[1px] h-3.5 bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Chef: {activeChef.id}</span>
                      </div>
                    </div>

                    {/* Big Action Target */}
                    <button
                      onClick={() => markReady(order.id)}
                      className="w-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white hover:opacity-95 text-sm font-black py-4.5 rounded-[20px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 active:scale-98 cursor-pointer uppercase tracking-wider"
                    >
                      <Play className="w-4.5 h-4.5 fill-current" />
                      Mark Ready (Pass To Waiter)
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
