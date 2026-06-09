import { useEffect, useRef, useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Camera, RefreshCw, Radio, Play, Circle, VideoOff } from 'lucide-react';

export function CameraMonitoringPage() {
  const { cameras, toggleCameraStatus } = useAdminStore();
  const [timestamp, setTimestamp] = useState('');

  // Update timestamps for camera feeds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimestamp(now.toLocaleDateString() + ' ' + now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">CCTV MONITORING STATION</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Simulated live security feeds for kitchen stations, prep counters, and guest floor.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[11.5px] font-black uppercase tracking-wider">
          <Circle className="w-3.5 h-3.5 fill-red-600 animate-ping" />
          <span>HQ Rec Stream Active</span>
        </div>
      </div>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6.5">
        {cameras.map((cam) => {
          const isOnline = cam.status === 'Online';
          
          return (
            <div key={cam.id} className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
              
              {/* CCTV Feed Screen Wrapper */}
              <div className="h-64 bg-slate-950 relative flex items-center justify-center overflow-hidden">
                {isOnline ? (
                  <>
                    {/* Simulated scanning lines */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent bg-[length:100%_4px] pointer-events-none animate-scan-lines z-10" />
                    
                    {/* Simulated noise or abstract graphics */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_60%,rgba(0,0,0,0.5)_100%)] z-10 pointer-events-none" />

                    {/* Camera graphic simulation: canvas/iframe fallback with cool grid */}
                    <div className="w-full h-full opacity-35 bg-slate-900 grid grid-cols-6 grid-rows-4 gap-1 p-2">
                      {Array.from({ length: 24 }).map((_, idx) => (
                        <div key={idx} className="border border-white/5 rounded flex items-center justify-center text-[10px] text-white/5 font-black uppercase">
                          {cam.id}-{idx}
                        </div>
                      ))}
                    </div>

                    {/* Live indicator overlay */}
                    <div className="absolute top-4.5 left-4.5 z-20 flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full">
                      <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span className="text-[9.5px] font-black text-white uppercase tracking-wider">LIVE</span>
                    </div>

                    {/* Camera Info Overlay */}
                    <div className="absolute bottom-4.5 left-4.5 z-20 bg-slate-900/60 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white leading-relaxed">
                      <div>Node: {cam.name}</div>
                      <div>FPS: {cam.fps} • 1080p Stream</div>
                    </div>

                    {/* Time Stamp overlay */}
                    <div className="absolute top-4.5 right-4.5 z-20 bg-slate-900/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-[9.5px] font-black text-white font-mono tracking-wider">
                      {timestamp}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-500 space-y-3 z-10">
                    <VideoOff className="w-12 h-12 stroke-[1.2] mx-auto text-slate-600" />
                    <div>
                      <h4 className="font-extrabold text-[13px] text-slate-400">Stream Disconnected</h4>
                      <p className="text-[9.5px] text-slate-500 font-semibold mt-1">CCTV Node Status: Offline</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="p-5 flex items-center justify-between border-t border-slate-50">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cam.id} Node</span>
                  <h4 className="font-extrabold text-[14.5px] text-[#0f172a] font-poppins leading-tight">{cam.name}</h4>
                </div>

                <button
                  onClick={() => toggleCameraStatus(cam.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isOnline 
                      ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100/50' 
                      : 'bg-green-50 text-green-500 border border-green-100 hover:bg-green-100/50'
                  }`}
                >
                  {isOnline ? 'Shut Off' : 'Wake Stream'}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
