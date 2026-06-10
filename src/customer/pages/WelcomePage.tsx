import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Sparkles, Sun, Cloud, Moon, Star } from 'lucide-react';

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
      setTableNumber(parseInt(tableNum));
    }
    if (guestsCount) {
      setGuestsCount(parseInt(guestsCount));
    }
  }, [tableNum, guestsCount, setTableNumber, setGuestsCount]);

  const tableNumber = useCartStore((state) => state.tableNumber);
  const guests = useCartStore((state) => state.guestsCount);

  // Steps flow: 'splash' | 'welcome'
  const [step, setStep] = useState<'splash' | 'welcome'>('splash');
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Time based greeting calculation
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        text: 'Good Morning ☀️',
        type: 'morning',
        bg: 'from-orange-500 via-amber-300 to-amber-50',
        textColor: 'text-amber-950',
        subText: 'Rise and shine, your table is ready!'
      };
    } else if (hour >= 12 && hour < 19) {
      return {
        text: 'Good Afternoon 👋',
        type: 'afternoon',
        bg: 'from-sky-500 via-sky-300 to-sky-50',
        textColor: 'text-sky-950',
        subText: 'Delicious meals await your afternoon!'
      };
    } else {
      return {
        text: 'Good Evening 🌙',
        type: 'evening',
        bg: 'from-slate-950 via-slate-900 to-indigo-950',
        textColor: 'text-indigo-150',
        subText: 'Unwind with our premium dinner specials.'
      };
    }
  };

  const greeting = getGreetingData();

  // Progress Bar ticking
  useEffect(() => {
    if (step === 'splash') {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1.25; // Reaches ~100% in 3 seconds
        });
      }, 30);
      
      const timer = setTimeout(() => {
        setStep('welcome');
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
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
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className={`absolute inset-0 flex flex-col items-center justify-between bg-gradient-to-b ${greeting.bg} p-8`}
          >
            {/* Top Brand Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2 mt-8"
            >
              <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-slate-100">
                <span className="text-xl font-black text-blue-600 font-poppins">S</span>
              </div>
              <span className={`text-md font-black tracking-widest ${greeting.type === 'evening' ? 'text-white' : 'text-slate-800'}`}>
                SMART SERVE
              </span>
            </motion.div>

            {/* Center Dynamic Premium Animations */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full relative">
              
              {/* Animation Container */}
              <div className="h-44 w-full flex items-center justify-center relative">
                
                {/* 1. Morning Sunrise Animation */}
                {greeting.type === 'morning' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Glowing Sun Rays */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                      className="absolute w-36 h-36 border border-dashed border-amber-400/40 rounded-full flex items-center justify-center"
                    >
                      <div className="w-32 h-32 border border-dashed border-amber-300/30 rounded-full" />
                    </motion.div>

                    {/* Rising Sun */}
                    <motion.div
                      initial={{ y: 40, scale: 0.8 }}
                      animate={{ y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 50, damping: 10, delay: 0.4 }}
                      className="relative z-10 w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/40 flex items-center justify-center"
                    >
                      {/* Inner sun shine glow */}
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-yellow-300 rounded-full blur-md opacity-40"
                      />
                      <Sun className="w-9 h-9 text-white stroke-[2.5]" />
                    </motion.div>
                  </div>
                )}

                {/* 2. Afternoon Cloud Floating Animation */}
                {greeting.type === 'afternoon' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Glowing Sun behind clouds */}
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="absolute top-10 right-20 w-16 h-16 bg-amber-400 rounded-full blur-sm flex items-center justify-center shadow-lg shadow-amber-500/20"
                    >
                      <Sun className="w-8 h-8 text-white stroke-[2.5]" />
                    </motion.div>

                    {/* Main floating cloud */}
                    <motion.div
                      animate={{ x: [-8, 8, -8], y: [-2, 2, -2] }}
                      transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                      className="relative z-10 bg-white/80 backdrop-blur-sm px-5 py-3.5 rounded-full border border-slate-100/50 shadow-md flex items-center gap-2"
                    >
                      <Cloud className="w-6 h-6 text-sky-400 fill-sky-100" />
                      <span className="text-[11px] font-black uppercase text-sky-900 tracking-wider">Afternoon Specials</span>
                    </motion.div>

                    {/* Secondary decorative cloud */}
                    <motion.div
                      animate={{ x: [10, -10, 10] }}
                      transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
                      className="absolute bottom-8 left-16 bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-full border border-slate-100/30 shadow-sm opacity-80"
                    >
                      <Cloud className="w-4.5 h-4.5 text-sky-300" />
                    </motion.div>
                  </div>
                )}

                {/* 3. Evening Moonlight & Twinkling Stars Animation */}
                {greeting.type === 'evening' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Stars Cluster */}
                    <div className="absolute inset-0">
                      {[
                        { top: '15%', left: '20%', delay: 0 },
                        { top: '30%', left: '80%', delay: 0.4 },
                        { top: '70%', left: '25%', delay: 0.8 },
                        { top: '65%', left: '75%', delay: 1.2 },
                        { top: '20%', left: '60%', delay: 0.6 }
                      ].map((star, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0.2, scale: 0.6 }}
                          animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.1, 0.6] }}
                          transition={{ repeat: Infinity, duration: 2, delay: star.delay }}
                          className="absolute text-yellow-200"
                          style={{ top: star.top, left: star.left }}
                        >
                          <Star className="w-3.5 h-3.5 fill-yellow-200/50" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Crescent Moon */}
                    <motion.div
                      initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 60, delay: 0.4 }}
                      className="relative z-10 w-20 h-20 bg-gradient-to-tr from-indigo-200 to-yellow-100 rounded-full shadow-lg shadow-yellow-100/10 flex items-center justify-center"
                      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
                    >
                      <Moon className="w-10 h-10 text-indigo-900 fill-indigo-950 stroke-[2.2]" />
                    </motion.div>
                  </div>
                )}

              </div>

              {/* Greeting Text Block */}
              <div className="text-center space-y-1.5 z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`text-2xl font-black tracking-tight ${greeting.textColor}`}
                >
                  {greeting.text}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.8 }}
                  className={`text-xs font-semibold leading-relaxed max-w-[200px] mx-auto ${
                    greeting.type === 'evening' ? 'text-indigo-300' : 'text-slate-600'
                  }`}
                >
                  {greeting.subText}
                </motion.p>
              </div>
            </div>

            {/* Bottom Booting Loader */}
            <div className="w-full max-w-[240px] flex flex-col gap-2 mb-6 z-10">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                <span className={greeting.type === 'evening' ? 'text-indigo-300' : 'text-slate-400'}>
                  Preparing Table...
                </span>
                <span className={greeting.type === 'evening' ? 'text-white' : 'text-slate-700'}>
                  {Math.round(loadingProgress)}%
                </span>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    greeting.type === 'evening' ? 'from-indigo-400 to-purple-400' : 'from-blue-600 to-indigo-600'
                  }`}
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
            <div className="flex flex-col items-center gap-5 mb-8 z-10 w-full px-6">
              {tableNumber > 0 ? (
                <>
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
                </>
              ) : (
                <div className="w-full max-w-xs bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] text-center space-y-4">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-1">📍</span>
                    <h4 className="text-xs font-black text-slate-800 font-poppins uppercase tracking-wider">No Table Detected</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal mt-1 max-w-[200px]">
                      Please scan the table QR code, or enter your dining table details manually:
                    </p>
                  </div>
                  
                  {/* Manual Inputs */}
                  <div className="flex gap-2.5">
                    <div className="flex-1 flex flex-col items-start gap-1">
                      <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider pl-1">Table No.</span>
                      <input
                        type="number"
                        placeholder="Table"
                        id="manual-table-input"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-[#0f172a] text-center focus:outline-none focus:border-blue-500"
                        min="1"
                        max="50"
                      />
                    </div>
                    <div className="flex-1 flex flex-col items-start gap-1">
                      <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider pl-1">No. of Guests</span>
                      <select
                        id="manual-guests-input"
                        defaultValue="4"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-[#0f172a] text-center focus:outline-none focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <option key={n} value={n}>{n} Pax</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const tInput = document.getElementById('manual-table-input') as HTMLInputElement;
                      const gInput = document.getElementById('manual-guests-input') as HTMLSelectElement;
                      const tVal = parseInt(tInput?.value || '');
                      const gVal = parseInt(gInput?.value || '4');
                      if (isNaN(tVal) || tVal <= 0) {
                        alert('Please enter a valid table number.');
                        return;
                      }
                      setTableNumber(tVal);
                      setGuestsCount(gVal);
                      setShowPreferenceModal(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Set Table & Order
                  </button>
                </div>
              )}
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
