import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChefHat, Bike, MapPin, Bell, User, ChevronLeft } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const TIMELINE = [
  { id: 'Confirmed', title: 'Order Confirmed', icon: Check, time: 'Just now' },
  { id: 'Preparing', title: 'Kitchen Preparing', icon: ChefHat, time: 'Cooking' },
  { id: 'On The Way', title: 'On The Way', icon: Bike, time: 'Delivery' },
  { id: 'Delivered', title: 'Delivered & Enjoy', icon: MapPin, time: 'Arrived' },
];

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const status = useOrderStore(state => state.status);
  const estimatedTimeMins = useOrderStore(state => state.estimatedTimeMins);
  const setStatus = useOrderStore(state => state.setStatus);
  const orderId = useOrderStore(state => state.orderId);

  const [timeLeft, setTimeLeft] = useState(estimatedTimeMins * 60);
  const [orderPrice, setOrderPrice] = useState<number | null>(null);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<string | null>(null);
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<string | null>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<string>('New');

  // 1. Firestore Real-Time tracking effect
  useEffect(() => {
    if (!orderId) return;

    const unsub = onSnapshot(doc(db, 'orders', orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        let mappedStatus: any = 'Confirmed';
        if (data.status === 'Preparing' || data.status === 'Ready') {
          mappedStatus = 'Preparing';
        } else if (data.status === 'Picked Up') {
          mappedStatus = 'On The Way';
        } else if (data.status === 'Completed' || data.status === 'Delivered') {
          mappedStatus = 'Delivered';
        }
        
        setStatus(mappedStatus);
        setFirestoreStatus(data.status);

        if (data.price) setOrderPrice(data.price);
        if (data.paymentMethod) setOrderPaymentMethod(data.paymentMethod);
        if (data.paymentStatus) setOrderPaymentStatus(data.paymentStatus);

        if (data.completedAt) {
          const secsLeft = Math.max(0, Math.round((data.completedAt - Date.now()) / 1000));
          setTimeLeft(secsLeft);
        } else {
          setTimeLeft(data.prepTimeMins * 60);
        }
      }
    });

    return () => unsub();
  }, [orderId, setStatus]);

  // Sync state if estimated time changes (fallback)
  useEffect(() => {
    if (orderId) return;
    setTimeLeft(estimatedTimeMins * 60);
  }, [estimatedTimeMins, orderId]);

  // Countdown timer effect (fallback)
  useEffect(() => {
    if (orderId) {
      if (timeLeft <= 0) return;
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }

    if (timeLeft <= 0) {
      setStatus('Delivered');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, setStatus, orderId]);

  const totalSeconds = estimatedTimeMins * 60;
  const elapsedPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  // Dynamic status transition (fallback)
  useEffect(() => {
    if (orderId) return;

    if (elapsedPercent >= 95) {
      setStatus('Delivered');
    } else if (elapsedPercent >= 75) {
      setStatus('On The Way');
    } else if (elapsedPercent >= 5) {
      setStatus('Preparing');
    } else {
      setStatus('Confirmed');
    }
  }, [elapsedPercent, setStatus, orderId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStepIndex = TIMELINE.findIndex(step => step.id === status);

  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-[#fafafc] flex flex-col font-sans select-none">
      
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0 bg-white border-b border-slate-100">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest font-poppins">Track Order</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Scrollable Track Progress Area */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-4 pb-20">
        
        {/* Progress Ring */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="6"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ strokeDasharray: "452", strokeDashoffset: "452" }}
                animate={{ strokeDashoffset: 452 - (452 * elapsedPercent) / 100 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-850 font-poppins">{formatTime(timeLeft)}</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 mt-0.5">{status}</span>
            </div>
          </div>
          <p className="mt-4 text-sm font-extrabold text-slate-800 font-poppins text-center">
            {status === 'Delivered' ? 'Enjoy your food! 🍽️' :
             status === 'On The Way' ? 'Waiter is serving your food! 🏃‍♂️' :
             status === 'Preparing' ? (firestoreStatus === 'Ready' ? 'Food plated, waiting for waiter! 🛎️' : 'Chef is cooking your dish! 🍳') :
             'Order Confirmed & Placed! 📝'}
          </p>
        </div>

        {/* Timeline Progress */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] mt-3">
          <div className="relative border-l border-slate-150 ml-3.5 pb-2">
            {TIMELINE.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;

              return (
                <div key={step.id} className="relative pl-7 pb-6 last:pb-0">
                  <div 
                    className={`absolute -left-[14px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm border-2 border-white transition-colors duration-300 ${
                      isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  
                  <div className="flex flex-col">
                    <h4 className={`font-extrabold text-xs ${isCompleted ? 'text-slate-850 font-poppins' : 'text-slate-400'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{step.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Info Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <ChefHat className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Orders Ahead</p>
              <p className="text-sm font-black text-slate-800 font-poppins">2</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Waiter</p>
              <p className="text-sm font-black text-slate-800 font-poppins">John</p>
            </div>
          </div>
        </div>

        {/* Live Notification Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white flex items-start gap-3 mt-4 shadow-md shadow-blue-500/10">
          <div className="bg-white/20 p-2 rounded-xl shrink-0 text-white">
            <Bell className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs font-poppins">Notification</h4>
            <p className="text-white/80 text-[10px] font-semibold leading-relaxed mt-0.5">
              We will notify you when your order is on the way.
            </p>
          </div>
        </div>

        {/* Order Payment Summary Card */}
        {orderPrice !== null && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-between items-center mt-4">
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Amount Paid</p>
              <h3 className="text-base font-black text-slate-800 font-poppins mt-0.5">₹{orderPrice.toFixed(2)}</h3>
            </div>
            <div className="text-right">
              <span className="inline-block text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">
                {orderPaymentStatus || 'Paid'}
              </span>
              <p className="text-[9.5px] text-slate-400 font-bold mt-1">via {orderPaymentMethod?.toUpperCase() || 'GPAY'}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
