import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChefHat, Bike, MapPin, Bell, User } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';

const TIMELINE = [
  { id: 'Confirmed', title: 'Order Confirmed', icon: Check, time: '12:30 PM' },
  { id: 'Preparing', title: 'Preparing', icon: ChefHat, time: '12:35 PM' },
  { id: 'On The Way', title: 'On The Way', icon: Bike, time: '--:--' },
  { id: 'Delivered', title: 'Delivered', icon: MapPin, time: '--:--' },
];

export function OrderTrackingPage() {
  const status = useOrderStore(state => state.status);
  const estimatedTimeMins = useOrderStore(state => state.estimatedTimeMins);
  const setStatus = useOrderStore(state => state.setStatus);

  // Simulate order progress
  useEffect(() => {
    if (status === 'Confirmed') {
      const timer = setTimeout(() => setStatus('Preparing'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, setStatus]);

  const currentStepIndex = TIMELINE.findIndex(step => step.id === status);
  const progress = (currentStepIndex / (TIMELINE.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#fafafc] pb-12">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-center relative">
        <h1 className="text-xl font-bold text-slate-800">Track Order</h1>
      </div>

      {/* Progress Ring */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="8"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: "553", strokeDashoffset: "553" }}
              animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-slate-800">{estimatedTimeMins}</span>
            <span className="text-sm font-medium text-slate-500">mins</span>
          </div>
        </div>
        <p className="mt-6 text-xl font-bold text-slate-800">Being Prepared 🍽️</p>
      </div>

      {/* Timeline */}
      <div className="px-8 mt-8">
        <div className="relative border-l-2 border-slate-100 ml-6 pb-4">
          {TIMELINE.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="relative pl-8 pb-8 last:pb-0">
                <div 
                  className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-4 border-[#fafafc] transition-colors duration-500 ${
                    isCompleted ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                
                <div className="flex flex-col">
                  <h4 className={`font-bold text-lg ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.title}
                  </h4>
                  <p className="text-sm font-medium text-slate-400 mt-0.5">{step.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-6 mt-12 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-[160px] bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Orders Ahead</p>
            <p className="text-xl font-bold text-slate-800">2</p>
          </div>
        </div>

        <div className="min-w-[160px] bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Assigned Waiter</p>
            <p className="text-xl font-bold text-slate-800">John</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-[24px] p-6 text-white flex items-start gap-4 shadow-xl shadow-purple-500/20">
          <div className="bg-white/20 p-3 rounded-2xl shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-lg">Notification</h4>
            <p className="text-white/80 text-sm leading-relaxed">
              We will notify you when your order is on the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
