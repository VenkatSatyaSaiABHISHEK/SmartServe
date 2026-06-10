import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Sparkles } from 'lucide-react';

export function WelcomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setDietPreference = useCartStore((state) => state.setDietPreference);
  const setTableNumber = useCartStore((state) => state.setTableNumber);
  const setGuestsCount = useCartStore((state) => state.setGuestsCount);
  
  const tableNum = searchParams.get('table');
  const guestsCount = searchParams.get('guests');

  // Save table and guests data to cart store on mount
  useEffect(() => {
    if (tableNum) {
      setTableNumber(parseInt(tableNum) || 12);
    }
    if (guestsCount) {
      setGuestsCount(parseInt(guestsCount) || 4);
    }
  }, [tableNum, guestsCount, setTableNumber, setGuestsCount]);

  const tableNumber = useCartStore((state) => state.tableNumber);
  const guests = useCartStore((state) => state.guestsCount);

  // Steps flow: 'splash' | 'welcome'
  const [step, setStep] = useState<'splash' | 'welcome'>('splash');
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);

  // Time based greeting calculation
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        text: 'Good Morning ☀️',
        type: 'morning',
        bg: 'from-amber-50 to-orange-100/60',
        textColor: 'text-amber-800'
      };
    } else if (hour >= 12 && hour < 19) {
      return {
        text: 'Good Afternoon 👋',
        type: 'afternoon',
        bg: 'from-blue-50 to-sky-100/60',
        textColor: 'text-sky-800'
      };
    } else {
      return {
        text: 'Good Evening 🌙',
        type: 'evening',
        bg: 'from-slate-900 via-slate-800 to-indigo-950',
        textColor: 'text-indigo-200'
      };
    }
  };

  const greeting = getGreetingData();

  // Transition from splash to welcome after exactly 3 seconds
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('welcome');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSelection = (preference: 'all' | 'veg' | 'non-veg') => {
    setDietPreference(preference);
    setShowPreferenceModal(false);
    navigate('/home');
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-[#fafafc] flex flex-col font-sans select-none">
      <AnimatePresence mode="wait">
        {step === 'splash' ? (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b ${greeting.bg} p-6`}
          >
            {/* Greeting Animation Content */}
            <div className="flex flex-col items-center gap-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-2"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center border border-slate-100">
                  <span className="text-2xl font-black text-blue-600 font-poppins">S</span>
                </div>
                <span className={`text-xl font-black tracking-widest ${greeting.type === 'evening' ? 'text-white' : 'text-slate-800'}`}>SMART SERVE</span>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className={`text-2xl font-extrabold tracking-tight ${greeting.textColor}`}
              >
                {greeting.text}
              </motion.h2>

              {/* Time-Based Custom Animations */}
              <div className="h-40 flex items-center justify-center relative w-64 mt-4">
                {greeting.type === 'morning' && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 80, delay: 0.7 }}
                    className="relative"
                  >
                    {/* Glowing Sun */}
                    <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/30 relative flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 bg-yellow-300 rounded-full blur-md opacity-50"
                      />
                    </div>
                  </motion.div>
                )}

                {greeting.type === 'afternoon' && (
                  <div className="relative w-full h-full">
                    {/* Floating clouds */}
                    <motion.div
                      animate={{ x: [-10, 10, -10] }}
                      transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                      className="absolute top-8 left-6 text-5xl"
                    >
                      ☁️
                    </motion.div>
                    <motion.div
                      animate={{ x: [15, -15, 15] }}
                      transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
                      className="absolute bottom-8 right-6 text-6xl opacity-80"
                    >
                      ☁️
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="text-4xl text-amber-500 absolute top-12 right-16"
                    >
                      ☀️
                    </motion.div>
                  </div>
                )}

                {greeting.type === 'evening' && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                      className="text-6xl mb-2 drop-shadow-[0_0_15px_rgba(251,243,219,0.3)]"
                    >
                      🌙
                    </motion.div>
                    {/* Tiny blinking stars */}
                    <div className="absolute top-6 left-12">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-xl text-yellow-200">★</motion.span>
                    </div>
                    <div className="absolute bottom-6 right-12">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="text-md text-yellow-200">★</motion.span>
                    </div>
                    <div className="absolute top-16 right-8">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.2 }} className="text-lg text-yellow-200">★</motion.span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 flex flex-col justify-between p-6 bg-[#ffffff]"
          >
            {/* Background Blobs for Visual Interest */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-gradient-to-tr from-blue-500/5 to-purple-500/5 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[60%] aspect-square rounded-full bg-gradient-to-br from-indigo-500/5 to-pink-500/5 blur-[80px] pointer-events-none" />

            {/* Top Greeting */}
            <div className="flex flex-col items-center text-center mt-6 z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                  S
                </div>
                <span className="text-sm font-black tracking-widest text-slate-800">SMART SERVE</span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight font-poppins">
                Welcome to SMART SERVE
              </h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                Smart Dining, Faster Service
              </p>
            </div>

            {/* Center Mascot Animation */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
              <div className="w-64 h-64 flex items-center justify-center overflow-hidden">
                <DotLottieReact
                  src="https://lottie.host/88c4db61-6ab9-486b-96dd-05184f59a3e4/aikygm8ygq.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col items-center gap-5 mb-8 z-10">
              <div className="text-center">
                <p className="text-slate-500 font-extrabold text-[15px] font-poppins">
                  Ready to enjoy your meal today?
                </p>
                
                <div className="flex gap-3 mt-4 justify-center">
                  <div className="bg-slate-50/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[80px]">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Table</span>
                    <span className="text-base font-black text-slate-800 mt-0.5">{tableNumber}</span>
                  </div>
                  <div className="bg-slate-50/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[80px]">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Guests</span>
                    <span className="text-base font-black text-slate-800 mt-0.5">{guests}</span>
                  </div>
                </div>
              </div>

              {/* Large Attractive Order Now Button */}
              <motion.button
                onClick={() => setShowPreferenceModal(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    '0 10px 20px -10px rgba(37,99,235,0.4)',
                    '0 10px 25px -5px rgba(37,99,235,0.6)',
                    '0 10px 20px -10px rgba(37,99,235,0.4)'
                  ]
                }}
                transition={{
                  boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                }}
                className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black uppercase tracking-wider text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Order Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen 3: Food Preference Popup Modal */}
      <AnimatePresence>
        {showPreferenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreferenceModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative border border-slate-100 z-10 flex flex-col gap-5"
            >
              {/* Header */}
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800 font-poppins">Choose Your Preference</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">What would you like to browse?</p>
              </div>

              {/* Preference Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Vegetarian Card */}
                <button
                  onClick={() => handleSelection('veg')}
                  className="bg-[#f2fdf5] border-2 border-emerald-100 hover:border-emerald-500 rounded-3xl p-4 flex flex-col items-center text-center gap-3 transition-all cursor-pointer active:scale-95 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110">
                    🥗
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[13px] text-emerald-900 font-poppins">Vegetarian</h4>
                    <p className="text-[9.5px] text-emerald-600/70 font-semibold mt-0.5">Fresh Veg Dishes</p>
                  </div>
                  <span className="w-full py-1.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider mt-1">
                    View Veg
                  </span>
                </button>

                {/* Non-Vegetarian Card */}
                <button
                  onClick={() => handleSelection('non-veg')}
                  className="bg-[#fff8f5] border-2 border-orange-100 hover:border-orange-500 rounded-3xl p-4 flex flex-col items-center text-center gap-3 transition-all cursor-pointer active:scale-95 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110">
                    🍗
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[13px] text-orange-950 font-poppins">Non-Veg</h4>
                    <p className="text-[9.5px] text-orange-700/70 font-semibold mt-0.5">Savory Poultry/Meat</p>
                  </div>
                  <span className="w-full py-1.5 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider mt-1">
                    View Non-Veg
                  </span>
                </button>
              </div>

              {/* Option 3: View All Menu */}
              <button
                onClick={() => handleSelection('all')}
                className="w-full py-3 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 text-slate-700 hover:text-blue-700 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
              >
                🍽️ View All Menu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
