import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Search, Calendar, Plus, User, Clock, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReservationPage() {
  const { reservations, addReservation, updateReservationStatus } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add reservation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [custName, setCustName] = useState('');
  const [tableNum, setTableNum] = useState('');
  const [resDate, setResDate] = useState('2026-06-09');
  const [resTime, setResTime] = useState('08:00 PM');
  const [guests, setGuests] = useState('2');
  const [requestText, setRequestText] = useState('');

  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !tableNum) return;

    addReservation({
      customerName: custName,
      tableNumber: parseInt(tableNum),
      date: resDate,
      time: resTime,
      guestCount: parseInt(guests),
      specialRequest: requestText || undefined
    });

    // Reset Form
    setCustName('');
    setTableNum('');
    setResDate('2026-06-09');
    setResTime('08:00 PM');
    setGuests('2');
    setRequestText('');
    setShowAddForm(false);
  };

  const handleStatusChange = (id: string, status: typeof reservations[0]['status']) => {
    updateReservationStatus(id, status);
  };

  // Filter reservations
  const filteredReservations = reservations.filter(res => 
    res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `table ${res.tableNumber}`.includes(searchQuery.toLowerCase()) ||
    res.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">FLOOR BOOKINGS & RESERVATIONS</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Monitor host reservations and update guest check-in schedules.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer self-start"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Booking
        </button>
      </div>

      {/* Add Reservation Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddReservation} className="bg-white border border-[#f1f5f9] rounded-[24px] p-6.5 shadow-sm space-y-4 max-w-2xl">
              <h3 className="font-extrabold text-[15px] text-[#0f172a] font-poppins">New Booking Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Table Number</label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={tableNum}
                    onChange={(e) => setTableNum(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Guest Size</label>
                  <input
                    type="number"
                    required
                    placeholder="4"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Booking Date</label>
                  <input
                    type="date"
                    required
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Booking Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 PM"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Special Notes / Diet Requests</label>
                  <textarea
                    placeholder="e.g. Eggless cake, baby seat..."
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400 min-h-[70px] resize-none"
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
                  Save Reservation
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by reservation ID, guest name, or table..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#f1f5f9] rounded-[22px] pl-12 pr-6 py-4.5 text-sm font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5 transition-all shadow-sm"
        />
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReservations.map((res) => {
          const statusStyles = {
            'Pending': 'bg-amber-50 text-amber-600 border border-amber-100',
            'Confirmed': 'bg-blue-50 text-blue-600 border border-blue-100',
            'Completed': 'bg-green-50 text-green-600 border border-green-100',
            'Cancelled': 'bg-slate-100 text-slate-400 border border-slate-200'
          };

          return (
            <div key={res.id} className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{res.id}</span>
                    <h4 className="font-extrabold text-[15px] text-[#0f172a] font-poppins leading-tight mt-1">{res.customerName}</h4>
                  </div>
                  <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0 ${statusStyles[res.status]}`}>
                    {res.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-3 text-xs font-bold text-slate-500">
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Timing</span>
                    <span className="text-[#0f172a] flex items-center gap-1"><Clock className="w-3.5 h-3.5 shrink-0" /> {res.time}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Table / Guests</span>
                    <span className="text-[#0f172a]">T{res.tableNumber} • {res.guestCount} Pax</span>
                  </div>
                </div>

                {res.specialRequest && (
                  <div className="bg-[#fafafc] border border-[#f1f5f9] p-3 rounded-xl flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                    <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{res.specialRequest}</span>
                  </div>
                )}
              </div>

              {/* Status Update Options */}
              <div className="flex items-center gap-2 pt-2">
                <select
                  value={res.status}
                  onChange={(e) => handleStatusChange(res.id, e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[10.5px] font-black uppercase tracking-wider text-slate-700 focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
