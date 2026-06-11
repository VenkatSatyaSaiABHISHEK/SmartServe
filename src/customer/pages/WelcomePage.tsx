import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Sparkles, MapPin, Leaf, Flame, Utensils } from 'lucide-react';
import { enterFullscreen } from '../utils/fullscreen';

export function WelcomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setDietPreference = useCartStore((state) => state.setDietPreference);
  const setTableNumber    = useCartStore((state) => state.setTableNumber);
  const setGuestsCount    = useCartStore((state) => state.setGuestsCount);

  const tableNum   = searchParams.get('table');
  const guestsCount = searchParams.get('guests');

  useEffect(() => {
    if (tableNum)    setTableNumber(parseInt(tableNum));
    if (guestsCount) setGuestsCount(parseInt(guestsCount));
  }, [tableNum, guestsCount, setTableNumber, setGuestsCount]);

  const tableNumber = useCartStore((state) => state.tableNumber);
  const guests      = useCartStore((state) => state.guestsCount);

  const [step, setStep]                       = useState<'splash' | 'welcome'>('splash');
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);

  // Auto-fullscreen on first user interaction (tap/click)
  useEffect(() => {
    const triggerFullscreen = () => {
      enterFullscreen();
      window.removeEventListener('click', triggerFullscreen);
      window.removeEventListener('touchstart', triggerFullscreen);
    };
    window.addEventListener('click', triggerFullscreen);
    window.addEventListener('touchstart', triggerFullscreen);
    return () => {
      window.removeEventListener('click', triggerFullscreen);
      window.removeEventListener('touchstart', triggerFullscreen);
    };
  }, []);

  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('welcome'), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSelection = (preference: 'all' | 'veg' | 'non-veg') => {
    enterFullscreen();
    setDietPreference(preference);
    setShowPreferenceModal(false);
    navigate('/home');
  };

  const welcomeLetters = 'Welcome'.split('');

  const letterColors = [
    ['#ff007f', '#ff5e00', '#ffa200', '#00bfa5', '#00b0ff', '#7c4dff', '#ff007f'], // W
    ['#ff5e00', '#ffa200', '#00bfa5', '#00b0ff', '#7c4dff', '#ff007f', '#ff5e00'], // e
    ['#ffa200', '#00bfa5', '#00b0ff', '#7c4dff', '#ff007f', '#ff5e00', '#ffa200'], // l
    ['#00bfa5', '#00b0ff', '#7c4dff', '#ff007f', '#ff5e00', '#ffa200', '#00bfa5'], // c
    ['#00b0ff', '#7c4dff', '#ff007f', '#ff5e00', '#ffa200', '#00bfa5', '#00b0ff'], // o
    ['#7c4dff', '#ff007f', '#ff5e00', '#ffa200', '#00bfa5', '#00b0ff', '#7c4dff'], // m
    ['#ff007f', '#ff5e00', '#ffa200', '#00bfa5', '#00b0ff', '#7c4dff', '#ff007f'], // e
  ];

  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-white flex flex-col select-none" style={{ fontFamily: "'Outfit', 'Poppins', sans-serif" }}>
      <AnimatePresence mode="wait">

        {/* ══════════════════ SPLASH SCREEN ══════════════════ */}
        {step === 'splash' ? (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col items-center bg-white overflow-hidden"
          >
            {/* ─── Welcome — letter-by-letter animation ─── */}
            <div className="mt-24 z-10 flex flex-col items-center gap-2">
              <div className="flex items-end gap-[2px]">
                {welcomeLetters.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      opacity: 0,
                      scale: 0.1,
                      y: 50,
                      rotateX: 45,
                      rotateY: -20,
                      filter: 'blur(10px)',
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotateX: 0,
                      rotateY: 0,
                      filter: 'blur(0px)',
                      color: letterColors[i],
                    }}
                    transition={{
                      opacity: { delay: 0.2 + i * 0.08, duration: 0.4 },
                      scale: { delay: 0.2 + i * 0.08, type: 'spring', stiffness: 140, damping: 12 },
                      y: { delay: 0.2 + i * 0.08, type: 'spring', stiffness: 140, damping: 12 },
                      rotateX: { delay: 0.2 + i * 0.08, duration: 0.4 },
                      rotateY: { delay: 0.2 + i * 0.08, duration: 0.4 },
                      filter: { delay: 0.2 + i * 0.08, duration: 0.4 },
                      color: {
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: 1.0 + i * 0.1,
                      }
                    }}
                    className="text-5xl font-black tracking-tight select-none drop-shadow-[0_2px_12px_rgba(99,102,241,0.12)]"
                    style={{
                      display: 'inline-block',
                      transformStyle: 'preserve-3d',
                      fontFamily: "'Outfit', 'Poppins', sans-serif",
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* ─── Lottie animation (center, larger) ─── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
              className="flex-1 flex items-center justify-center z-10 w-full"
            >
              <div className="w-80 h-80">
                <DotLottieReact
                  src="https://lottie.host/9bd2b472-d31e-49dd-932f-c9a8168df0dc/zfJeJqYFv9.lottie"
                  loop
                  autoplay
                  renderConfig={{
                    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
                    autoResize: true,
                  }}
                />
              </div>
            </motion.div>

          </motion.div>

        ) : (

        /* ══════════════════ WELCOME SCREEN ══════════════════ */
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 flex flex-col justify-between p-6 bg-white"
          >
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-gradient-to-tr from-blue-500/5 to-purple-500/5 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[60%] aspect-square rounded-full bg-gradient-to-br from-indigo-500/5 to-pink-500/5 blur-[80px] pointer-events-none" />

            {/* Top */}
            <div className="flex flex-col items-center text-center mt-8 z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-3">
                <Utensils className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Welcome to your Table
              </h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                Premium Digital Dining Experience
              </p>
            </div>

            {/* Mascot */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
              <div className="w-64 h-64 flex items-center justify-center overflow-hidden">
                <DotLottieReact
                  src="https://lottie.host/88c4db61-6ab9-486b-96dd-05184f59a3e4/aikygm8ygq.lottie"
                  loop
                  autoplay
                  renderConfig={{
                    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
                    autoResize: true,
                  }}
                />
              </div>
            </div>

            {/* Bottom */}
            <div className="flex flex-col items-center gap-5 mb-8 z-10 w-full px-6">
              {tableNumber > 0 ? (
                <>
                  <div className="text-center">
                    <p className="text-slate-500 font-extrabold text-[15px]">
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

                  <motion.button
                    onClick={() => {
                      enterFullscreen();
                      setShowPreferenceModal(true);
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    animate={{
                      boxShadow: [
                        '0 10px 20px -10px rgba(37,99,235,0.4)',
                        '0 10px 25px -5px rgba(37,99,235,0.6)',
                        '0 10px 20px -10px rgba(37,99,235,0.4)',
                      ],
                    }}
                    transition={{ boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
                    className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black uppercase tracking-wider text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Order Now
                  </motion.button>
                </>
              ) : (
                <div className="w-full max-w-xs bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] text-center space-y-4">
                  <div className="flex flex-col items-center">
                    <MapPin className="w-6 h-6 text-slate-400 mb-2" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No Table Detected</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal mt-1 max-w-[200px]">
                      Please scan the table QR code, or enter your dining table details manually:
                    </p>
                  </div>

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
                      enterFullscreen();
                      const tInput = document.getElementById('manual-table-input') as HTMLInputElement;
                      const gInput = document.getElementById('manual-guests-input') as HTMLSelectElement;
                      const tVal = parseInt(tInput?.value || '');
                      const gVal = parseInt(gInput?.value || '4');
                      if (isNaN(tVal) || tVal <= 0) { alert('Please enter a valid table number.'); return; }
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

      {/* ══════════════════ FOOD PREFERENCE MODAL ══════════════════ */}
      <AnimatePresence>
        {showPreferenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreferenceModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative border border-slate-100 z-10 flex flex-col gap-5"
            >
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800">Choose Your Preference</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">What would you like to browse?</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={() => handleSelection('veg')}
                  className="bg-[#f2fdf5] border-2 border-emerald-100 hover:border-emerald-500 rounded-3xl p-4 flex flex-col items-center text-center gap-3 transition-all cursor-pointer active:scale-95 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                    <Leaf className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[13px] text-emerald-900">Vegetarian</h4>
                    <p className="text-[9.5px] text-emerald-600/70 font-semibold mt-0.5">Fresh Veg Dishes</p>
                  </div>
                  <span className="w-full py-1.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider mt-1">View Veg</span>
                </button>

                <button
                  onClick={() => handleSelection('non-veg')}
                  className="bg-[#fff8f5] border-2 border-orange-100 hover:border-orange-500 rounded-3xl p-4 flex flex-col items-center text-center gap-3 transition-all cursor-pointer active:scale-95 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[13px] text-orange-950">Non-Veg</h4>
                    <p className="text-[9.5px] text-orange-700/70 font-semibold mt-0.5">Savory Poultry/Meat</p>
                  </div>
                  <span className="w-full py-1.5 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider mt-1">View Non-Veg</span>
                </button>
              </div>

              <button
                onClick={() => handleSelection('all')}
                className="w-full py-3 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 text-slate-700 hover:text-blue-700 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Utensils className="w-4 h-4" /> View All Menu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
