import { useState } from 'react';
import { useWaiterStore } from '../store/useWaiterStore';
import { 
  Bell, Volume2, Shield, Calendar, Database, LogOut, Check, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';

export function ProfilePage() {
  const { waiter, logout, toggleOnlineStatus } = useWaiterStore();
  
  // Local states for settings toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  if (!waiter) return null;

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      {/* Bio Card */}
      <div className="bg-white rounded-[28px] border border-[#f1f5f9] p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="relative mt-2">
          <img 
            src={waiter.avatar} 
            alt={waiter.name} 
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-3 border-white ${
            waiter.onlineStatus ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
          }`} />
        </div>

        <h3 className="font-extrabold text-[#0f172a] text-lg mt-3 font-poppins">
          {waiter.name}
        </h3>
        <p className="text-slate-400 text-xs font-semibold">{waiter.email}</p>

        <div className="flex gap-2.5 mt-4">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
            ID: {waiter.id}
          </span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500 fill-blue-500/20" />
            Senior Waiter
          </span>
        </div>
      </div>

      {/* Online Toggle Card */}
      <div className="bg-white p-4.5 rounded-[24px] border border-[#f1f5f9] shadow-sm flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-[#1e293b] text-[14px]">Online Availability</span>
          <span className="text-[12px] text-slate-500 mt-0.5">Toggle shift service mode</span>
        </div>
        <button 
          onClick={toggleOnlineStatus}
          className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
            waiter.onlineStatus 
              ? 'bg-green-50 border-green-100 text-green-700' 
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {waiter.onlineStatus ? '● Active' : '○ Offline'}
        </button>
      </div>

      {/* Settings Panel */}
      <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-[#0f172a] text-[15px] font-poppins flex items-center gap-2 border-b border-slate-50 pb-3">
          <Bell className="w-4.5 h-4.5 text-blue-600" />
          Terminal Settings
        </h3>

        {/* Setting Row 1 */}
        <div className="flex items-center justify-between text-[13.5px] text-[#1e293b] font-medium">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <span>Sound Notifications</span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-blue-600 transition-transform active:scale-90 cursor-pointer"
          >
            {soundEnabled ? (
              <ToggleRight className="w-10 h-10 text-blue-600 stroke-[1.2]" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-300 stroke-[1.2]" />
            )}
          </button>
        </div>

        {/* Setting Row 2 */}
        <div className="flex items-center justify-between text-[13.5px] text-[#1e293b] font-medium">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span>Vibration Alerts</span>
          </div>
          <button 
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className="text-blue-600 transition-transform active:scale-90 cursor-pointer"
          >
            {vibrationEnabled ? (
              <ToggleRight className="w-10 h-10 text-blue-600 stroke-[1.2]" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-300 stroke-[1.2]" />
            )}
          </button>
        </div>

        {/* Setting Row 3 */}
        <div className="flex items-center justify-between text-[13.5px] text-[#1e293b] font-medium">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <span>Real-time DB Sync</span>
          </div>
          <button 
            onClick={() => setAutoSync(!autoSync)}
            className="text-blue-600 transition-transform active:scale-90 cursor-pointer"
          >
            {autoSync ? (
              <ToggleRight className="w-10 h-10 text-blue-600 stroke-[1.2]" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-300 stroke-[1.2]" />
            )}
          </button>
        </div>
      </div>

      {/* System Details Box */}
      <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm flex flex-col gap-3.5 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <Shield className="w-4.5 h-4.5 text-slate-400" />
          <span>Role: Senior Floor Staff</span>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4.5 h-4.5 text-slate-400" />
          <span>Shift: 04:00 PM - 11:00 PM</span>
        </div>
        <div className="flex items-center gap-3">
          <Database className="w-4.5 h-4.5 text-slate-400" />
          <span className="flex items-center gap-1.5 text-green-600 font-extrabold normal-case">
            Syncing: Connected
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        </div>
      </div>

      {/* Logout Action */}
      <button 
        onClick={logout}
        className="w-full py-4.5 rounded-[22px] font-black text-white text-sm uppercase tracking-wider bg-red-600 shadow-md shadow-red-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-red-700 mt-2"
      >
        <LogOut className="w-4 h-4" />
        Log Out terminal
      </button>
    </div>
  );
}
export const SettingsPage = ProfilePage; // Map SettingsPage to ProfilePage for simpler single screen management
