import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Wallet, Smartphone, Banknote, Lock, Check, Delete, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { useChefStore } from '../../chef/store/useChefStore';
import { motion, AnimatePresence } from 'framer-motion';

const PAYMENT_METHODS = [
  { id: 'gpay', name: 'Google Pay', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'phonepe', name: 'PhonePe', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'paytm', name: 'Paytm', icon: Wallet, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'upi', name: 'BHIM UPI', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'cod', name: 'Cash On Delivery', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

export function PaymentPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('gpay');
  const cartTotal = useCartStore(state => state.getCartTotal());
  const clearCart = useCartStore(state => state.clearCart);
  const cartItems = useCartStore(state => state.items);
  const tableNumber = useCartStore(state => state.tableNumber);
  const setOrderStatus = useOrderStore(state => state.setStatus);
  const setEstimatedTime = useOrderStore(state => state.setEstimatedTime);
  const setOrderId = useOrderStore(state => state.setOrderId);
  
  const grandTotal = cartTotal + (cartTotal * 0.05);

  // Simulation Steps: 'idle' | 'auth' | 'pin' | 'processing' | 'success'
  const [payStep, setPayStep] = useState<'idle' | 'auth' | 'pin' | 'processing' | 'success'>('idle');
  const [pin, setPin] = useState('');

  const handlePayment = async () => {
    // Calculate prep time: sum of all item prep times
    const menuItems = useAdminStore.getState().menuItems;
    const calculatedPrepTime = cartItems.reduce((sum, cartItem) => {
      const menuItem = menuItems.find(item => item.id === cartItem.id || item.name === cartItem.name);
      const itemPrep = menuItem?.prepTime || 10;
      return sum + (itemPrep * cartItem.quantity);
    }, 0);

    // Send order to KDS (useChefStore)
    const chefOrderItems = cartItems.map(item => ({ name: item.name, quantity: item.quantity }));
    const newOrderId = await useChefStore.getState().addNewOrder(
      chefOrderItems, 
      tableNumber, 
      calculatedPrepTime,
      grandTotal,
      selectedMethod,
      'Paid'
    );

    // Save details to Customer Order State
    setOrderId(newOrderId);
    setOrderStatus('Confirmed');
    setEstimatedTime(calculatedPrepTime);
    clearCart();
    navigate('/tracking');
  };

  const handleStartPaymentFlow = () => {
    if (selectedMethod === 'cod') {
      // Direct Cash checkout without UPI flow
      setPayStep('processing');
      setTimeout(() => {
        setPayStep('success');
        setTimeout(() => {
          handlePayment();
        }, 1500);
      }, 1500);
    } else {
      // Trigger interactive Google Pay / UPI flow
      setPayStep('auth');
      setTimeout(() => {
        setPayStep('pin');
      }, 1200);
    }
  };

  const handleKeypadPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      // Automatically confirm if 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => {
          setPayStep('processing');
          setTimeout(() => {
            setPayStep('success');
            setTimeout(() => {
              handlePayment();
            }, 1800);
          }, 2000);
        }, 300);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-[#fafafc] flex flex-col font-sans select-none">
      
      {/* 1. Main View (Idle Step) */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-4 shrink-0 bg-white border-b border-slate-100">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-50 rounded-full border border-slate-100 text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-black text-slate-800 font-poppins uppercase tracking-wider">Checkout</h1>
        </div>

        {/* Scrollable Methods Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-24 scrollbar-none">
          {/* Bill summary card */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] border border-slate-100 mb-6 flex flex-col items-center justify-center py-7">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Total Amount Due</span>
            <h2 className="text-3xl font-black text-slate-800 font-poppins">₹{grandTotal.toFixed(2)}</h2>
            <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-500">
              <Lock className="w-3 h-3 text-emerald-500" />
              128-Bit Secure Checkout
            </div>
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Choose Payment Method</h3>
          
          <div className="flex flex-col gap-2.5">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center gap-4 p-3.5 rounded-[22px] border transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/10 shadow-sm shadow-blue-500/5' 
                      : 'border-slate-100 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${method.bg} ${method.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-700 flex-1 text-left font-poppins">{method.name}</span>
                  
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? 'border-blue-600' : 'border-slate-200'
                  }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Fixed Pay Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 z-10 shrink-0">
          <button 
            onClick={handleStartPaymentFlow}
            className="w-full py-4 rounded-[22px] font-black text-[12px] uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10 hover:opacity-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Pay ₹{grandTotal.toFixed(2)}
          </button>
        </div>

      </div>

      {/* 2. Google Pay / UPI Simulation Overlays */}
      <AnimatePresence>
        {payStep !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end"
          >
            {/* Step: GPay Bank Connect / Loader */}
            {payStep === 'auth' && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-white rounded-t-[32px] p-6 pb-8 flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-2" />
                
                {/* Google Pay Brand Header */}
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-500 text-xl font-black font-poppins">G</span>
                  <span className="text-red-500 text-xl font-black font-poppins">o</span>
                  <span className="text-yellow-500 text-xl font-black font-poppins">o</span>
                  <span className="text-blue-500 text-xl font-black font-poppins">g</span>
                  <span className="text-green-500 text-xl font-black font-poppins">l</span>
                  <span className="text-red-500 text-xl font-black font-poppins">e</span>
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold ml-1.5 tracking-wider">PAY</span>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {/* Glowing bank authorization ring */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent"
                    />
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-black text-slate-800 font-poppins uppercase tracking-wider">Securing connection</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Authorizing bank gateway for ₹{grandTotal.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step: UPI PIN keypad */}
            {payStep === 'pin' && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-[#0f172a] rounded-t-[32px] flex flex-col overflow-hidden text-white"
              >
                {/* UPI Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase">UPI Transaction</span>
                    <span className="text-xs font-bold text-slate-300">To: SmartServe Restaurant</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase">Amount</span>
                    <p className="text-sm font-black text-white">₹{grandTotal.toFixed(2)}</p>
                  </div>
                </div>

                {/* PIN Entry Area */}
                <div className="p-6 flex flex-col items-center justify-center gap-4">
                  <span className="text-xs font-extrabold tracking-wider text-slate-400 font-poppins">ENTER 4-DIGIT UPI PIN</span>
                  
                  {/* Dot Indicators */}
                  <div className="flex gap-4 my-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                          i < pin.length
                            ? 'bg-white border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                            : 'bg-transparent border-slate-600'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[9px] text-slate-500 font-semibold tracking-wider italic">
                    🔒 UPI PIN is securely processed by NPCI
                  </span>
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 bg-slate-950/80 border-t border-slate-900 pb-safe">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleKeypadPress(num)}
                      className="py-4.5 text-xl font-bold hover:bg-slate-900 active:bg-slate-900 transition-colors flex items-center justify-center cursor-pointer border-b border-r border-slate-900/60"
                    >
                      {num}
                    </button>
                  ))}
                  
                  {/* Back/Clear button */}
                  <button
                    onClick={() => setPin('')}
                    className="py-4.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-900 active:bg-slate-900 transition-colors flex items-center justify-center cursor-pointer border-r border-slate-900/60"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => handleKeypadPress('0')}
                    className="py-4.5 text-xl font-bold hover:bg-slate-900 active:bg-slate-900 transition-colors flex items-center justify-center cursor-pointer border-r border-slate-900/60"
                  >
                    0
                  </button>

                  {/* Backspace button */}
                  <button
                    onClick={handleKeypadBackspace}
                    className="py-4.5 text-slate-400 hover:bg-slate-900 active:bg-slate-900 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Processing */}
            {payStep === 'processing' && (
              <motion.div
                key="processing-payment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0f172a] flex flex-col items-center justify-center text-center p-6 gap-6"
              >
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
                  />
                  <Lock className="w-7 h-7 text-blue-500" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white font-poppins uppercase tracking-wider">Processing payment</h4>
                  <p className="text-[10px] text-slate-500">Do not close this page or lock your screen.</p>
                </div>
              </motion.div>
            )}

            {/* Step: Success Animation */}
            {payStep === 'success' && (
              <motion.div
                key="success-payment"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#f8fafc] flex flex-col items-center justify-center text-center p-6 gap-6"
              >
                {/* Glowing Green Circle checkmark */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white relative shadow-lg shadow-emerald-500/20"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-emerald-400 rounded-full blur-md"
                  />
                  <Check className="w-12 h-12 stroke-[3.5] relative z-10" />
                </motion.div>
                
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-800 font-poppins uppercase tracking-wider">Payment Successful</h4>
                  <p className="text-xs text-slate-400 font-semibold">₹{grandTotal.toFixed(2)} transferred securely.</p>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
