import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ParticleEffect } from '../components/animations/ParticleEffect';
import { useCartStore } from '../store/useCartStore';

export function WelcomePage() {
  const navigate = useNavigate();
  const setDietPreference = useCartStore((state) => state.setDietPreference);

  const handleSelection = (preference: 'all' | 'veg' | 'non-veg') => {
    setDietPreference(preference);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col items-center justify-center relative overflow-hidden font-sans pb-16">
      {/* Background blobs for premium glowing look */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-gradient-to-tr from-[#e0e7ff]/40 to-[#f3e8ff]/50 blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] aspect-square rounded-full bg-gradient-to-br from-[#e0f2fe]/40 to-[#f3e8ff]/40 blur-[80px]" />
      
      <ParticleEffect />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center px-6 max-w-sm w-full"
      >
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[#7c3aed] font-bold tracking-[0.2em] uppercase text-[12px] mb-2"
        >
          Welcome
        </motion.p>
        <h1 className="text-3xl font-black text-[#0f172a] tracking-tight mb-3 leading-tight font-poppins">
          My Dear Customer
        </h1>
        <p className="text-[#64748b] font-medium text-[14px] italic mb-6">
          "We are happy to serve you today ❤️"
        </p>

        <div className="flex gap-4 mb-8">
          <div className="bg-white px-5 py-3 rounded-[20px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col items-center min-w-[90px]">
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mb-0.5">Table</p>
            <p className="text-xl font-black text-[#0f172a]">12</p>
          </div>
          <div className="bg-white px-5 py-3 rounded-[20px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col items-center min-w-[90px]">
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mb-0.5">Guests</p>
            <p className="text-xl font-black text-[#0f172a]">4</p>
          </div>
        </div>

        {/* Veg / Non-Veg Dietary Selection */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-[28px] border border-[#f1f5f9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] w-full flex flex-col items-center">
          <p className="text-[13px] text-[#64748b] font-bold mb-4 font-poppins">Select your food preference:</p>
          <div className="flex flex-col gap-2.5 w-full">
            <button 
              onClick={() => handleSelection('veg')}
              className="flex items-center justify-between bg-white px-5 py-3.5 rounded-[20px] border border-[#22c55e]/15 hover:border-[#22c55e] hover:bg-green-50/10 shadow-sm text-[#16a34a] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-[#16a34a] flex items-center justify-center p-0.5 rounded-sm">
                  <span className="w-2 h-2 bg-[#16a34a] rounded-full" />
                </span>
                <span className="text-[14px]">Pure Vegetarian</span>
              </div>
              <span className="text-[12px] opacity-75">🟢</span>
            </button>
            
            <button 
              onClick={() => handleSelection('non-veg')}
              className="flex items-center justify-between bg-white px-5 py-3.5 rounded-[20px] border border-[#ef4444]/15 hover:border-[#ef4444] hover:bg-red-50/10 shadow-sm text-[#dc2626] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-[#dc2626] flex items-center justify-center p-0.5 rounded-sm">
                  <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-[#dc2626]" />
                </span>
                <span className="text-[14px]">Non-Vegetarian</span>
              </div>
              <span className="text-[12px] opacity-75">🔴</span>
            </button>
            
            <button 
              onClick={() => handleSelection('all')}
              className="bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white px-5 py-3.5 rounded-[20px] shadow-md shadow-indigo-500/15 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Show All Foods
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating Plate Frame */}
      <motion.div 
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 0.8, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute bottom-[-20%] w-full flex justify-center pointer-events-none z-0"
      >
        <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-[6px] border-white bg-white">
          <img 
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" 
            alt="Food Plate" 
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}
