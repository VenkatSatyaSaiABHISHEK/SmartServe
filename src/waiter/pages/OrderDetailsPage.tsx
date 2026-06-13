import { useParams, useNavigate } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { 
  ChevronLeft, Clock, ChefHat, CheckSquare, Square, CreditCard, MessageSquare, HelpCircle, FileText, X, CheckCircle2, DollarSign, Star
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, clearTable } = useWaiterStore();
  
  const order = orders.find(o => o.id === id);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Waiter Billing States
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingStep, setBillingStep] = useState<'receipt' | 'payment' | 'qr' | 'success' | 'feedback'>('receipt');
  const [billingMethod, setBillingMethod] = useState<'cash' | 'qr'>('cash');
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackGuestName, setFeedbackGuestName] = useState('');
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col items-center justify-center p-6 text-center">
        <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
        <h1 className="text-xl font-bold text-slate-800">Order Not Found</h1>
        <button 
          onClick={() => navigate('/waiter/assigned')}
          className="mt-4 px-6 py-3 bg-[#2563eb] text-white rounded-full font-bold"
        >
          Back to Assigned
        </button>
      </div>
    );
  }

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleAction = () => {
    if (order.status === 'Ready') {
      updateOrderStatus(order.id, 'Picked Up');
      navigate('/waiter/assigned');
    } else if (order.status === 'Picked Up') {
      updateOrderStatus(order.id, 'Delivered');
      navigate('/waiter/assigned');
    }
  };

  // Mock instructions based on order
  const specialInstructions = id === 'O101' 
    ? 'Risotto should be served hot. Burrata needs extra virgin olive oil on top.' 
    : id === 'O102' 
      ? 'Burger cooked medium well, no onions. Lava cake served after burger.' 
      : 'Customer requested extra napkins and water.';

  const gst = order.price * 0.05;
  const subtotal = order.price - gst;

  return (
    <div className="min-h-screen bg-[#fafafc] pb-24 font-sans select-none">
      {/* Header */}
      <div className="bg-white border-b border-[#f1f5f9] px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] max-w-md mx-auto w-full">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-slate-50 text-slate-700 rounded-full border border-[#f1f5f9] hover:bg-slate-100 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {order.id}
          </span>
          <h1 className="text-lg font-black text-[#0f172a] mt-0.5 font-poppins">Table {order.tableId} Details</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 flex flex-col gap-5">
        {/* Status Box */}
        <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
              <p className="font-extrabold text-[#0f172a] text-[15px] mt-0.5">{order.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#64748b] text-[13px] font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-blue-500" />
            Ordered {order.timeOrdered}
          </div>
        </div>

        {/* Kitchen Items Checklist */}
        <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm">
          <h3 className="font-bold text-[#0f172a] text-[15px] font-poppins mb-4 flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-blue-600" />
            Items Checklist
          </h3>
          <p className="text-[12px] text-slate-400 mb-3.5">Verify each item before picking up from kitchen or delivering to table:</p>
          
          <div className="flex flex-col gap-3">
            {order.items.map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <div 
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isChecked 
                      ? 'bg-blue-50/10 border-blue-200 text-[#0f172a]' 
                      : 'bg-white border-[#f1f5f9] hover:bg-slate-50 text-[#1e293b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 fill-blue-100 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </span>
                    <span className="font-semibold text-[13.5px]">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-[#64748b] text-[14px]">
                    x{item.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Special Instructions */}
        <div className="bg-[#fffbeb] border border-[#fef3c7] p-5 rounded-[28px] shadow-sm flex gap-3.5">
          <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl self-start">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-amber-900 text-[14px] font-poppins">Special Instructions</h4>
            <p className="text-amber-800 text-[13px] leading-relaxed mt-1">{specialInstructions}</p>
          </div>
        </div>

        {/* Cost Summary Box */}
        <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm">
          <h3 className="font-bold text-[#0f172a] text-[15px] font-poppins mb-4 flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-blue-600" />
            Billing Breakdown
          </h3>
          <div className="flex flex-col gap-2.5 text-[13px] text-[#64748b]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="font-semibold text-slate-800">₹{gst.toFixed(2)}</span>
            </div>
            <div className="h-[1px] bg-slate-100 w-full my-1.5" />
            <div className="flex justify-between text-[#0f172a] text-[16px] font-extrabold font-poppins">
              <span>Grand Total</span>
              <span>₹{order.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
              }`}>
                {order.paymentStatus || 'Unpaid'} ({order.paymentMethod || 'later'})
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        {order.status !== 'Delivered' && order.status !== 'Preparing' && (
          <button 
            onClick={handleAction}
            className="w-full py-4.5 rounded-[22px] font-black text-white text-sm uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-4 cursor-pointer flex items-center justify-center gap-2"
          >
            {order.status === 'Ready' ? 'Collect from Kitchen' : 'Mark Delivered to Table'}
          </button>
        )}

        {order.status === 'Delivered' && order.paymentStatus !== 'Paid' && (
          <button 
            onClick={() => {
              setShowBillingModal(true);
              setBillingStep('receipt');
            }}
            className="w-full py-4.5 rounded-[22px] font-black text-white text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 active:scale-95 transition-all mt-4 cursor-pointer flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4.5 h-4.5" />
            Generate Bill
          </button>
        )}
      </div>

      {/* Waiter Billing Modal */}
      <AnimatePresence>
        {showBillingModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-black text-slate-800 font-poppins">Table {order.tableId} Billing</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowBillingModal(false);
                    setBillingStep('receipt');
                  }} 
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {billingStep === 'receipt' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150/40">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Order items</span>
                      <div className="space-y-2 text-xs font-bold text-slate-600">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{((item.price || order.price / order.items.length) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150/40 space-y-2 text-xs font-bold text-slate-500">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{(order.price / 1.05).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (5%)</span>
                        <span>₹{(order.price - (order.price / 1.05)).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-200/50 my-2 pt-2 flex justify-between text-[#0f172a] text-sm font-black font-poppins">
                        <span>Grand Total</span>
                        <span>₹{order.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Select Billing Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setBillingMethod('cash');
                            setBillingStep('payment');
                          }}
                          className="py-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 flex flex-col items-center gap-2 cursor-pointer transition-all text-xs font-black uppercase text-slate-700"
                        >
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          Cash Payment
                        </button>
                        <button
                          onClick={() => {
                            setBillingMethod('qr');
                            setBillingStep('qr');
                          }}
                          className="py-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 flex flex-col items-center gap-2 cursor-pointer transition-all text-xs font-black uppercase text-slate-700"
                        >
                          <CreditCard className="w-5 h-5 text-indigo-600" />
                          Scan QR Code
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {billingStep === 'payment' && (
                  <div className="space-y-4 text-center py-2">
                    <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl text-center">
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">Grand Total Due</span>
                      <span className="text-3xl font-black text-emerald-900 font-poppins mt-1 block">₹{order.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                      Collect cash from customer. Once received, click confirm below to complete order and clear the table.
                    </p>

                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, 'orders', order.id), { 
                          paymentStatus: 'Paid',
                          paymentMethod: 'cash',
                          status: 'Completed' 
                        });
                        await clearTable(order.tableId);
                        setBillingStep('success');
                      }}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95 transition-all"
                    >
                      Confirm Cash Received
                    </button>
                  </div>
                )}

                {billingStep === 'qr' && (
                  <div className="space-y-4 py-2 text-center">
                    <div className="w-44 h-44 mx-auto bg-slate-50 border-2 border-dashed border-indigo-200 rounded-3xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                      <svg className="w-32 h-32 text-slate-800" viewBox="0 0 100 100">
                        <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z" fill="currentColor" />
                        <path d="M45,15 h10 v10 h-10 z M45,35 h15 v10 h-15 z M35,45 h10 v10 h-10 z M15,45 h10 v10 h-10 z M75,45 h10 v10 h-10 z M65,55 h10 v20 h-10 z M45,75 h10 v10 h-10 z M55,65 h10 v15 h-10 z M75,75 h10 v10 h-10 z" fill="currentColor" />
                      </svg>
                      
                      <motion.div 
                        animate={{ y: [-10, 150, -10] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Dynamic Payment QR</p>
                      <p className="text-slate-500 text-xs leading-relaxed max-w-[280px] mx-auto mt-1">
                        Have the customer scan this code on your screen to pay <strong className="text-slate-850">₹{order.price.toFixed(2)}</strong>.
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        setIsSimulatingPayment(true);
                        setTimeout(async () => {
                          await updateDoc(doc(db, 'orders', order.id), { 
                            paymentStatus: 'Paid',
                            paymentMethod: 'upi',
                            status: 'Completed' 
                          });
                          await clearTable(order.tableId);
                          setIsSimulatingPayment(false);
                          setBillingStep('success');
                        }, 1500);
                      }}
                      disabled={isSimulatingPayment}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                        isSimulatingPayment 
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-wait' 
                          : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
                      }`}
                    >
                      {isSimulatingPayment ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                          Verifying payment...
                        </>
                      ) : (
                        'Simulate Scan & Pay'
                      )}
                    </button>
                  </div>
                )}

                {billingStep === 'success' && (
                  <div className="space-y-5 text-center py-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 mx-auto">
                      <CheckCircle2 className="w-8 h-8 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-800 font-poppins">Thank you!</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Payment confirmed. Table cleared.</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => setBillingStep('feedback')}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/10 cursor-pointer transition-all"
                      >
                        Give Feedback
                      </button>
                      <button
                        onClick={() => {
                          setShowBillingModal(false);
                          setBillingStep('receipt');
                        }}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
                      >
                        Skip & Close
                      </button>
                    </div>
                  </div>
                )}

                {billingStep === 'feedback' && (
                  <div className="space-y-4 py-2">
                    <h4 className="text-base font-black text-slate-850 font-poppins text-center">Guest Experience Feedback</h4>
                    
                    <div className="flex justify-center gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="cursor-pointer transition-transform active:scale-90"
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              star <= rating 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300 hover:text-amber-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Customer Name (Optional)</label>
                        <input
                          type="text"
                          placeholder="Guest name"
                          value={feedbackGuestName}
                          onChange={(e) => setFeedbackGuestName(e.target.value)}
                          className="w-full bg-[#fafafc] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Comments / Suggestions</label>
                        <textarea
                          rows={3}
                          placeholder="How was the food and service?"
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          className="w-full bg-[#fafafc] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-855 focus:outline-none focus:border-slate-400 resize-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const reviewId = `REV-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
                          const reviewerName = feedbackGuestName.trim() || `Table ${order.tableId} Guest`;
                          const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(reviewerName)}`;
                          const todayStr = new Date().toISOString().split('T')[0];
                          const dishName = order.items?.[0]?.name || 'General Dining';

                          await setDoc(doc(db, 'reviews', reviewId), {
                            id: reviewId,
                            customerName: reviewerName,
                            avatar: avatarUrl,
                            rating: rating,
                            comment: feedbackComment,
                            date: todayStr,
                            dishName: dishName
                          });

                          setFeedbackGuestName('');
                          setFeedbackComment('');
                          setRating(5);
                          setShowBillingModal(false);
                          setBillingStep('receipt');
                        } catch (e) {
                          console.error("Error writing feedback:", e);
                        }
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/10 cursor-pointer transition-all"
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
