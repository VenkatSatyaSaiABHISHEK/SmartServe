import { useState } from 'react';
import { useChefStore } from '../store/useChefStore';
import { User, Shield, Key, Bell, Volume2, Moon, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfilePage() {
  const { activeChef } = useChefStore();
  const [stationPref, setStationPref] = useState('Primary Grill');

  if (!activeChef) return null;

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">STATION PROFILE</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Managing active chef configuration and shift preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm flex flex-col items-center text-center">
          <div className="relative">
            <img 
              src={activeChef.avatar} 
              alt={activeChef.name} 
              className="w-24 h-24 rounded-[22px] object-cover shadow-md border-2 border-white"
            />
            <span className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
              {activeChef.id}
            </span>
          </div>

          <h3 className="font-black text-[18px] text-[#0f172a] font-poppins mt-5 leading-tight">
            {activeChef.name}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Station Supervisor
          </p>

          <div className="w-full mt-6 pt-5 border-t border-slate-50 space-y-3.5 text-left text-xs font-bold text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Station IP:</span>
              <span className="text-[#0f172a]">192.168.1.10{activeChef.id === 'C1' ? '1' : activeChef.id === 'C2' ? '2' : '3'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Shift Window:</span>
              <span className="text-[#0f172a]">04:00 PM - Midnight</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">ON SHIFT</span>
            </div>
          </div>
        </div>

        {/* Preferences Form */}
        <div className="lg:col-span-2 bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6">
          <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Station Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kitchen Section Assignment</label>
              <select 
                value={stationPref} 
                onChange={(e) => setStationPref(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-purple-300"
              >
                <option value="Primary Grill">Primary Grill Section</option>
                <option value="Sauté & Appetizers">Sauté & Appetizers</option>
                <option value="Garnish & Salads">Garnish & Salads</option>
                <option value="Desserts & Baking">Desserts & Baking</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Device Role</label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a]">
                Kitchen Display System (KDS) Tablet
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex justify-end">
            <button 
              onClick={() => alert('Preferences saved!')}
              className="bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md shadow-purple-500/10 hover:opacity-95 cursor-pointer uppercase tracking-wider"
            >
              Update Station
            </button>
          </div>
        </div>
      </div>

      {/* Audit logs */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">KDS Terminal Activity Audit Logs</h3>
        <div className="space-y-3.5">
          {[
            { time: '10:55 PM', event: 'New order simulator loaded successfully.', badge: 'System' },
            { time: '10:52 PM', event: 'Station workload capacity adjusted to threshold limit of 2 active orders.', badge: 'Config' },
            { time: '10:48 PM', event: `Chef logged into terminal station ${activeChef.id}.`, badge: 'Auth' }
          ].map((log, idx) => (
            <div key={idx} className="flex gap-4 text-xs font-bold text-slate-600">
              <span className="text-slate-400 w-16 shrink-0">{log.time}</span>
              <span className="text-slate-300">|</span>
              <span className="bg-slate-100 text-[10px] text-slate-500 px-2 py-0.5 rounded shrink-0 self-center">{log.badge}</span>
              <span className="text-[#0f172a]">{log.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [notifSound, setNotifSound] = useState(true);
  const [kdsOverlay, setKdsOverlay] = useState(true);

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">KDS SYSTEM SETTINGS</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Manage hardware terminal configurations and device modes.
        </p>
      </div>

      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6 max-w-2xl">
        <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          Terminal Configurations
        </h3>

        <div className="space-y-5">
          {/* Setting 1 */}
          <div className="flex justify-between items-center p-3 rounded-2xl bg-[#fafafc] border border-[#f1f5f9]">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-slate-400" />
              <div>
                <span className="block text-xs font-black text-[#0f172a]">Ticket Alert Beeps</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Play audio sound when new orders are assigned</span>
              </div>
            </div>
            <button 
              onClick={() => setNotifSound(!notifSound)}
              className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-all flex ${
                notifSound ? 'bg-[#7c3aed] justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <div className="w-4.5 h-4.5 bg-white rounded-full shadow-sm" />
            </button>
          </div>

          {/* Setting 2 */}
          <div className="flex justify-between items-center p-3 rounded-2xl bg-[#fafafc] border border-[#f1f5f9]">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-slate-400" />
              <div>
                <span className="block text-xs font-black text-[#0f172a]">POS Live Overlay</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Show notifications banner when orders arrive</span>
              </div>
            </div>
            <button 
              onClick={() => setKdsOverlay(!kdsOverlay)}
              className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-all flex ${
                kdsOverlay ? 'bg-[#7c3aed] justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <div className="w-4.5 h-4.5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 flex justify-end">
          <button 
            onClick={() => alert('Settings applied!')}
            className="bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md shadow-purple-500/10 hover:opacity-95 cursor-pointer uppercase tracking-wider"
          >
            Apply Configurations
          </button>
        </div>
      </div>
    </div>
  );
}
