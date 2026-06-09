import { useChefStore } from '../store/useChefStore';
import { ClipboardList, Clock, Flame, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ActiveOrdersPage() {
  const { activeChef, orders, startPreparing } = useChefStore();

  if (!activeChef) return null;

  // Filter orders assigned to the logged-in chef with 'New' status
  const activeChefOrders = orders.filter(
    (o) => o.assignedChefId === activeChef.id && o.status === 'New'
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">INCOMING QUEUE</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          New orders assigned to your station. Tap "Start Preparing" to send them to the cookline.
        </p>
      </div>

      {/* Orders Grid */}
      {activeChefOrders.length === 0 ? (
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-12 text-center max-w-lg mx-auto shadow-sm mt-10">
          <div className="inline-flex p-4 bg-blue-50 text-blue-500 rounded-2xl mb-4.5">
            <ClipboardList className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-[17px] font-black text-[#0f172a] font-poppins">No Incoming Orders</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-sm mx-auto">
            You don't have any new orders assigned to your station right now. The KDS load balancer will auto-route new dishes to your terminal when received.
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {activeChefOrders.map((order) => (
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
                <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-start bg-slate-50/30">
                  <div>
                    <span className="text-2xl font-black text-[#0f172a] tracking-tight">{order.id}</span>
                    <div className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                      Time: {order.timeReceived}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#7c3aed] bg-purple-50 px-3.5 py-1 rounded-xl border border-purple-100">
                      Table {order.tableNumber}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6 flex-1 space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Dishes to Prep
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-4 bg-[#fafafc] p-3 rounded-2xl border border-[#f1f5f9]">
                        <span className="font-extrabold text-[13.5px] text-[#0f172a] truncate">
                          {item.name}
                        </span>
                        <span className="font-black text-[13.5px] text-[#7c3aed] bg-purple-50 border border-purple-100 px-3 py-0.5 rounded-lg shrink-0">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer with Big Action Target */}
                <div className="p-6 pt-0 space-y-4">
                  {/* Stats Info */}
                  <div className="flex items-center gap-4.5 text-xs text-slate-500 font-bold border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{order.prepTimeMins} min prep</span>
                    </div>
                    <div className="w-[1px] h-3.5 bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Station: {activeChef.id}</span>
                    </div>
                  </div>

                  {/* Big Touch Target Action */}
                  <button
                    onClick={() => startPreparing(order.id)}
                    className="w-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white hover:opacity-95 text-sm font-black py-4.5 rounded-[20px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 active:scale-98 cursor-pointer uppercase tracking-wider"
                  >
                    <Flame className="w-4.5 h-4.5 animate-pulse" />
                    Start Preparing
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
