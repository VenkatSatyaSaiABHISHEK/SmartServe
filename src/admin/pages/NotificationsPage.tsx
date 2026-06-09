import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { BellRing, Send, Search, CheckCircle, Flame, Calendar, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationsPage() {
  const { notifications, addNotification, markNotificationRead } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'System' | 'Order' | 'Staff' | 'Reservation'>('System');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    addNotification(title, message, type);
    setTitle('');
    setMessage('');
    alert(`Alert broadcasted successfully to all waiter & chef terminals! 📢`);
  };

  const filteredNotifs = notifications.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">BROADCAST CENTER</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Transmit live announcements to waitstaff and kitchen display systems.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6.5">
        {/* Left Column: Create Announcement */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm space-y-5 h-fit">
          <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Compose Announcement</h3>
          
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Alert Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
              >
                <option value="System">System / Kitchen Node</option>
                <option value="Order">Order / Dining Floor</option>
                <option value="Staff">Staff / Rosters</option>
                <option value="Reservation">Reservation Status</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Mandatory Briefing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Broadcasting Message</label>
              <textarea
                required
                placeholder="Write announcements details..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400 min-h-[90px] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
            >
              <Send className="w-4 h-4" />
              Broadcast Alert
            </button>
          </form>
        </div>

        {/* Right Column: Alerts log */}
        <div className="lg:col-span-2 bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm space-y-5 flex flex-col min-h-[450px]">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">HQ Dispatch Logs</h3>
            <span className="text-[10.5px] font-bold text-slate-400">Total Logs cached: {notifications.length}</span>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-1 scrollbar-none mt-2">
            <AnimatePresence initial={false}>
              {filteredNotifs.map((notif) => {
                const iconMap = {
                  'System': Info,
                  'Order': Flame,
                  'Staff': BellRing,
                  'Reservation': Calendar
                };
                const IconComp = iconMap[notif.type] || Info;

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-2xl border transition-all flex justify-between items-start ${
                      notif.read 
                        ? 'bg-slate-50/55 border-slate-100/70 text-slate-500' 
                        : 'bg-white border-[#f1f5f9] text-[#0f172a] shadow-sm'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        notif.type === 'System' ? 'bg-blue-50 text-blue-500' :
                        notif.type === 'Order' ? 'bg-amber-50 text-amber-500' :
                        notif.type === 'Staff' ? 'bg-purple-50 text-purple-500' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs">{notif.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4 space-y-2">
                      <span className="text-[9.5px] text-slate-400 font-semibold block">{notif.time}</span>
                      {!notif.read && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block ml-auto hover:underline cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
