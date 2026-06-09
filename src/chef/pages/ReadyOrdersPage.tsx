import { useChefStore } from '../store/useChefStore';
import { CheckCircle2, Clock, Check, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReadyOrdersPage() {
  const { activeChef, orders, markCompleted } = useChefStore();

  if (!activeChef) return null;

  // Filter ready orders assigned to the logged-in chef awaiting pickup
  const readyOrders = orders.filter(
    (o) => o.assignedChefId === activeChef.id && o.status === 'Ready'
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">AWAITING PICKUP</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Completed plates resting at the pass-through counter. Tap "Complete Order" when collected by the waiters.
        </p>
      </div>

      {/* Orders Grid */}
      {readyOrders.length === 0 ? (
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-12 text-center max-w-lg mx-auto shadow-sm mt-10">
          <div className="inline-flex p-4 bg-green-50 text-green-500 rounded-2xl mb-4.5">
            <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-[17px] font-black text-[#0f172a] font-poppins">Counter is Empty</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-sm mx-auto">
            There are currently no prepared orders waiting at the pickup station. Active dishes will show here once marked ready.
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {readyOrders.map((order) => (
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
                <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-start bg-green-50/10">
                  <div>
                    <span className="text-2xl font-black text-[#0f172a] tracking-tight">{order.id}</span>
                    <div className="text-[11px] font-bold text-emerald-600 mt-0.5 uppercase tracking-wider flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 animate-bounce" />
                      Ready for Pickup
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-xl border border-emerald-100">
                      Table {order.tableNumber}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6 flex-1 space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Plated Items
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-4 bg-emerald-50/10 p-3 rounded-2xl border border-emerald-100/40">
                        <span className="font-extrabold text-[13.5px] text-[#0f172a] truncate">
                          {item.name}
                        </span>
                        <span className="font-black text-[13.5px] text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-lg shrink-0">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer and Action Target */}
                <div className="p-6 pt-0 space-y-4">
                  {/* Stats info */}
                  <div className="flex items-center gap-4.5 text-xs text-slate-500 font-bold border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Ready since {order.timeReceived}</span>
                    </div>
                  </div>

                  {/* Big Action Target */}
                  <button
                    onClick={() => markCompleted(order.id)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-95 text-sm font-black py-4.5 rounded-[20px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-98 cursor-pointer uppercase tracking-wider"
                  >
                    <Check className="w-4.5 h-4.5" />
                    Complete & Hand Over
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
