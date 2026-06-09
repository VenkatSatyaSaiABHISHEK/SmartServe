import { useState } from 'react';
import { User, Shield, KeyRound, Clock, Laptop } from 'lucide-react';

export function ProfilePage() {
  const [adminName, setAdminName] = useState('Head Administrator');
  const [adminEmail, setAdminEmail] = useState('manager@restohq.com');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Security profile parameters updated successfully!');
  };

  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">ADMIN PROFILE</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Review security configurations and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Summary */}
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm flex flex-col items-center text-center h-fit">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl font-poppins shadow-md shadow-slate-950/10 mb-5">
            AD
          </div>
          <h4 className="font-extrabold text-[16px] text-[#0f172a] font-poppins">{adminName}</h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Role: HQ Manager</span>

          <div className="w-full mt-6 pt-5 border-t border-slate-50 space-y-3.5 text-left text-xs font-bold text-slate-500">
            <div className="flex justify-between">
              <span>Security Tier:</span>
              <span className="text-emerald-500 font-black flex items-center gap-1"><Shield className="w-3.5 h-3.5 fill-emerald-50" /> Level 4</span>
            </div>
            <div className="flex justify-between">
              <span>Node IP:</span>
              <span className="text-[#0f172a] font-black">192.168.1.50</span>
            </div>
            <div className="flex justify-between">
              <span>Active Status:</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[9.5px]">AUTHENTICATED</span>
            </div>
          </div>
        </div>

        {/* Right Card: Account Details */}
        <div className="md:col-span-2 bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6">
          <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">HQ Account Parameters</h3>
          
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Admin Profile Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Access Email Address</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Terminal Security Key</label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>••••••••••••••••</span>
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-50">
              <button
                type="submit"
                className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Access Trails */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight">Active Session Trails</h3>
        <div className="space-y-3.5">
          {[
            { time: '11:04 PM', browser: 'Chrome • Windows OS', activity: 'Access log session initialized from IP 192.168.1.50' },
            { time: '10:48 PM', browser: 'Safari • macOS Platform', activity: 'Menu configurations audit log synced successfully' }
          ].map((trail, idx) => (
            <div key={idx} className="flex gap-4 text-xs font-bold text-slate-500">
              <span className="text-slate-400 w-16 shrink-0">{trail.time}</span>
              <span className="text-slate-300">|</span>
              <span className="bg-slate-50 text-[10px] text-slate-400 border border-slate-100 px-2 py-0.5 rounded flex items-center gap-1"><Laptop className="w-3 h-3" /> {trail.browser}</span>
              <span className="text-[#0f172a]">{trail.activity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
