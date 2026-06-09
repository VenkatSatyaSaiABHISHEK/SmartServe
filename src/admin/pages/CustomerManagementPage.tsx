import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Search, Mail, Phone, Calendar, Star, Award, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export function CustomerManagementPage() {
  const { customers } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  // Filter customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cust.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiet = dietFilter === 'All' || cust.dietPreference === dietFilter;
    return matchesSearch && matchesDiet;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">CRM GUEST DIRECTORY</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Review client accounts, total expenditures, dining feedback ratings, and dietary preferences.
          </p>
        </div>
        
        {/* Diet preferences filters */}
        <div className="flex bg-slate-100 p-1.5 rounded-[16px] border border-slate-200/40 self-start">
          {(['All', 'Veg', 'Non-Veg'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDietFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dietFilter === filter
                  ? 'bg-white text-[#7c3aed] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by customer name, email, or guest ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#f1f5f9] rounded-[22px] pl-12 pr-6 py-4.5 text-sm font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5 transition-all shadow-sm"
        />
      </div>

      {/* CRM Database Directory Grid */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-[#f1f5f9] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4.5">Client Profile</th>
                <th className="px-6 py-4.5">Dietary</th>
                <th className="px-6 py-4.5">Visit Frequency</th>
                <th className="px-6 py-4.5">Total Spent</th>
                <th className="px-6 py-4.5">Feedback Score</th>
                <th className="px-6 py-4.5">Last Visit</th>
                <th className="px-6 py-4.5 text-right">VIP Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredCustomers.map((cust) => {
                const isVip = cust.visitCount >= 25;
                
                return (
                  <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors text-xs font-bold text-slate-600">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img src={cust.avatar} alt={cust.name} className="w-10 h-10 rounded-[14px] object-cover border border-slate-100" />
                        <div>
                          <div className="font-extrabold text-[#0f172a] font-poppins">{cust.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{cust.email} • {cust.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg ${
                        cust.dietPreference === 'Veg' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        cust.dietPreference === 'Non-Veg' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {cust.dietPreference}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[#0f172a] font-black">{cust.visitCount} visits</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[#0f172a] font-black">${cust.totalSpent.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">LTV spent</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-amber-500 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                        <span>{cust.avgRating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-400">
                      {cust.lastVisitDate}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {isVip ? (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-wider">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          Gold Regular
                        </span>
                      ) : (
                        <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Standard tier</span>
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
          <span>Active CRM Leads: {filteredCustomers.length}</span>
          <span>Lead Scoring Model: active</span>
        </div>
      </div>
    </div>
  );
}
