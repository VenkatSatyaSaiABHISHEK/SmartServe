import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Wallet, Smartphone, Banknote } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { useChefStore } from '../../chef/store/useChefStore';
import { motion } from 'framer-motion';

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
    const newOrderId = await useChefStore.getState().addNewOrder(chefOrderItems, tableNumber, calculatedPrepTime);

    // Save details to Customer Order State
    setOrderId(newOrderId);
    setOrderStatus('Confirmed');
    setEstimatedTime(calculatedPrepTime);
    clearCart();
    navigate('/tracking');
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-full shadow-sm border border-slate-100 text-slate-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Payment</h1>
      </div>

      <div className="px-6 flex-1">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-8 flex flex-col items-center justify-center py-10">
          <p className="text-slate-500 font-medium mb-2">Total Amount</p>
          <h2 className="text-4xl font-bold text-slate-800">${grandTotal.toFixed(2)}</h2>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Choose Payment Method</h3>
        
        <div className="flex flex-col gap-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`relative flex items-center gap-4 p-4 rounded-[24px] border transition-all duration-300 ${
                  isSelected ? 'border-purple-500 bg-purple-50/30 shadow-md shadow-purple-500/10' : 'border-slate-100 bg-white'
                }`}
              >
                <div className={`p-3 rounded-2xl ${method.bg} ${method.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-800 flex-1 text-left">{method.name}</span>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-purple-500' : 'border-slate-300'
                }`}>
                  {isSelected && (
                    <motion.div 
                      layoutId="radio"
                      className="w-3 h-3 bg-purple-500 rounded-full"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 pb-safe bg-white border-t border-slate-100">
        <button 
          onClick={handlePayment}
          className="w-full py-5 rounded-[24px] font-bold text-white text-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2"
        >
          Pay Securely
        </button>
      </div>
    </div>
  );
}
