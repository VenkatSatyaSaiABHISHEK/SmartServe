import { useState } from 'react';
import { useChefStore } from '../../chef/store/useChefStore';
import { Search, UserPlus, Star, Award, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaffChef {
  id: string;
  name: string;
  section: string;
  avatar: string;
  rating: number;
  ordersPrepared: number;
  shiftWindow: string;
}

const INITIAL_STAFF_CHEFS: StaffChef[] = [
  { id: 'C1', name: 'Chef Ramsay', section: 'Grill & Entrées', rating: 4.9, ordersPrepared: 242, avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=120&auto=format&fit=crop', shiftWindow: '04:00 PM - Midnight' },
  { id: 'C2', name: 'Chef Bourdain', section: 'Sauté & Pastry', rating: 4.8, ordersPrepared: 198, avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=120&auto=format&fit=crop', shiftWindow: '04:00 PM - Midnight' },
  { id: 'C3', name: 'Chef Chang', section: 'Appetizers & Salads', rating: 4.7, ordersPrepared: 156, avatar: 'https://images.unsplash.com/photo-1595273670150-db0a3e390294?q=80&w=120&auto=format&fit=crop', shiftWindow: '06:00 PM - 02:00 AM' }
];

export function ChefManagementPage() {
  const chefStore = useChefStore();
  const [chefsList, setChefsList] = useState<StaffChef[]>(INITIAL_STAFF_CHEFS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [section, setSection] = useState('Grill & Entrées');
  const [avatar, setAvatar] = useState('');
  const [shiftWindow, setShiftWindow] = useState('04:00 PM - Midnight');

  const handleAddChef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const nextId = `C${chefsList.length + 1}`;
    const newChef: StaffChef = {
      id: nextId,
      name,
      section,
      avatar: avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=120&auto=format&fit=crop',
      rating: 5.0,
      ordersPrepared: 0,
      shiftWindow
    };

    setChefsList(prev => [...prev, newChef]);
    setName('');
    setAvatar('');
    setShowAddForm(false);
  };

  const handleSectionChange = (chefId: string, newSection: string) => {
    setChefsList(prev => prev.map(c => c.id === chefId ? { ...c, section: newSection } : c));
  };

  const filteredChefs = chefsList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">CHEF ROSTER MANAGER</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Review kitchen staff certifications, active preparation loads, and station assignments.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer self-start"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Register Chef
        </button>
      </div>

      {/* Add Chef Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddChef} className="bg-white border border-[#f1f5f9] rounded-[24px] p-6.5 shadow-sm space-y-4 max-w-2xl">
              <h3 className="font-extrabold text-[15px] text-[#0f172a] font-poppins">Chef Roster Registration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Chef Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gordon Ramsay"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Section Assignment</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  >
                    <option value="Grill & Entrées">Grill & Entrées</option>
                    <option value="Sauté & Pastry">Sauté & Pastry</option>
                    <option value="Appetizers & Salads">Appetizers & Salads</option>
                    <option value="Desserts & Baking">Desserts & Baking</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Shift Hours</label>
                  <input
                    type="text"
                    required
                    placeholder="04:00 PM - Midnight"
                    value={shiftWindow}
                    onChange={(e) => setShiftWindow(e.target.value)}
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
                  Register Chef
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
          placeholder="Search chefs by name, section, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#f1f5f9] rounded-[22px] pl-12 pr-6 py-4.5 text-sm font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5 transition-all shadow-sm"
        />
      </div>

      {/* Chef Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredChefs.map((chef) => {
          // Dynamic calculation of active load based on chefStore orders
          const activeLoad = chefStore.orders.filter(
            o => o.assignedChefId === chef.id && (o.status === 'New' || o.status === 'Preparing')
          ).length;

          return (
            <div key={chef.id} className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img src={chef.avatar} alt={chef.name} className="w-12 h-12 rounded-[16px] object-cover border border-slate-100" />
                  <div>
                    <h4 className="font-extrabold text-[15px] text-[#0f172a] font-poppins leading-tight">{chef.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">{chef.id} Station</span>
                  </div>
                </div>

                <div className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl p-4 text-xs font-bold text-slate-500 space-y-2.5">
                  <div className="flex justify-between">
                    <span>Shift Window:</span>
                    <span className="text-[#0f172a]">{chef.shiftWindow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Queue Load:</span>
                    <span className={`font-black ${activeLoad >= 2 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                      {activeLoad} / 2 tickets
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dishes Cooked Today:</span>
                    <span className="text-[#0f172a] font-black">{chef.ordersPrepared} dishes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Audited Rating:</span>
                    <span className="flex items-center gap-1 text-amber-500 font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                      {chef.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Station Control Option */}
              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Station IP: 192.168.1.10{chef.id}</span>
                <select
                  value={chef.section}
                  onChange={(e) => handleSectionChange(chef.id, e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-slate-700 focus:outline-none"
                >
                  <option value="Grill & Entrées">Grill & Entrées</option>
                  <option value="Sauté & Pastry">Sauté & Pastry</option>
                  <option value="Appetizers & Salads">Appetizers & Salads</option>
                  <option value="Desserts & Baking">Desserts & Baking</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
