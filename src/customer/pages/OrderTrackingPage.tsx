import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChefHat, Bike, MapPin, Bell, User } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const TIMELINE = [
  { id: 'Confirmed', title: 'Order Confirmed', icon: Check, time: 'Just now' },
  { id: 'Preparing', title: 'Kitchen Preparing', icon: ChefHat, time: 'Cooking' },
  { id: 'On The Way', title: 'On The Way', icon: Bike, time: 'Delivery' },
  { id: 'Delivered', title: 'Delivered & Enjoy', icon: MapPin, time: 'Arrived' },
];

export function OrderTrackingPage() {
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
      // If we are tracking via Firestore, let the ticking happen via now state,
      // or we can let this timer decrement timeLeft local state between firestore events to keep it smooth!
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
              animate={{ strokeDashoffset: 553 - (553 * elapsedPercent) / 100 }}
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
            <span className="text-3xl font-black text-slate-800 font-poppins">{formatTime(timeLeft)}</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 mt-0.5">{status}</span>
          </div>
        </div>
        <p className="mt-6 text-lg font-extrabold text-slate-800 font-poppins">
          {status === 'Delivered' ? 'Enjoy your food! 🍽️' :
           status === 'On The Way' ? 'Waiter is serving your food! 🏃‍♂️' :
           status === 'Preparing' ? (firestoreStatus === 'Ready' ? 'Food plated, waiting for waiter! 🛎️' : 'Chef is cooking your dish! 🍳') :
           'Order Confirmed & Placed! 📝'}
        </p>
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

      {/* Order Bill Summary */}
      {orderPrice !== null && (
        <div className="px-6 mt-6">
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Amount Paid</p>
              <h3 className="text-xl font-black text-slate-800 font-poppins mt-0.5">₹{orderPrice.toFixed(2)}</h3>
            </div>
            <div className="text-right">
              <span className={`inline-block text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                orderPaymentStatus === 'Paid' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                {orderPaymentStatus || 'Paid'}
              </span>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">via {orderPaymentMethod?.toUpperCase() || 'GPAY'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
