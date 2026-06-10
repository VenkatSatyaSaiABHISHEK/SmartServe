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
  const [partsInfo, setPartsInfo] = useState<Array<{ id: string; status: string; prepTime: number; itemsCount: number }>>([]);

  const getStatusWeight = (statusName: string) => {
    switch (statusName) {
      case 'New': return 0;
      case 'Preparing': return 1;
      case 'Ready': return 2;
      case 'Picked Up':
      case 'On The Way': return 3;
      case 'Completed':
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const getMillis = (val: any) => {
    if (!val) return null;
    if (typeof val === 'number') return val;
    if (typeof val.toMillis === 'function') return val.toMillis();
    if (typeof val.seconds === 'number') return val.seconds * 1000;
    const dateNum = new Date(val).getTime();
    return isNaN(dateNum) ? null : dateNum;
  };

  // 1. Firestore Real-Time tracking effect supporting single & split orders
  useEffect(() => {
    if (!orderId) return;

    const ids = orderId.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length === 0) return;

    const orderDataMap: Record<string, any> = {};

    const reconcileOrders = () => {
      let totalPrice = 0;
      let paymentStatus = 'Paid';
      let paymentMethod = 'gpay';
      let minWeight = 4; // default to maximum weight (Delivered)
      let overallFirestoreStatus = 'Delivered';
      const parts: Array<{ id: string; status: string; prepTime: number; itemsCount: number }> = [];
      let hasValidData = false;
      let isAnyCancelled = false;

      ids.forEach(id => {
        const data = orderDataMap[id];
        if (data) {
          hasValidData = true;
          totalPrice += (data.price || 0);
          if (data.paymentStatus === 'Unpaid') {
            paymentStatus = 'Unpaid';
          }
          if (data.paymentMethod) {
            paymentMethod = data.paymentMethod;
          }
          if (data.status === 'Cancelled') {
            isAnyCancelled = true;
          }

          const weight = getStatusWeight(data.status);
          if (weight < minWeight) {
            minWeight = weight;
            overallFirestoreStatus = data.status;
          }

          const itemsCount = data.items ? data.items.reduce((sum: number, it: any) => sum + it.quantity, 0) : 0;
          parts.push({
            id,
            status: data.status,
            prepTime: data.prepTimeMins || 10,
            itemsCount
          });
        }
      });

      if (!hasValidData) return;

      if (isAnyCancelled) {
        setStatus('Cancelled');
        setFirestoreStatus('Cancelled');
        setOrderPrice(totalPrice);
        setOrderPaymentStatus(paymentStatus);
        setOrderPaymentMethod(paymentMethod);
        setPartsInfo(parts);
        setTimeLeft(0);
        return;
      }

      // Map minimum weight to timeline status
      let mappedStatus: any = 'Confirmed';
      if (minWeight === 0) {
        mappedStatus = 'Confirmed';
      } else if (minWeight === 1 || minWeight === 2) {
        mappedStatus = 'Preparing';
      } else if (minWeight === 3) {
        mappedStatus = 'On The Way';
      } else if (minWeight === 4) {
        mappedStatus = 'Delivered';
      }

      setStatus(mappedStatus);
      setFirestoreStatus(overallFirestoreStatus);
      setOrderPrice(totalPrice);
      setOrderPaymentStatus(paymentStatus);
      setOrderPaymentMethod(paymentMethod);
      setPartsInfo(parts);

      // Recompute max seconds left
      const now = Date.now();
      let maxSecsLeft = 0;

      ids.forEach(id => {
        const data = orderDataMap[id];
        if (data) {
          if (data.status === 'Completed' || data.status === 'Delivered' || data.status === 'Ready') {
            return;
          }
          const completedAtMillis = getMillis(data.completedAt);
          if (completedAtMillis) {
            const secs = Math.max(0, Math.round((completedAtMillis - now) / 1000));
            maxSecsLeft = Math.max(maxSecsLeft, secs);
          } else {
            const secs = (data.prepTimeMins || 10) * 60;
            maxSecsLeft = Math.max(maxSecsLeft, secs);
          }
        }
      });

      setTimeLeft(maxSecsLeft);
    };

    const unsubs = ids.map(id => {
      return onSnapshot(doc(db, 'orders', id), (docSnap) => {
        if (docSnap.exists()) {
          orderDataMap[id] = docSnap.data();
        } else {
          orderDataMap[id] = null;
        }
        reconcileOrders();
      });
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
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
      
      {/* Mock Email Refund Notification Banner */}
      {status === 'Cancelled' && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="mx-4 mt-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg text-white flex flex-col gap-2 z-50 absolute top-2 left-0 right-0"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Incoming Mail • Inbox</span>
            </div>
            <span className="text-[8px] font-bold text-slate-500">Just Now</span>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-white font-poppins">Order Cancelled & Refund Notice</p>
            <p className="text-[9.5px] font-bold text-slate-400">From: <span className="text-slate-300">billing@smartserve.com</span></p>
            <p className="text-[9.5px] font-semibold text-slate-300 leading-normal pt-0.5">
              Dear Customer, your order has been cancelled by the admin. A full refund of <span className="text-rose-450 font-extrabold">₹{orderPrice?.toFixed(2) || '0.00'}</span> has been initiated. The amount will be refunded back to your account soon.
            </p>
          </div>
        </motion.div>
      )}

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
        
        {status === 'Cancelled' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {/* Glowing Red Warning Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center text-white relative shadow-lg shadow-rose-500/20 mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-rose-400 rounded-full blur-md"
              />
              <span className="text-3xl relative z-10">🚫</span>
            </motion.div>

            <h2 className="text-lg font-black text-rose-600 font-poppins uppercase tracking-wider">Order Cancelled</h2>
            <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-wide max-w-[260px] leading-relaxed">
              Your order has been cancelled by the admin. The refund has been initiated and the amount will be refunded soon.
            </p>

            {/* Refund detail card */}
            {orderPrice !== null && (
              <div className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] mt-8 text-left space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refund Status</span>
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md">
                    Initiated
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Refund Amount</p>
                    <h3 className="text-base font-black text-slate-800 font-poppins mt-0.5">₹{orderPrice.toFixed(2)}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Payment Method</p>
                    <p className="text-[10px] font-black text-slate-700 uppercase mt-0.5">via {orderPaymentMethod?.toUpperCase() || 'GPAY'}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-[15px] text-[10px] font-semibold text-slate-500 leading-normal">
                  Refunds typically reflect in your account within 2-3 business days depending on your bank. If you have any questions, please contact our support.
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
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
                  <span className="text-2xl font-black text-slate-855 font-poppins">{formatTime(timeLeft)}</span>
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
              <div className="relative border-l border-slate-155 ml-3.5 pb-2">
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

            {/* If there are multiple parts, show split order details */}
            {partsInfo.length > 1 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] mt-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3.5 px-1 font-poppins">Split Order Progress</h3>
                <div className="flex flex-col gap-2.5">
                  {partsInfo.map((part, index) => (
                    <div key={part.id} className="flex items-center justify-between p-3.5 bg-slate-55 border border-slate-100 rounded-[20px]">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 font-poppins uppercase tracking-wider">Part {index + 1} (#{part.id})</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">{part.itemsCount} Items • Prep: {part.prepTime}m</span>
                      </div>
                      <div>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          part.status === 'Completed' || part.status === 'Delivered'
                            ? 'bg-slate-100 text-slate-505 border-slate-200'
                            : part.status === 'Ready'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-poppins'
                            : part.status === 'Preparing'
                            ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {part.status === 'New' ? 'Pending' : part.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <p className="text-white/85 text-[10px] font-semibold leading-relaxed mt-0.5">
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
          </>
        )}

      </div>
    </div>
  );
}
