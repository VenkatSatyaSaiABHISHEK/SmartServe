import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { motion, useAnimation } from 'framer-motion';
import { Delete, ArrowLeft, Users } from 'lucide-react';

export function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [inputWaiterId, setInputWaiterId] = useState('');
  const { login, waiter, waiters, listenToWaiters, waitersLoaded } = useWaiterStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const waiterId = searchParams.get('id');
  const [activeWaiterId, setActiveWaiterId] = useState<string | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    const unsubscribe = listenToWaiters();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [listenToWaiters]);

  useEffect(() => {
    // If already logged in, redirect
    if (waiter) {
      navigate('/waiter');
    }
  }, [waiter, navigate]);

  const currentWaiterId = waiterId || activeWaiterId;
  const currentWaiter = waiters.find(w => w.id === currentWaiterId);

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
    const triggerLogin = async () => {
      if (pin.length === 4 && currentWaiter) {
        const success = await login(currentWaiter.id, pin);
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
    };
    triggerLogin();
  }, [pin, currentWaiter, login, navigate, controls]);

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
          onClick={() => {
            if (activeWaiterId) {
              setActiveWaiterId(null);
              setPin('');
            } else {
              navigate('/');
            }
          }}
          className="p-3 bg-white rounded-full shadow-sm border border-[#f1f5f9] text-[#475569] flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider pr-1">
            {activeWaiterId ? 'Back to List' : 'Customer UI'}
          </span>
        </button>
        <span className="text-[11px] font-bold text-slate-400 bg-white border border-[#f1f5f9] px-3.5 py-1.5 rounded-full shadow-sm">
          WAITER LOG IN PORTAL
        </span>
      </div>

      {currentWaiter ? (
        /* Main Login UI */
        <div className="flex-1 flex flex-col justify-center items-center py-8 z-10">
          <div className="relative mb-6">
            <img 
              src={currentWaiter.avatar} 
              alt={currentWaiter.name} 
              className="w-20 h-20 rounded-[24px] object-cover border-4 border-white shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-[#7c3aed] to-[#6366f1] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow border-2 border-white">
              {currentWaiter.id}
            </span>
          </div>
          
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins text-center tracking-tight mb-2">
            Welcome back, {currentWaiter.name}!
          </h1>
          <p className="text-[#64748b] text-[13px] text-center max-w-[240px] leading-relaxed mb-8">
            Enter your 4-digit passcode PIN to access your terminal.
          </p>

          {/* Passcode Dots */}
          <motion.div 
            animate={controls}
            className="flex gap-4 mb-10"
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
                        ? '#2563eb' 
                        : '#cbd5e1'
                  }}
                  className="w-4.5 h-4.5 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              );
            })}
          </motion.div>

          {/* virtual keypad grid */}
          <div className="grid grid-cols-3 gap-y-3.5 gap-x-8 max-w-[280px]">
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
      ) : (
        /* Waiter ID Sign-In Card / Profile Grid Roster */
        <div className="flex-1 flex flex-col justify-center items-center py-8 z-10 max-w-2xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-tr from-[#2563eb] to-[#4f46e5] text-white rounded-2xl shadow-lg shadow-blue-500/15 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">
              Waiter Sign In
            </h1>
            <p className="text-[#64748b] text-[13.5px] mt-1.5 leading-relaxed max-w-sm mx-auto">
              Select your profile roster card or enter your Waiter ID below to sign in.
            </p>
          </div>

          {!waitersLoaded ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-400">Loading active waiter roster...</p>
            </div>
          ) : waiters.length === 0 ? (
            <div className="text-center py-10 px-6 bg-white border border-[#f1f5f9] rounded-[28px] shadow-sm max-w-md w-full flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-[15px] text-[#0f172a] font-poppins">No Registered Waiters</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
                  There are no waiters registered in the system yet. Please register staff in the Admin Portal.
                </p>
              </div>
              <button 
                onClick={() => navigate('/admin/login')}
                className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-650 text-white font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider shadow hover:opacity-95 cursor-pointer active:scale-98 transition-all"
              >
                Go to Admin Portal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-8">
              {waiters.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setActiveWaiterId(w.id);
                    setLoginError(null);
                  }}
                  className="bg-white border border-[#f1f5f9] rounded-[24px] p-4 text-center shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative">
                    <img 
                      src={w.avatar} 
                      alt={w.name} 
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm border-2 border-white group-hover:border-blue-200 transition-colors"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-blue-600 to-indigo-650 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-white">
                      {w.id}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[13.5px] text-[#0f172a] font-poppins mt-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {w.name.split(' ')[0]}
                  </h3>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-2 border ${
                    w.onlineStatus 
                      ? 'bg-green-50 text-green-500 border-green-100' 
                      : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {w.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const found = waiters.find(w => w.id.toUpperCase() === inputWaiterId.toUpperCase() || w.email.toLowerCase() === inputWaiterId.toLowerCase());
              if (found) {
                setActiveWaiterId(found.id);
                setLoginError(null);
              } else {
                setLoginError('Invalid Waiter ID or email. Please check your credentials.');
              }
            }}
            className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm max-w-sm w-full space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Or Enter ID / Email Manual</label>
              <input
                type="text"
                required
                placeholder="e.g. W-01"
                value={inputWaiterId}
                onChange={(e) => setInputWaiterId(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 uppercase"
              />
            </div>

            {loginError && (
              <p className="text-[11px] font-bold text-red-500 ml-1">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/15 hover:opacity-95 cursor-pointer active:scale-98 transition-all"
            >
              Continue to PIN pad
            </button>
          </form>
        </div>
      )}

      {/* Footer Details */}
      <div className="text-center z-10 text-[11px] text-[#94a3b8] font-semibold tracking-wide uppercase mt-6">
        Smart Restaurant POS System
      </div>
    </div>
  );
}
