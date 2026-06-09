import { useState } from 'react';
import { Search, UserPlus, Star, Award, ShieldAlert, BadgeInfo, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaffWaiter {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'On Break' | 'Offline';
  rating: number;
  ordersDelivered: number;
  tipsToday: number;
  avatar: string;
}

const MOCK_WAITERS: StaffWaiter[] = [
  { id: 'W-01', name: 'John Doe', email: 'john.doe@restaurant.com', status: 'Active', rating: 4.9, ordersDelivered: 24, tipsToday: 42.50, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=120&auto=format&fit=crop' },
  { id: 'W-02', name: 'Sarah Connor', email: 'sarah.c@restaurant.com', status: 'On Break', rating: 4.8, ordersDelivered: 18, tipsToday: 30.00, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop' },
  { id: 'W-03', name: 'Liam Neeson', email: 'liam.n@restaurant.com', status: 'Active', rating: 4.7, ordersDelivered: 21, tipsToday: 35.80, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop' },
  { id: 'W-04', name: 'Emma Watson', email: 'emma.w@restaurant.com', status: 'Offline', rating: 5.0, ordersDelivered: 32, tipsToday: 65.00, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop' }
];

export function WaiterManagementPage() {
  const [waiters, setWaiters] = useState<StaffWaiter[]>(MOCK_WAITERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  const handleStatusChange = (id: string, status: StaffWaiter['status']) => {
    setWaiters(prev => prev.map(w => w.id === id ? { ...w, status } : w));
  };

  const handleAddWaiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newWaiter: StaffWaiter = {
      id: `W-0${waiters.length + 1}`,
      name,
      email,
      status: 'Offline',
      rating: 5.0,
      ordersDelivered: 0,
      tipsToday: 0.00,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop'
    };

    setWaiters(prev => [...prev, newWaiter]);
    setName('');
    setEmail('');
    setAvatar('');
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

                <div className="md:col-span-2 space-y-1.5">
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
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{waiter.id} • {waiter.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[#0f172a] font-black">{waiter.ordersDelivered} orders</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-emerald-600 font-black">${waiter.tipsToday.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-amber-500 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                        <span>{waiter.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyles[waiter.status]}`}>
                        {waiter.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <select
                        value={waiter.status}
                        onChange={(e) => handleStatusChange(waiter.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-[10.5px] font-black uppercase tracking-wider text-slate-700 focus:outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="On Break">On Break</option>
                        <option value="Offline">Offline</option>
                      </select>
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
