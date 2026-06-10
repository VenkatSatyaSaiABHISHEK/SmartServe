import { useState } from 'react';
import { useWaiterStore } from '../store/useWaiterStore';
import { 
  Search, CheckCircle2, Clock, DollarSign, Award, Utensils
} from 'lucide-react';

export function DeliveryHistoryPage() {
  const { orders } = useWaiterStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter for completed deliveries only
  const completedOrders = orders.filter(o => o.status === 'Delivered');

  // Filter based on search query (table number or order id)
  const filteredHistory = completedOrders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.tableId.toString().includes(searchQuery) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins">Delivery History</h1>
        <p className="text-[#64748b] text-[13px] mt-0.5">Review and search your completed table services today.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search by order ID, table, or food item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#f1f5f9] rounded-[22px] text-sm text-[#1e293b] placeholder-slate-400 focus:outline-none focus:border-blue-300 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
        />
      </div>

      {/* History Feed */}
      <div className="flex flex-col gap-3.5">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#f1f5f9] rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-slate-400 flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-10 h-10 stroke-[1.2] text-slate-300" />
            <div>
              <p className="text-sm font-bold text-slate-700">No Deliveries Found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try searching for a different keyword or deliver food first.</p>
            </div>
          </div>
        ) : (
          filteredHistory.map((order) => {
            const tip = Math.round(order.price * 0.1); // 10% tip
            
            return (
              <div 
                key={order.id}
                className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100 uppercase tracking-wide">
                      Completed
                    </span>
                    <h3 className="font-extrabold text-[#0f172a] text-[16px] mt-2 font-poppins">
                      Table {order.tableId}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                    <span className="text-xs font-bold text-slate-600">{order.id}</span>
                  </div>
                </div>

                {/* Items Summarized */}
                <div className="flex flex-wrap gap-1.5 border-t border-b border-slate-50 py-3 my-0.5">
                  {order.items.map((item, idx) => (
                    <span 
                      key={idx}
                      className="text-[11.5px] font-semibold text-slate-600 bg-slate-50 border border-slate-100/80 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0"
                    >
                      <Utensils className="w-3 h-3 text-slate-400" />
                      {item.name} <strong className="text-slate-800 font-extrabold">x{item.quantity}</strong>
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[12.5px]">
                  <div className="flex items-center gap-1 text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Served Today
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-bold">
                      Bill: <strong className="text-[#0f172a]">₹{order.price.toFixed(2)}</strong>
                    </span>
                    {tip > 0 && (
                      <span className="text-green-600 bg-green-50 border border-green-100/50 px-2 py-0.5 rounded-full font-bold text-[11.5px] flex items-center gap-0.5 shadow-sm">
                        <Award className="w-3 h-3" />
                        +₹{tip.toFixed(2)} Tip
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
