import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { 
  ChefHat, Clock, CheckCircle2, ChevronRight, CookingPot, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AssignedOrdersPage() {
  const { orders, updateOrderStatus } = useWaiterStore();
  const [activeTab, setActiveTab] = useState<'collect' | 'deliver'>('collect');
  const navigate = useNavigate();

  // Filter orders
  // "To Collect": Status is 'Ready' (prepared by chef, waiting in kitchen)
  const toCollect = orders.filter(o => o.status === 'Ready');
  
  // "To Deliver": Status is 'Picked Up' (in waiter's hands, going to table) or 'Preparing' (still cooking)
  const toDeliver = orders.filter(o => o.status === 'Picked Up' || o.status === 'Preparing');

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins">Assigned Orders</h1>
        <p className="text-[#64748b] text-[13px] mt-0.5">Manage kitchen collection and customer table deliveries.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('collect')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'collect' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          To Collect ({toCollect.length})
        </button>
        <button
          onClick={() => setActiveTab('deliver')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'deliver' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          To Deliver ({toDeliver.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {activeTab === 'collect' ? (
            <motion.div
              key="collect-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4"
            >
              {toCollect.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#f1f5f9] rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-slate-400 flex flex-col items-center justify-center gap-3">
                  <ChefHat className="w-10 h-10 stroke-[1.2]" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">All Kitchen Orders Collected</p>
                    <p className="text-xs text-slate-400 mt-0.5">Nothing is currently waiting in the kitchen.</p>
                  </div>
                </div>
              ) : (
                toCollect.map(order => (
                  <div 
                    key={order.id}
                    className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="cursor-pointer" onClick={() => navigate(`/waiter/order/${order.id}`)}>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                          {order.id}
                        </span>
                        <h3 className="font-extrabold text-[#0f172a] text-lg mt-2 font-poppins">
                          Table {order.tableId}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {order.timeOrdered}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-slate-50/50 p-3.5 rounded-2xl flex flex-col gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[13px] text-[#1e293b] font-medium">
                          <span>{item.name}</span>
                          <span className="font-bold text-slate-600">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[12px] font-bold text-[#64748b]">Total: <strong className="text-[#0f172a] text-[15px] font-black font-poppins">${order.price.toFixed(2)}</strong></p>
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Picked Up')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer"
                      >
                        Collect Food
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="deliver-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4"
            >
              {toDeliver.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#f1f5f9] rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-slate-400 flex flex-col items-center justify-center gap-3">
                  <Utensils className="w-10 h-10 stroke-[1.2]" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">No Pending Deliveries</p>
                    <p className="text-xs text-slate-400 mt-0.5">Collect items from the kitchen to start deliveries.</p>
                  </div>
                </div>
              ) : (
                toDeliver.map(order => (
                  <div 
                    key={order.id}
                    className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="cursor-pointer" onClick={() => navigate(`/waiter/order/${order.id}`)}>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                          {order.id}
                        </span>
                        <h3 className="font-extrabold text-[#0f172a] text-lg mt-2 font-poppins">
                          Table {order.tableId}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                        {order.status === 'Preparing' ? (
                          <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                            <CookingPot className="w-3.5 h-3.5" />
                            Cooking
                          </span>
                        ) : (
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5" />
                            In Hand
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-slate-50/50 p-3.5 rounded-2xl flex flex-col gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[13px] text-[#1e293b] font-medium">
                          <span>{item.name}</span>
                          <span className="font-bold text-slate-600">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[12px] font-bold text-[#64748b]">Total: <strong className="text-[#0f172a] text-[15px] font-black font-poppins">${order.price.toFixed(2)}</strong></p>
                      
                      {order.status === 'Preparing' ? (
                        <button 
                          disabled
                          className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider border border-slate-200 cursor-not-allowed"
                        >
                          Waiting on Kitchen
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'Delivered')}
                          className="bg-green-600 text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-green-500/10 active:scale-95 transition-all cursor-pointer hover:bg-green-700 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
