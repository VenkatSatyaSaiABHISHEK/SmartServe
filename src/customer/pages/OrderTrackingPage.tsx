import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChefHat, Bike, MapPin, Bell, User, ChevronLeft, X } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { useCartStore } from '../store/useCartStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { useWaiterStore } from '../../waiter/store/useWaiterStore';
import { useChefStore } from '../../chef/store/useChefStore';
import { db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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
  const trackingStartTime = useOrderStore(state => state.trackingStartTime);

  const [timeLeft, setTimeLeft] = useState(() => {
    if (trackingStartTime) {
      const elapsed = Math.floor((Date.now() - trackingStartTime) / 1000);
      return Math.max(0, estimatedTimeMins * 60 - elapsed);
    }
    return estimatedTimeMins * 60;
  });
  const [orderPrice, setOrderPrice] = useState<number | null>(null);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<string | null>(null);
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<string | null>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<string>('New');
  const [partsInfo, setPartsInfo] = useState<Array<{ id: string; status: string; prepTime: number; itemsCount: number }>>([]);
  const [activeOrdersData, setActiveOrdersData] = useState<Record<string, any>>({});
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isCardDismissed, setIsCardDismissed] = useState(false);

  // Redirect to home if no active order is tracked
  useEffect(() => {
    if (!orderId) {
      navigate('/home');
    }
  }, [orderId, navigate]);

  const chefs = useChefStore((state: any) => state.chefs);
  const waiters = useAdminStore((state: any) => state.waiters);
  const tables = useWaiterStore((state: any) => state.tables);

  const orderIdsList = orderId ? orderId.split(',').map(id => id.trim()).filter(Boolean) : [];
  const firstOrderId = orderIdsList[0];
  const firstOrderData = firstOrderId ? activeOrdersData[firstOrderId] : null;

  const currentTableNum = firstOrderData?.tableNumber || useCartStore.getState().tableNumber;
  const currentTable = (tables as any[]).find((t: any) => t.number === currentTableNum);
  const waiter = currentTable && currentTable.assignedWaiterId 
    ? (waiters as any[]).find((w: any) => w.id === currentTable.assignedWaiterId)
    : null;

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
        setActiveOrdersData({ ...orderDataMap });
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
      setActiveOrdersData({ ...orderDataMap });
      setHasLoadedOnce(true);

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
            const createdAtMillis = getMillis(data.createdAt) || now;
            const expectedCompletion = createdAtMillis + (data.prepTimeMins || 10) * 60 * 1000;
            const secs = Math.max(0, Math.round((expectedCompletion - now) / 1000));
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

  // Grace period on mount (5 seconds) to avoid initial snapshot empty race conditions
  useEffect(() => {
    if (!orderId) return;
    
    const timeout = setTimeout(() => {
      const ids = orderId.split(',').map(id => id.trim()).filter(Boolean);
      const anyExists = ids.some(id => activeOrdersData[id] !== null && activeOrdersData[id] !== undefined);
      if (!anyExists) {
        console.log("Order not found after grace period. Clearing...");
        useOrderStore.getState().clearActiveOrder();
        navigate('/home');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [orderId, activeOrdersData, navigate]);

  // Immediate redirect if order is deleted during an active tracking session
  useEffect(() => {
    if (!orderId || !hasLoadedOnce) return;
    const ids = orderId.split(',').map(id => id.trim()).filter(Boolean);
    const anyExists = ids.some(id => activeOrdersData[id] !== null && activeOrdersData[id] !== undefined);
    if (!anyExists) {
      console.log("Active order was deleted from Firestore. Redirecting...");
      useOrderStore.getState().clearActiveOrder();
      navigate('/home');
    }
  }, [orderId, activeOrdersData, hasLoadedOnce, navigate]);

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
              Dear Customer, your order got cancelled. Please re-order. A full refund of <span className="text-rose-450 font-extrabold">₹{orderPrice?.toFixed(2) || '0.00'}</span> has been initiated.
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
            <p className="text-sm font-bold text-slate-600 mt-3 max-w-[260px] leading-relaxed">
              Your order got cancelled. Please re-order.
            </p>

            <button
              onClick={() => {
                useOrderStore.getState().clearActiveOrder();
                navigate('/home');
              }}
              className="mt-6 px-8 py-3.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md shadow-rose-500/20 cursor-pointer active:scale-98 transition-all"
            >
              Re-order Now
            </button>

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
            {/* Re-order loyalty reward CTA (Visible when Delivered/Completed or timeLeft <= 60 secs) */}
            {(status === 'Delivered' || timeLeft <= 60) && !isCardDismissed && (
              <>
                {/* Backdrop Blur Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsCardDismissed(true)}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40"
                />
                
                {/* Lottie Celebration Animation Overlay */}
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-72 h-[280px] pointer-events-none z-42 flex items-center justify-center">
                  <DotLottieReact
                    src="https://lottie.host/01bed07a-e848-4b67-9ac9-e6bae7a55686/xtglezXg7T.lottie"
                    loop
                    autoplay
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <motion.div
                  initial={{ y: -150, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="fixed top-4 left-4 right-4 bg-white border border-slate-100 rounded-[28px] shadow-[0_15px_35px_rgba(0,0,0,0.15)] p-5 text-center space-y-3.5 z-50 max-w-md mx-auto"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setIsCardDismissed(true)}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex justify-center -mt-1.5 mb-1">
                    {/* Pull-down drawer indicator pill */}
                    <div className="w-8 h-1 bg-slate-200 rounded-full" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 leading-relaxed pr-6 pl-2">
                    {status === 'Delivered' 
                      ? "Hope you enjoyed your meal! Re-order now and get an instant 20% OFF on your next order! 🏷️"
                      : "Want to order more? Order now and get an instant 20% OFF on your next order! 🏷️"}
                  </div>
                  <button
                    onClick={() => {
                      const applyDiscount = useCartStore.getState().applyDiscount;
                      const setPreviousOrderId = useOrderStore.getState().setPreviousOrderId;
                      const clearActiveOrder = useOrderStore.getState().clearActiveOrder;
                      
                      applyDiscount(true);
                      setPreviousOrderId(orderId);
                      clearActiveOrder();
                      navigate('/home');
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white rounded-[22px] font-black text-xs uppercase tracking-widest shadow-md shadow-orange-500/20 cursor-pointer active:scale-98 transition-all"
                  >
                    Order More (Get 20% OFF)
                  </button>
                </motion.div>
              </>
            )}

            {/* Progress Ring */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {status === 'Delivered' && (
                  <motion.div
                    className="absolute w-36 h-36 bg-emerald-500/10 rounded-full -z-10 animate-pulse"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
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
                    stroke={status === 'Delivered' ? 'url(#greenGradient)' : 'url(#gradient)'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "452", strokeDashoffset: "452" }}
                    animate={{ strokeDashoffset: status === 'Delivered' ? 0 : 452 - (452 * elapsedPercent) / 100 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex flex-col items-center">
                  {status === 'Delivered' ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="w-6 h-6 stroke-[3]" />
                    </motion.div>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-slate-855 font-poppins">{formatTime(timeLeft)}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 mt-0.5">{status}</span>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm font-extrabold text-slate-800 font-poppins text-center">
                {status === 'Delivered' ? 'Enjoy your food! 🍽️' :
                 status === 'On The Way' ? 'Waiter is serving your food! 🏃‍♂️' :
                 status === 'Preparing' ? (firestoreStatus === 'Ready' ? 'Food plated, waiting for waiter! 🛎️' : 'Chef is cooking your dish! 🍳') :
                 'Order Confirmed & Placed! 📝'}
              </p>
            </div>

            {/* Timeline Progress (Horizontal Side-by-Side Stepper) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] mt-3">
              <div className="relative flex items-start justify-between px-1">
                {/* Horizontal Gray Track Line */}
                <div className="absolute left-[12.5%] right-[12.5%] top-[18px] h-[2px] bg-slate-100 -z-0" />
                
                {/* Horizontal Animating Blue Line */}
                <div className="absolute left-[12.5%] right-[12.5%] top-[18px] h-[2px] -z-0 overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-600 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: currentStepIndex / (TIMELINE.length - 1) }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{ width: '100%' }}
                  />
                </div>

                {TIMELINE.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                      {/* Vertically centered wrapper for circles of different sizes */}
                      <div className="h-9 flex items-center justify-center">
                        <div 
                          className={`rounded-full flex items-center justify-center shadow-sm border-2 border-white transition-all duration-300 relative ${
                            isActive
                              ? 'w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/35'
                              : isCompleted
                              ? 'w-7 h-7 bg-blue-600 text-white'
                              : 'w-7 h-7 bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute -inset-1 bg-blue-500/20 rounded-full -z-10"
                              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            />
                          )}
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Icon className={isActive ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} />
                          )}
                        </div>
                      </div>
                      
                      {/* Step Title Label */}
                      <span className={`text-[9px] font-extrabold mt-2 text-center truncate w-full px-0.5 ${
                        isActive 
                          ? 'text-slate-800 font-black font-poppins' 
                          : isCompleted 
                          ? 'text-slate-650 font-bold' 
                          : 'text-slate-400'
                      }`}>
                        {step.title.replace('Order ', '').replace('Kitchen ', '').replace(' & Enjoy', '')}
                      </span>
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

            {/* Live Cooking & Service Desk */}
            <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] mt-4 space-y-4.5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 font-poppins">Cooking & Service Status</h3>
              
              {/* Chef Section */}
              <div className="space-y-3">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Kitchen Preparation</span>
                {orderIdsList.length === 0 ? (
                  <p className="text-[11px] font-bold text-slate-400 italic px-1">Waiting to connect to kitchen...</p>
                ) : (
                  orderIdsList.map((id) => {
                    const data = activeOrdersData[id];
                    if (!data) return null;
                    const chefObj = (chefs as any[]).find((c: any) => c.id === data.assignedChefId);
                    const chefItems = data.items || [];
                    const isCooking = data.status === 'Preparing';
                    const isReady = data.status === 'Ready' || data.status === 'Picked Up' || data.status === 'Completed' || data.status === 'Delivered';

                    return (
                      <div key={id} className="flex items-center gap-3.5 bg-slate-55 border border-slate-100 p-3 rounded-2xl">
                        <div className="relative shrink-0">
                          <img 
                            src={chefObj?.avatar || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=120"} 
                            alt={chefObj?.name || "Chef"} 
                            className={`w-11 h-11 rounded-xl object-cover border-2 ${isCooking ? 'border-amber-400 animate-pulse' : isReady ? 'border-emerald-500' : 'border-slate-200'}`}
                          />
                          {isReady ? (
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white text-[8px] font-black">✓</span>
                          ) : isCooking ? (
                            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-white text-[8px] animate-bounce">🍳</span>
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-slate-800 font-poppins">{chefObj?.name || "Kitchen Chef"}</span>
                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${isReady ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : isCooking ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-505'}`}>
                              {data.status === 'New' ? 'In Queue' : data.status}
                            </span>
                          </div>
                          <p className="text-[10.5px] font-semibold text-slate-500 truncate mt-1">
                            Cooking: {chefItems.map((it: any) => `${it.name} x${it.quantity}`).join(', ')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Waiter Section */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Dining Service</span>
                <div className="flex items-center gap-3.5 bg-slate-55 border border-slate-100 p-3 rounded-2xl">
                  <img 
                    src={waiter?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"} 
                    alt={waiter?.name || "Waiter"} 
                    className="w-11 h-11 rounded-xl object-cover border-2 border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-slate-850 font-poppins">
                        {waiter?.name || (status === 'Delivered' ? "Service Completed" : "Assigning Waiter...")}
                      </span>
                      {waiter && (
                        <span className="text-[8.5px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] font-semibold text-slate-500 mt-1">
                      {status === 'Delivered' ? `Delivered to your Table ${currentTableNum}! Enjoy!` :
                       status === 'On The Way' ? `Waiter is serving your hot dishes to Table ${currentTableNum}!` :
                       waiter ? `Waiter is assigned to Table ${currentTableNum} and will serve your dishes once cooked.` :
                       `A waiter will be assigned to Table ${currentTableNum} shortly.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Notification Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[24px] p-4 text-white flex items-start gap-3 mt-4 shadow-md shadow-blue-500/10">
              <div className="bg-white/20 p-2 rounded-xl shrink-0 text-white">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs font-poppins">Notification</h4>
                <p className="text-white/85 text-[10px] font-semibold leading-relaxed mt-0.5">
                  {status === 'Delivered' ? 'Your order has been served. Bon appétit!' :
                   status === 'On The Way' ? 'Your waiter is on the way to serve your order.' :
                   'We will notify you when your order is on the way.'}
                </p>
              </div>
            </div>

            {/* Order Payment Summary Card */}
            {orderPrice !== null && (
              <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex justify-between items-center mt-4">
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

            {/* Re-order loyalty reward CTA is now rendered at the top of the timeline */}
          </>
        )}

      </div>
    </div>
  );
}
