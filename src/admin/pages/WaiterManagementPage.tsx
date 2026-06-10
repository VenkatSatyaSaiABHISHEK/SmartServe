import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Search, UserPlus, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function WaiterManagementPage() {
  const { waiters, addWaiter, updateWaiterStatus } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [pin, setPin] = useState('');

  const handleStatusChange = (id: string, status: any) => {
    updateWaiterStatus(id, status);
  };

  const handleAddWaiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !pin) return;

    addWaiter({
      name,
      email,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop',
      pin,
      onlineStatus: false
    });

    setName('');
    setEmail('');
    setAvatar('');
    setPin('');
    setShowAddForm(false);
  };

  const filteredWaiters = waiters.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">WAITER ROSTER MANAGER</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Monitor waitstaff shifts, live availability statuses, daily performance metrics, and rating points.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer self-start"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Register Waiter
        </button>
      </div>

      {/* Add Waiter Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddWaiter} className="bg-white border border-[#f1f5f9] rounded-[24px] p-6.5 shadow-sm space-y-4 max-w-2xl">
              <h3 className="font-extrabold text-[15px] text-[#0f172a] font-poppins">Roster Registration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Staff Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Neeson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="liam@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">4-Digit Access PIN</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{4}"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Avatar Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search waiters by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#f1f5f9] rounded-[22px] pl-12 pr-6 py-4.5 text-sm font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5 transition-all shadow-sm"
        />
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-[#f1f5f9] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4.5">Waiter</th>
                <th className="px-6 py-4.5">Today's Sales</th>
                <th className="px-6 py-4.5">Today's Tips</th>
                <th className="px-6 py-4.5">Rating Score</th>
                <th className="px-6 py-4.5">Shift Status</th>
                <th className="px-6 py-4.5 text-right">Roster Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredWaiters.map((waiter) => {
                const statusStyles = {
                  'Active': 'bg-green-50 text-green-600 border border-green-100',
                  'On Break': 'bg-amber-50 text-amber-600 border border-amber-100',
                  'Offline': 'bg-slate-100 text-slate-400 border border-slate-200'
                };

                return (
                  <tr key={waiter.id} className="hover:bg-slate-50/50 transition-colors text-xs font-bold text-slate-600">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img src={waiter.avatar} alt={waiter.name} className="w-10 h-10 rounded-[14px] object-cover border border-slate-100" />
                        <div>
                          <div className="font-extrabold text-[#0f172a] font-poppins">{waiter.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{waiter.id} • PIN: {waiter.pin || 'N/A'} • {waiter.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[#0f172a] font-black">{waiter.totalDeliveries} orders</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-emerald-600 font-black">${(waiter.todayTips || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-amber-500 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                        <span>{waiter.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyles[waiter.status || 'Offline']}`}>
                        {waiter.status || 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right flex items-center justify-end gap-2.5 min-w-[200px]">
                      <select
                        value={waiter.status}
                        onChange={(e) => handleStatusChange(waiter.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-[10.5px] font-black uppercase tracking-wider text-slate-700 focus:outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="On Break">On Break</option>
                        <option value="Offline">Offline</option>
                      </select>
                      
                      {(waiter.status === 'Active' || waiter.status === 'On Break') && (
                        <button
                          onClick={() => handleStatusChange(waiter.id, 'Offline')}
                          className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
                          title="Force clock-out and stop shift"
                        >
                          Stop Shift
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Table Footer */}
        <div className="px-6 py-4.5 bg-slate-50 border-t border-[#f1f5f9] flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Active shifts tracked: {waiters.filter(w => w.status === 'Active').length}</span>
          <span>Shift clocks status: Online</span>
        </div>
      </div>
    </div>
  );
}
