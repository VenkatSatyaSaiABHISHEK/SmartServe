import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Settings, Shield, Bell, Database, HelpCircle, HardDrive } from 'lucide-react';

export function SettingsPage() {
  const { taxRate, currency } = useAdminStore();
  const [vatRate, setVatRate] = useState(taxRate.toString());
  const [baseCurrency, setBaseCurrency] = useState(currency);
  const [kdsThreshold, setKdsThreshold] = useState('2');
  const [cacheInterval, setCacheInterval] = useState('60');

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System settings parameters synced successfully to cloud node database! ⚙️');
  };

  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">SYSTEM SETTINGS</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Configure Restaurant ERP rules, billing parameters, and KDS cascade thresholds.
        </p>
      </div>

      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6">
        <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight flex items-center gap-2">
          <Settings className="w-4.5 h-4.5 text-purple-500" />
          ERP Configuration Console
        </h3>

        <form onSubmit={handleApplySettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Setting 1 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Standard VAT Rate (%)</label>
              <input
                type="number"
                required
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
              />
              <span className="text-[9.5px] text-slate-400 font-semibold block ml-1">Applies to all customer cart billing checkouts.</span>
            </div>

            {/* Setting 2 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">System Base Currency</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
              >
                <option value="$">USD ($) - Dollar</option>
                <option value="€">EUR (€) - Euro</option>
                <option value="£">GBP (£) - Pound</option>
                <option value="₹">INR (₹) - Rupee</option>
              </select>
            </div>

            {/* Setting 3 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">KDS Load Balancer Threshold</label>
              <input
                type="number"
                required
                value={kdsThreshold}
                onChange={(e) => setKdsThreshold(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
              />
              <span className="text-[9.5px] text-slate-400 font-semibold block ml-1">Workload ticket limit before cascading to next chef.</span>
            </div>

            {/* Setting 4 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Cloud Sync Interval (Secs)</label>
              <input
                type="number"
                required
                value={cacheInterval}
                onChange={(e) => setCacheInterval(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex justify-end">
            <button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
            >
              Apply Sync Settings
            </button>
          </div>
        </form>
      </div>

      {/* Cloud Sync Logs */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins tracking-tight flex items-center gap-2">
          <Database className="w-4.5 h-4.5 text-blue-500" />
          Cloud Ledger Database Nodes
        </h3>
        <div className="space-y-3.5">
          {[
            { node: 'US-EAST-CLOUD', status: 'Operational', size: '14.2 MB' },
            { node: 'AP-SOUTH-MIRROR', status: 'Operational', size: '12.8 MB' }
          ].map((db, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <span>{db.node}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Database Size: {db.size}</span>
                <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-[9.5px]">ONLINE</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
