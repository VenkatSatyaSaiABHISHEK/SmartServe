import { useState } from 'react';
import { useChefStore } from '../store/useChefStore';
import { Search, History, Clock, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function OrderHistoryPage() {
  const { activeChef, orders, chefs } = useChefStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStation, setFilterStation] = useState<'mine' | 'all'>('mine');

  if (!activeChef) return null;

  // Filter completed orders
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  // Apply station filter
  const stationFiltered = completedOrders.filter((o) => {
    if (filterStation === 'mine') {
      return o.assignedChefId === activeChef.id;
    }
    return true;
  });

  // Apply search query filter
  const finalFiltered = stationFiltered.filter((o) => {
    const matchesId = o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTable = `table ${o.tableNumber}`.includes(searchQuery.toLowerCase());
    const matchesItems = o.items.some((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesId || matchesTable || matchesItems;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">KITCHEN SERVICE LOG</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Archive list of completed and dispatched orders.
          </p>
        </div>
        
        {/* Toggle Station Filter */}
        <div className="flex bg-slate-100 p-1.5 rounded-[16px] border border-slate-200/40 self-start">
          <button
            onClick={() => setFilterStation('mine')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStation === 'mine'
                ? 'bg-white text-[#7c3aed] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Station ({activeChef.id})
          </button>
          <button
            onClick={() => setFilterStation('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStation === 'all'
                ? 'bg-white text-[#7c3aed] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Stations
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by Order ID, table number, or dish name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#f1f5f9] rounded-[22px] pl-12 pr-6 py-4.5 text-sm font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-sm"
        />
      </div>

      {/* History Table/List */}
      {finalFiltered.length === 0 ? (
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-12 text-center max-w-lg mx-auto shadow-sm mt-10">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4.5">
            <History className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-[17px] font-black text-[#0f172a] font-poppins">No Logged Orders</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-sm mx-auto">
            No completed orders match your search filter criteria. Dispatched dishes from active stations will be recorded here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-[#f1f5f9] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4.5">Order ID</th>
                  <th className="px-6 py-4.5">Table</th>
                  <th className="px-6 py-4.5">Dishes Prepared</th>
                  <th className="px-6 py-4.5">Station Chef</th>
                  <th className="px-6 py-4.5">Time Logged</th>
                  <th className="px-6 py-4.5 text-right">Prep Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {finalFiltered.map((order) => {
                  const assignedChef = chefs.find((c) => c.id === order.assignedChefId);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-xs font-bold text-slate-600">
                      <td className="px-6 py-5">
                        <span className="font-black text-sm text-[#0f172a]">{order.id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                          Table {order.tableNumber}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1 max-w-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-slate-400">x{item.quantity}</span>
                              <span className="text-[#0f172a] truncate">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <img 
                            src={assignedChef?.avatar} 
                            alt={assignedChef?.name} 
                            className="w-6 h-6 rounded-md object-cover border border-slate-100" 
                          />
                          <span className="text-slate-700">{assignedChef?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-400">
                        {order.timeReceived}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          {order.prepTimeMins} mins
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Table Footer Summary */}
          <div className="px-6 py-4.5 bg-slate-50 border-t border-[#f1f5f9] flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Total Orders Showing: {finalFiltered.length}</span>
            <span>KDS logs cache resets daily</span>
          </div>
        </div>
      )}
    </div>
  );
}
