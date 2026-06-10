import { Camera, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function CameraMonitoringPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 select-none font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[32px] p-8 shadow-xl shadow-slate-100/40 text-center space-y-6 flex flex-col items-center animate-fade-in">
        
        {/* Animated Camera Icon */}
        <div className="relative">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[22px] flex items-center justify-center shadow-inner">
            <Camera className="w-8 h-8" />
          </div>
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full uppercase tracking-wider">
            Station Update Pending
          </span>
          <h2 className="text-2xl font-black text-slate-800 font-poppins tracking-tight mt-2">
            CCTV Integration Coming Soon
          </h2>
          <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto leading-relaxed uppercase tracking-wider mt-1">
            Real-time restaurant hardware feed stream nodes & RTSP IP cameras config parameters panel.
          </p>
        </div>

        {/* Informative Divider card */}
        <div className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl p-4.5 flex items-center gap-3.5 text-left text-xs font-semibold text-slate-500 leading-snug">
          <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
          <span>Our hardware integration team is configuring the local RTSP gateway mirror. Live kitchen camera streaming will be fully operational shortly.</span>
        </div>

        {/* Micro Loader Animation */}
        <div className="w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: [-192, 192] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="bg-indigo-500 w-24 h-1.5 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
