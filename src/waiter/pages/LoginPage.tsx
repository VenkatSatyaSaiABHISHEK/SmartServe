import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { motion, useAnimation } from 'framer-motion';
import { Lock, Delete, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const login = useWaiterStore(state => state.login);
  const waiter = useWaiterStore(state => state.waiter);
  const navigate = useNavigate();
  const controls = useAnimation();

  useEffect(() => {
    // If already logged in, redirect
    if (waiter) {
      navigate('/waiter');
    }
  }, [waiter, navigate]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setError(false);
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  useEffect(() => {
    if (pin.length === 4) {
      const success = login({ pin });
      if (success) {
        navigate('/waiter');
      } else {
        setError(true);
        setPin('');
        // Shake animation for incorrect PIN
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.4 }
        });
      }
    }
  }, [pin, login, navigate, controls]);

  const keypadKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'C', '0', 'del'
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-between p-6 select-none font-sans relative overflow-hidden">
      {/* Background blobs for premium glowing look */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-gradient-to-tr from-[#e0e7ff]/40 to-[#f3e8ff]/50 blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] aspect-square rounded-full bg-gradient-to-br from-[#e0f2fe]/40 to-[#f3e8ff]/40 blur-[80px]" />

      {/* Top Header */}
      <div className="flex justify-between items-center z-10">
        <button 
          onClick={() => navigate('/')}
          className="p-3 bg-white rounded-full shadow-sm border border-[#f1f5f9] text-[#475569] flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider pr-1">Customer UI</span>
        </button>
        <span className="text-[11px] font-bold text-slate-400 bg-white border border-[#f1f5f9] px-3.5 py-1.5 rounded-full shadow-sm">
          TERMINAL V1.0
        </span>
      </div>

      {/* Main Login UI */}
      <div className="flex-1 flex flex-col justify-center items-center py-8 z-10">
        <div className="w-14 h-14 bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-6">
          <Lock className="w-6 h-6" />
        </div>
        
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins text-center tracking-tight mb-2">
          Waiter Terminal
        </h1>
        <p className="text-[#64748b] text-[13px] text-center max-w-[200px] leading-relaxed mb-10">
          Enter your 4-digit passcode PIN to sign in (Demo PIN: <strong className="text-purple-600">1234</strong>)
        </p>

        {/* Passcode Dots */}
        <motion.div 
          animate={controls}
          className="flex gap-4 mb-14"
        >
          {Array.from({ length: 4 }).map((_, i) => {
            const isFilled = pin.length > i;
            return (
              <motion.div 
                key={i}
                animate={{
                  scale: isFilled ? 1.2 : 1,
                  backgroundColor: error 
                    ? '#ef4444' 
                    : isFilled 
                      ? '#7c3aed' 
                      : '#cbd5e1'
                }}
                className="w-4.5 h-4.5 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            );
          })}
        </motion.div>

        {/* virtual keypad grid */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-8 max-w-[280px]">
          {keypadKeys.map((key) => {
            if (key === 'C') {
              return (
                <button
                  key={key}
                  onClick={handleClear}
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm text-[#ef4444] bg-[#fef2f2] border border-[#fee2e2] hover:bg-[#fee2e2] cursor-pointer transition-colors active:scale-95 duration-100"
                >
                  Clear
                </button>
              );
            }
            if (key === 'del') {
              return (
                <button
                  key={key}
                  onClick={handleDelete}
                  className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-[#64748b] bg-white border border-[#f1f5f9] shadow-sm hover:bg-slate-50 cursor-pointer active:scale-95 duration-100"
                >
                  <Delete className="w-5 h-5" />
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-[20px] text-[#1e293b] bg-white border border-[#f1f5f9] shadow-sm hover:bg-slate-50 cursor-pointer active:scale-95 duration-100 font-poppins"
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Details */}
      <div className="text-center z-10 text-[11px] text-[#94a3b8] font-semibold tracking-wide uppercase">
        Smart Restaurant POS System
      </div>
    </div>
  );
}
