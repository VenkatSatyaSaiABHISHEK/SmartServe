import { useNavigate } from 'react-router-dom';
import { useChefStore } from '../store/useChefStore';
import { ChefHat, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const { chefs, login } = useChefStore();
  const navigate = useNavigate();

  const handleLogin = (chefId: string) => {
    login(chefId);
    navigate('/chef');
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-tr from-[#7c3aed]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-br from-[#7c3aed]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6.5"
        >
          {chefs.map((chef, idx) => {
            const activeLoad = useChefStore.getState().getChefActiveLoad(chef.id);
            return (
              <motion.button
                key={chef.id}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLogin(chef.id)}
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
                  Kitchen Station
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

        {/* Footer Info */}
        <div className="mt-12 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-1.5">
          <Users className="w-4 h-4 text-slate-400" />
          <span>Real-time POS Automatic Load Balancer Active</span>
        </div>
      </div>
    </div>
  );
}
