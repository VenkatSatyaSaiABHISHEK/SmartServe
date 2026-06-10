import { useState } from 'react';
import { useWaiterStore } from '../store/useWaiterStore';
import type { ActiveTable } from '../types';
import { 
  Users, CheckCircle2, AlertCircle, Coffee, DollarSign, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ActiveTablesPage() {
  const { tables, updateTableStatus } = useWaiterStore();
  const [selectedTable, setSelectedTable] = useState<ActiveTable | null>(null);

  const getStatusStyles = (status: ActiveTable['status']) => {
    switch (status) {
      case 'idle':
        return {
          bg: 'bg-green-50/50 hover:bg-green-50',
          border: 'border-green-100',
          text: 'text-green-700',
          dot: 'bg-green-500',
          label: 'Available'
        };
      case 'ordering':
        return {
          bg: 'bg-indigo-50/50 hover:bg-indigo-50',
          border: 'border-indigo-100',
          text: 'text-indigo-700',
          dot: 'bg-indigo-500',
          label: 'Ordering'
        };
      case 'waiting':
        return {
          bg: 'bg-blue-50/50 hover:bg-blue-50',
          border: 'border-blue-100',
          text: 'text-blue-700',
          dot: 'bg-blue-500',
          label: 'Waiting for Food'
        };
      case 'billing':
        return {
          bg: 'bg-amber-50/50 hover:bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-700',
          dot: 'bg-amber-500',
          label: 'Billing'
        };
      case 'occupied':
        return {
          bg: 'bg-slate-50/50 hover:bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          dot: 'bg-slate-500',
          label: 'Eating'
        };
    }
  };

  const handleStatusChange = (status: ActiveTable['status']) => {
    if (selectedTable) {
      updateTableStatus(selectedTable.id, status);
      setSelectedTable(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 font-sans relative">
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins">Dining Tables</h1>
        <p className="text-[#64748b] text-[13px] mt-0.5">Real-time table status monitor and floor editor.</p>
      </div>

      {/* Legend bar */}
      <div className="bg-white p-3.5 rounded-[22px] border border-[#f1f5f9] shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex flex-wrap gap-x-4 gap-y-2 justify-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>Idle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Ordering</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Waiting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Billing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span>Eating</span>
        </div>
      </div>

      {/* Table Grid (3 Columns) */}
      <div className="grid grid-cols-3 gap-3">
        {tables.map((table) => {
          const styles = getStatusStyles(table.status);
          
          return (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`p-4 rounded-[26px] border flex flex-col items-center justify-between gap-3 aspect-square shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md cursor-pointer transition-all duration-300 active:scale-95 ${styles.bg} ${styles.border}`}
            >
              <div className="flex justify-between w-full items-center">
                <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                <span className="text-[10px] font-bold text-[#64748b] flex items-center gap-0.5">
                  <Users className="w-3 h-3" />
                  {table.capacity}
                </span>
              </div>
              
              <h3 className={`text-2xl font-black font-poppins ${styles.text}`}>
                {table.number}
              </h3>
              
              <span className={`text-[10px] font-bold tracking-wide uppercase ${styles.text}`}>
                {styles.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Picker Modal */}
      <AnimatePresence>
        {selectedTable && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTable(null)}
              className="fixed inset-0 bg-slate-900 z-40"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] max-w-md mx-auto"
            >
              <div className="flex justify-between items-center mb-5 border-b border-slate-50 pb-3">
                <div>
                  <h3 className="font-extrabold text-[#0f172a] text-lg font-poppins">
                    Table {selectedTable.number} Status
                  </h3>
                  <p className="text-xs text-slate-400">Current state: {selectedTable.status}</p>
                </div>
                <button 
                  onClick={() => setSelectedTable(null)}
                  className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Selection Buttons */}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleStatusChange('idle')}
                  className="flex items-center gap-3 p-3.5 bg-green-50 text-green-700 border border-green-100 rounded-[20px] font-bold text-xs uppercase tracking-wide text-left cursor-pointer hover:bg-green-100 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Available (Clean/Empty)
                </button>
                <button 
                  onClick={() => handleStatusChange('ordering')}
                  className="flex items-center gap-3 p-3.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-[20px] font-bold text-xs uppercase tracking-wide text-left cursor-pointer hover:bg-indigo-100 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Ordering (Guest Deciding)
                </button>
                <button 
                  onClick={() => handleStatusChange('waiting')}
                  className="flex items-center gap-3 p-3.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-[20px] font-bold text-xs uppercase tracking-wide text-left cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Waiting for Food (Chef Preparing)
                </button>
                <button 
                  onClick={() => handleStatusChange('occupied')}
                  className="flex items-center gap-3 p-3.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-[20px] font-bold text-xs uppercase tracking-wide text-left cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  Eating (Guests Dining)
                </button>
                <button 
                  onClick={() => handleStatusChange('billing')}
                  className="flex items-center gap-3 p-3.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-[20px] font-bold text-xs uppercase tracking-wide text-left cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Billing (Payment Pending)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
