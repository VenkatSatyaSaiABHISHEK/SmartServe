import { useChefStore } from '../../chef/store/useChefStore';
import { ChefHat, AlertCircle, Send, Play, CheckCircle2, History, MessageSquareCode } from 'lucide-react';
import { useState } from 'react';

export function KitchenDisplayPage() {
  const { chefs, orders } = useChefStore();
  const [messages, setMessages] = useState<Record<string, string>>({});

  const getChefActiveOrders = (chefId: string) => {
    return orders.filter(o => o.assignedChefId === chefId && o.status !== 'Completed');
  };

  const handleSendChefAlert = (chefId: string) => {
    const text = messages[chefId];
    if (!text) return;
    alert(`Alert sent to ${chefs.find(c => c.id === chefId)?.name} KDS Screen: "${text}" 💬`);
    setMessages(prev => ({ ...prev, [chefId]: '' }));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">KDS CONSOLE MIRROR</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Real-time mirror of active chef prep stations and kitchen workloads.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 text-[#7c3aed] border border-purple-100 rounded-xl text-[11.5px] font-black uppercase tracking-wider">
          <ChefHat className="w-4 h-4 text-purple-500 animate-pulse" />
          <span>Kitchen Live Stream</span>
        </div>
      </div>

      {/* Chefs Side-by-side Mirror */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {chefs.map((chef) => {
          const activeOrders = getChefActiveOrders(chef.id);
          const activeLoad = activeOrders.length;
          const isFull = activeLoad >= 2;

          return (
            <div key={chef.id} className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm flex flex-col h-[525px] justify-between">
              <div>
                {/* Chef station header */}
                <div className="p-5 border-b border-[#f1f5f9] bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={chef.avatar} alt={chef.name} className="w-10 h-10 rounded-[14px] object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-extrabold text-[14px] text-[#0f172a] font-poppins leading-tight">{chef.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">{chef.id} Console</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                      isFull ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'
                    }`}>
                      {isFull ? 'STATION FULL' : 'AVAILABLE'}
                    </span>
                  </div>
                </div>

                {/* Orders Queue */}
                <div className="p-4.5 space-y-3.5 max-h-[330px] overflow-y-auto scrollbar-none">
                  {activeOrders.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                      <ChefHat className="w-10 h-10 stroke-[1.2] text-slate-300 mb-2.5" />
                      <p className="text-[11px] font-bold">No Active Tickets</p>
                    </div>
                  ) : (
                    activeOrders.map((order) => (
                      <div key={order.id} className="bg-[#fafafc] border border-[#f1f5f9] rounded-2xl p-4.5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-black text-xs text-[#0f172a]">{order.id}</span>
                            <span className="text-[10px] font-bold text-slate-400 ml-2">Table {order.tableNumber}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            order.status === 'New' ? 'bg-blue-50 text-blue-600' :
                            order.status === 'Preparing' ? 'bg-amber-50 text-amber-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-bold text-slate-600">
                              <span className="truncate max-w-[180px]">{item.name}</span>
                              <span className="text-slate-400">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Station alert communication drawer */}
              <div className="p-4.5 border-t border-[#f1f5f9] bg-slate-50/30 flex gap-2">
                <input
                  type="text"
                  placeholder={`Alert ${chef.id}...`}
                  value={messages[chef.id] || ''}
                  onChange={(e) => setMessages(prev => ({ ...prev, [chef.id]: e.target.value }))}
                  className="w-full bg-white border border-[#f1f5f9] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-300"
                />
                <button
                  onClick={() => handleSendChefAlert(chef.id)}
                  className="bg-slate-900 text-white hover:bg-slate-800 p-2 rounded-xl shadow-sm cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
