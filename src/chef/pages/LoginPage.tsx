import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChefStore } from '../store/useChefStore';
import { ChefHat, Star, Users, ArrowLeft, Delete } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

export function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { chefs, activeChef, login, listenToChefs } = useChefStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chefIdParam = searchParams.get('id');
  const [activeChefId, setActiveChefId] = useState<string | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    const unsubscribe = listenToChefs();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [listenToChefs]);

  useEffect(() => {
    if (activeChef) {
      navigate('/chef/preparing');
    }
  }, [activeChef, navigate]);

  const currentChefId = chefIdParam || activeChefId;
  const currentChef = chefs.find(c => c.id === currentChefId);

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
      if (pin.length === 4 && currentChef) {
        const success = await login(currentChef.id, pin);
        if (success) {
          navigate('/chef/preparing');
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
  }, [pin, currentChef, login, navigate, controls]);

  const keypadKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'C', '0', 'del'
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-between p-6 select-none font-sans relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-tr from-[#7c3aed]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-br from-[#7c3aed]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex justify-between items-center z-10">
        <button 
          onClick={() => {
            if (activeChefId) {
              setActiveChefId(null);
              setPin('');
            } else {
              navigate('/');
            }
          }}
          className="p-3 bg-white rounded-full shadow-sm border border-[#f1f5f9] text-[#475569] flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider pr-1">
            {activeChefId ? 'Back to Roster' : 'Customer UI'}
          </span>
        </button>
        <span className="text-[11px] font-bold text-slate-400 bg-white border border-[#f1f5f9] px-3.5 py-1.5 rounded-full shadow-sm">
          KITCHEN DISPLAY TERMINAL
        </span>
      </div>

      {currentChef ? (
        /* Personalized PIN Entry Keypad Screen */
        <div className="flex-1 flex flex-col justify-center items-center py-8 z-10">
          <div className="relative mb-6">
            <img 
              src={currentChef.avatar} 
              alt={currentChef.name} 
              className="w-20 h-20 rounded-[24px] object-cover border-4 border-white shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow border-2 border-white">
              {currentChef.id}
            </span>
          </div>
          
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins text-center tracking-tight mb-2">
            Welcome, {currentChef.name}!
          </h1>
          <p className="text-[#64748b] text-[13px] text-center max-w-[240px] leading-relaxed mb-8">
            Enter your 4-digit passcode PIN to access your cooking terminal.
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
        /* Profiles Selection Grid Screen */
        <div className="flex-1 flex flex-col justify-center items-center py-8 z-10 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex p-4.5 bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] text-white rounded-[24px] shadow-xl shadow-purple-500/20 mb-5"
            >
              <ChefHat className="w-10 h-10 stroke-[1.5]" />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight text-[#0f172a] font-poppins"
            >
              Kitchen Display System
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-[#64748b] text-[15px] font-medium mt-2.5 max-w-md mx-auto leading-relaxed"
            >
              Select your chef account profile to log in and access the active cooking prep queue terminals.
            </motion.p>
          </div>

          {/* Chef Selection Grid */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6.5 w-full"
          >
            {chefs.map((chef) => {
              const activeLoad = useChefStore.getState().getChefActiveLoad(chef.id);
              return (
                <motion.button
                  key={chef.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveChefId(chef.id)}
                  className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 text-left shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-purple-100/40 hover:border-purple-300/50 transition-all flex flex-col items-center cursor-pointer group w-full"
                >
                  <div className="relative">
                    <img 
                      src={chef.avatar} 
                      alt={chef.name} 
                      className="w-24 h-24 rounded-[22px] object-cover shadow-md border-2 border-white group-hover:border-purple-200 transition-colors"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md border-2 border-white">
                      {chef.id}
                    </span>
                  </div>

                  <h3 className="font-black text-[18px] text-[#0f172a] font-poppins mt-5 text-center group-hover:text-[#7c3aed] transition-colors leading-tight">
                    {chef.name}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {chef.section || 'Kitchen Station'}
                  </p>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1.5 mt-3 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                    <span>{chef.rating} rating</span>
                  </div>

                  {/* Status info */}
                  <div className="w-full mt-6 pt-5 border-t border-[#f1f5f9] flex justify-between text-center gap-2">
                    <div>
                      <span className="block text-[15px] font-black text-[#0f172a]">{chef.ordersPrepared}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prepared</span>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-100 self-center" />
                    <div>
                      <span className={`block text-[15px] font-black ${activeLoad > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`}>
                        {activeLoad}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Load</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="w-full mt-6 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white text-center py-3 rounded-2xl font-bold text-xs shadow-md shadow-purple-500/10 group-hover:shadow-purple-500/25 transition-all">
                    Access Terminal
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-1.5 z-10">
        <Users className="w-4 h-4 text-slate-400" />
        <span>Real-time POS Automatic Load Balancer Active</span>
      </div>
    </div>
  );
}
