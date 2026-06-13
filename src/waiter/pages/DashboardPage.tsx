import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { useChefStore } from '../../chef/store/useChefStore';
import { 
  CheckCircle2, DollarSign, Star, ClipboardList, Grid, 
  ChevronRight, Bell, AlertCircle, Sparkles, Plus, 
  Trash2, CreditCard, ShoppingBag, Landmark, Coffee, HelpCircle, X, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const KEYWORD_IMAGE_MAP: Record<string, string> = {
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
  biryani: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format&fit=crop',
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop',
  icecream: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&auto=format&fit=crop',
  ice_cream: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&auto=format&fit=crop',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
  tea: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
  latte: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop',
  fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop',
  taco: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop',
  tacos: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop',
  coke: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop',
  soda: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop',
  drink: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop',
  smoothie: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop',
  juice: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop',
  soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop',
  lobster: 'https://images.unsplash.com/photo-1553618551-fba689030290?q=80&w=600&auto=format&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=600&auto=format&fit=crop',
  steak: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
  noodles: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&auto=format&fit=crop',
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop',
  fried_rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=600&auto=format&fit=crop',
  panner_tikka: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=600&auto=format&fit=crop',
  paneer: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=600&auto=format&fit=crop',
  generic: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'
};

const getFoodImageByKeyword = (text: string): string | null => {
  if (!text) return null;
  const cleanText = text.toLowerCase().trim().replace(/[-\s]+/g, '_');
  if (KEYWORD_IMAGE_MAP[cleanText]) return KEYWORD_IMAGE_MAP[cleanText];
  for (const key of Object.keys(KEYWORD_IMAGE_MAP)) {
    if (key !== 'generic' && (cleanText.includes(key) || key.includes(cleanText))) {
      return KEYWORD_IMAGE_MAP[key];
    }
  }
  return null;
};

const resolveFoodImage = (imageInput: string, nameInput: string): string => {
  const trimmedImage = (imageInput || '').trim();
  if (trimmedImage && (trimmedImage.startsWith('http://') || trimmedImage.startsWith('https://') || trimmedImage.startsWith('data:image/'))) {
    return trimmedImage;
  }
  const imgByKeyword = getFoodImageByKeyword(trimmedImage);
  if (imgByKeyword) return imgByKeyword;
  const imgByName = getFoodImageByKeyword(nameInput);
  if (imgByName) return imgByName;
  return KEYWORD_IMAGE_MAP.generic;
};

function ReadyOrderCard({ 
  order, 
  waiterId, 
  onUpdateStatus, 
  onReassign 
}: { 
  order: any; 
  waiterId: string; 
  onUpdateStatus: (id: string, status: any) => void;
  onReassign: (tableId: string, waiterId: string) => Promise<string | null>;
}) {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignedTo, setReassignedTo] = useState<string | null>(null);

  useEffect(() => {
    if (order.status !== 'Ready') return;
    if (secondsLeft <= 0) {
      const triggerReassign = async () => {
        setIsReassigning(true);
        const name = await onReassign(order.tableId, waiterId);
        if (name) {
          setReassignedTo(name);
        } else {
          setSecondsLeft(30);
          setIsReassigning(false);
        }
      };
      triggerReassign();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, order.status, order.tableId, waiterId, onReassign]);

  const progressPercent = (secondsLeft / 30) * 100;

  if (reassignedTo) {
    return (
      <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/20 text-center text-xs font-bold text-amber-800 shadow-sm animate-pulse">
        Table {order.tableId} order reassigned to <strong>{reassignedTo}</strong> (Timeout!)
      </div>
    );
  }

  return (
    <div 
      className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 shadow-sm ${
        order.status === 'Ready' 
          ? 'border-blue-100 bg-blue-50/10' 
          : 'border-emerald-100 bg-emerald-50/5'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800 font-poppins">Table {order.tableId}</span>
            <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
              order.status === 'Ready' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {order.status === 'Ready' ? 'Food Ready' : 'Collected (In Hand)'}
            </span>
          </div>
          <span className="text-[9.5px] font-bold text-slate-400 block mt-1">Order {order.id} • {order.timeOrdered}</span>
        </div>

        <button 
          onClick={() => {
            if (order.status === 'Ready') {
              onUpdateStatus(order.id, 'Picked Up');
            } else {
              onUpdateStatus(order.id, 'Delivered');
            }
          }}
          disabled={isReassigning}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm ${
            order.status === 'Ready' 
              ? 'bg-blue-600 text-white shadow-blue-500/10 hover:bg-blue-700' 
              : 'bg-emerald-600 text-white shadow-emerald-500/10 hover:bg-emerald-700'
          }`}
        >
          {order.status === 'Ready' ? 'Collect Food' : 'Mark Served'}
        </button>
      </div>

      {order.status === 'Ready' && (
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
            <span>Collection Timer:</span>
            <span className={secondsLeft <= 10 ? 'text-red-500 animate-pulse font-bold' : 'text-blue-500'}>
              {secondsLeft}s left
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${secondsLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white/60 p-2.5 rounded-xl border border-slate-100/40 flex flex-wrap gap-1.5">
        {order.items.map((item: any, idx: number) => (
          <span key={idx} className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
            {item.name} <strong className="text-slate-800">x{item.quantity}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { 
    waiter, orders, tables, notifications, toggleOnlineStatus, 
    markNotificationRead, assignTable, clearTable, addNotification, updateOrderStatus, logout,
    reassignTableToFreeWaiter
  } = useWaiterStore();
  const menuItems = useAdminStore(state => state.menuItems);
  const navigate = useNavigate();

  // POS Order taking states
  const [showPOS, setShowPOS] = useState(false);
  const [posTable, setPosTable] = useState<number | null>(null);
  const [posCategory, setPosCategory] = useState('All');
  const [posCart, setPosCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr' | 'later'>('later');
  const [showSuccessOrder, setShowSuccessOrder] = useState(false);
  const [posStep, setPosStep] = useState<'table' | 'menu' | 'checkout' | 'payment'>('table');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Waiter Billing States
  const [billingOrder, setBillingOrder] = useState<any | null>(null);
  const [billingStep, setBillingStep] = useState<'receipt' | 'payment' | 'qr' | 'success' | 'feedback'>('receipt');
  const [billingMethod, setBillingMethod] = useState<'cash' | 'qr'>('cash');
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackGuestName, setFeedbackGuestName] = useState('');

  // Force waiter to be online and active on mount
  useEffect(() => {
    if (waiter && !waiter.onlineStatus) {
      toggleOnlineStatus();
    }
  }, [waiter, toggleOnlineStatus]);

  if (!waiter) return null;

  // Active orders assigned to the waiter
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed');

  // Filter unread notifications representing table help requests
  const helpRequests = notifications.filter(n => !n.read && (n.type === 'call_waiter' || n.type === 'billing_request'));

  // Waiter assigned tables
  const myTables = tables.filter(t => t.assignedWaiterId === waiter.id);

  // Available tables for self-assignment
  const availableTables = tables.filter(t => !t.assignedWaiterId || t.assignedWaiterId === '');

  // Base salary/earnings calculations
  const baseSalary = waiter.totalDeliveries * 8;
  const totalEarnings = baseSalary + waiter.todayTips;

  // Categories helper
  const categories = ['All', 'Starters', 'Main Course', 'Biryani', 'Desserts'];

  // POS calculations
  const cartItemKeys = Object.keys(posCart);
  const orderItems = cartItemKeys.map(itemId => {
    const item = menuItems.find(m => m.id === itemId);
    return {
      id: itemId,
      name: item?.name || 'Dish',
      quantity: posCart[itemId],
      price: item?.price || 0,
      prepTime: item?.prepTime || 10
    };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;
  const totalPrepTime = orderItems.reduce((sum, item) => sum + (item.prepTime * item.quantity), 0);

  // Ready orders to display on home page
  const readyOrders = orders.filter(o => 
    o.status === 'Ready' || 
    o.status === 'Picked Up' || 
    (o.status === 'Delivered' && o.paymentStatus !== 'Paid')
  );

  // Handle Cart updates
  const updateCartQuantity = (itemId: string, delta: number) => {
    setPosCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const clearPosCart = () => {
    setPosCart({});
    setPosTable(null);
    setPaymentMethod('later');
    setPosStep('table');
    setCashReceived('');
    setIsSimulatingPayment(false);
  };

  // Submit Waiter POS Order
  const handlePlacePOSOrder = async () => {
    if (!posTable) {
      alert("Please select a table first!");
      return;
    }
    
    if (orderItems.length === 0) {
      alert("Please add items to the order!");
      return;
    }

    // Determine payment status
    const paymentStatus = (paymentMethod === 'cash' || paymentMethod === 'qr') ? 'Paid' : 'Unpaid';

    // Send order to KDS Firestore
    const chefOrderItems = orderItems.map(item => ({ name: item.name, quantity: item.quantity }));
    
    // Trigger KDS creation
    const newOrderId = await useChefStore.getState().addNewOrder(
      chefOrderItems, 
      posTable, 
      totalPrepTime,
      grandTotal,
      paymentMethod,
      paymentStatus
    );

    // Update table assignment in waiter store
    assignTable(posTable.toString(), waiter.id);

    // Clear cart and show success dialog
    clearPosCart();
    setShowPOS(false);
    setShowSuccessOrder(true);

    setTimeout(() => {
      setShowSuccessOrder(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans pb-16">
      
      {/* POS Quick Trigger */}
      <button
        onClick={() => setShowPOS(true)}
        className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[20px] font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Plus className="w-4.5 h-4.5" />
        New Table Order (Direct POS)
      </button>

      {/* Active Help Alerts Section */}
      {helpRequests.length > 0 && (
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-[28px] p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-[#fef3c7] pb-2">
            <h3 className="font-black text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
              Customer Help Calls
            </h3>
            <span className="text-[9.5px] font-black bg-amber-200/50 text-amber-950 px-2 py-0.5 rounded-full">
              {helpRequests.length} Active
            </span>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {helpRequests.map((req) => (
              <div 
                key={req.id}
                className="bg-white border border-[#fef3c7] rounded-xl p-3 flex justify-between items-center text-xs gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800 leading-tight">{req.message}</p>
                  <span className="text-[9.5px] font-bold text-slate-400 mt-1 block">{req.time}</span>
                </div>
                
                <button
                  onClick={() => markNotificationRead(req.id)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-colors shrink-0"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Kitchen Food Ready live deliveries panel */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm space-y-3.5">
        <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2.5">
          <h3 className="font-black text-slate-800 text-[13px] uppercase tracking-wider flex items-center gap-2">
            <Coffee className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
            Kitchen Food Ready
          </h3>
          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
            {readyOrders.length} Active
          </span>
        </div>

        {readyOrders.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-semibold italic flex flex-col items-center justify-center gap-1">
            <span>No orders waiting in kitchen.</span>
            <span className="text-[10px] font-normal text-slate-300">Ready chime will play when food is prepared by chef</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {readyOrders.map((order) => {
              if (order.status === 'Delivered') {
                return (
                  <div 
                    key={order.id}
                    className="p-3.5 rounded-2xl border border-amber-100 bg-amber-50/5 transition-all flex flex-col gap-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 font-poppins">Table {order.tableId}</span>
                          <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 animate-pulse font-bold">
                            Served (Unpaid)
                          </span>
                        </div>
                        <span className="text-[9.5px] font-bold text-slate-400 block mt-1">Order {order.id} • {order.timeOrdered}</span>
                      </div>

                      <button 
                        onClick={() => {
                          setBillingOrder(order);
                          setBillingStep('receipt');
                        }}
                        className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/10"
                      >
                        Generate Bill
                      </button>
                    </div>

                    {/* Items */}
                    <div className="bg-white/60 p-2.5 rounded-xl border border-slate-100/40 flex flex-wrap gap-1.5">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                          {item.name} <strong className="text-slate-800">x{item.quantity}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <ReadyOrderCard
                  key={order.id}
                  order={order}
                  waiterId={waiter.id}
                  onUpdateStatus={updateOrderStatus}
                  onReassign={reassignTableToFreeWaiter}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Sign Out Button */}
      <div className="pt-8 pb-4 flex justify-center">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-xs font-black uppercase tracking-wider px-4 py-2.5 border border-slate-200 hover:border-red-100 hover:bg-red-50/20 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of Terminal
        </button>
      </div>

      {/* POS Order Dialog Overlay */}
      <AnimatePresence>
        {showPOS && (
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
              {/* POS Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-black text-slate-800 font-poppins">POS Order Terminal</h3>
                </div>
                <button onClick={() => setShowPOS(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* POS Steps Indicator */}
              <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-100 shrink-0 relative">
                <div className="relative flex items-center justify-between w-full max-w-sm mx-auto">
                  {/* Background Track Line */}
                  <div className="absolute left-0 right-0 top-[14px] -translate-y-1/2 h-[2px] bg-slate-200 rounded-full z-0" />
                  
                  {/* Animated Progress Line */}
                  <div 
                    className="absolute left-0 top-[14px] -translate-y-1/2 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-650 rounded-full z-0 transition-all duration-300 ease-out"
                    style={{ 
                      width: `${
                        posStep === 'table' ? '0%' :
                        posStep === 'menu' ? '33.33%' :
                        posStep === 'checkout' ? '66.66%' : '100%'
                      }` 
                    }}
                  />
                  
                  {[
                    { id: 'table', label: 'Table', num: 1 },
                    { id: 'menu', label: 'Dishes', num: 2 },
                    { id: 'checkout', label: 'Checkout', num: 3 },
                    { id: 'payment', label: 'Payment', num: 4 }
                  ].map((s, idx) => {
                    const getStepIndex = (step: string) => {
                      if (step === 'table') return 0;
                      if (step === 'menu') return 1;
                      if (step === 'checkout') return 2;
                      return 3;
                    };
                    
                    const currentIdx = getStepIndex(posStep);
                    const isCurrent = idx === currentIdx;
                    const isCompleted = idx < currentIdx;

                    return (
                      <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-black transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-sm shadow-blue-500/10' 
                            : isCompleted 
                              ? 'bg-emerald-500 text-white shadow-sm' 
                              : 'bg-white border border-slate-200 text-slate-400'
                        }`}>
                          {isCompleted ? '✓' : s.num}
                        </div>
                        <span className={`text-[9.5px] font-black uppercase tracking-wider transition-colors duration-305 ${
                          isCurrent 
                            ? 'text-blue-600 font-extrabold' 
                            : isCompleted 
                              ? 'text-slate-655 font-bold' 
                              : 'text-slate-400'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* POS Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 relative">
                <AnimatePresence mode="wait">
                  {posStep === 'table' && (
                    <motion.div
                      key="step-table"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Step 1: Choose Table</label>
                        {posTable && (
                          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                            Table T{posTable} Selected
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const num = i + 1;
                          const isSelected = posTable === num;
                          const tableObj = tables.find(t => t.number === num);
                          
                          // Check states
                          const assignedToOther = tableObj && tableObj.assignedWaiterId && tableObj.assignedWaiterId !== waiter.id;
                          const assignedToMe = tableObj && tableObj.assignedWaiterId === waiter.id;

                          return (
                            <button
                              key={num}
                              type="button"
                              disabled={!!assignedToOther}
                              onClick={() => {
                                setPosTable(num);
                                setTimeout(() => {
                                  setPosStep('menu');
                                }, 220);
                              }}
                              className={`py-3 px-1 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer text-center relative overflow-hidden ${
                                assignedToOther 
                                  ? 'bg-slate-100/50 border-slate-200 text-slate-350 cursor-not-allowed opacity-60' 
                                  : isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-102 font-extrabold'
                                    : assignedToMe
                                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/80 font-bold'
                                      : 'bg-[#fafafc] border-[#f1f5f9] text-slate-700 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <span className="text-xs font-black">T{num}</span>
                              <span className={`text-[8.5px] font-black uppercase tracking-wider ${
                                isSelected ? 'text-white/90' :
                                assignedToOther ? 'text-slate-400' :
                                assignedToMe ? 'text-blue-500' :
                                'text-slate-400'
                              }`}>
                                {assignedToOther ? 'Occupied' :
                                 isSelected ? 'Selected' :
                                 assignedToMe ? 'My Table' :
                                 'Available'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {posStep === 'menu' && (
                    <motion.div
                      key="step-menu"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                        <span className="text-xs font-bold text-slate-700">
                          Selected: <strong className="text-blue-700 font-poppins">Table T{posTable}</strong>
                        </span>
                        <button 
                          type="button"
                          onClick={() => setPosStep('table')}
                          className="text-[10px] font-black text-blue-600 uppercase hover:underline cursor-pointer"
                        >
                          Change Table
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Step 2: Add Dishes</label>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            Cart: {Object.values(posCart).reduce((a,b)=>a+b, 0)} items
                          </span>
                        </div>

                        {/* Categories Roster */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setPosCategory(cat)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 cursor-pointer transition-colors ${
                                posCategory === cat 
                                  ? 'bg-slate-800 text-white' 
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Menu Roster */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {menuItems
                            .filter(item => posCategory === 'All' || item.category === posCategory)
                            .map((item) => {
                              const qty = posCart[item.id] || 0;
                              return (
                                <div 
                                  key={item.id}
                                  className="p-3 bg-[#fafafc] border border-[#f1f5f9] rounded-2xl flex justify-between items-center gap-3 transition-all hover:bg-white hover:border-slate-200"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <img 
                                      src={resolveFoodImage(item.image, item.name)} 
                                      alt={item.name} 
                                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                                    />
                                    <div className="min-w-0">
                                      <h4 className="font-extrabold text-[13px] text-slate-800 truncate">{item.name}</h4>
                                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">₹{item.price.toFixed(2)} • ⏱️ {item.prepTime}m</p>
                                    </div>
                                  </div>

                                  {/* Cart Counters */}
                                  <div className="flex items-center gap-2">
                                    {qty > 0 ? (
                                      <>
                                        <button 
                                          type="button"
                                          onClick={() => updateCartQuantity(item.id, -1)}
                                          className="w-7 h-7 bg-white border border-[#f1f5f9] rounded-lg flex items-center justify-center font-black text-slate-700 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
                                        >
                                          -
                                        </button>
                                        <span className="text-xs font-black text-slate-800 w-4 text-center">{qty}</span>
                                        <button 
                                          type="button"
                                          onClick={() => updateCartQuantity(item.id, 1)}
                                          className="w-7 h-7 bg-white border border-[#f1f5f9] rounded-lg flex items-center justify-center font-black text-slate-700 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
                                        >
                                          +
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => updateCartQuantity(item.id, 1)}
                                        className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-[10.5px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                                      >
                                        Add
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {posStep === 'checkout' && (
                    <motion.div
                      key="step-checkout"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 pb-2">
                          <span>POS Checkout (Table T{posTable})</span>
                          <button onClick={clearPosCart} className="text-red-500 hover:text-red-650 flex items-center gap-1 cursor-pointer font-bold">
                            <Trash2 className="w-3.5 h-3.5" /> Clear All
                          </button>
                        </div>

                        {/* Pricing details */}
                        <div className="space-y-2 text-xs font-bold text-slate-650">
                          {Object.keys(posCart).map(itemId => {
                            const item = menuItems.find(m => m.id === itemId);
                            const qty = posCart[itemId];
                            return (
                              <div key={itemId} className="flex justify-between">
                                <span className="truncate max-w-[200px]">{item?.name} <strong className="text-slate-400">x{qty}</strong></span>
                                <span>₹{((item?.price || 0) * qty).toFixed(2)}</span>
                              </div>
                            );
                          })}
                          <div className="border-t border-slate-200/50 my-2 pt-2 flex justify-between text-[#0f172a] text-sm font-black font-poppins">
                            <span>Grand Total <span className="text-[10px] text-slate-400 font-bold font-sans">(incl. 5% GST)</span></span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Step 3: Payment Method Option */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Payment Mode Setup</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'later', name: 'Pay Later', icon: Landmark },
                              { id: 'cash', name: 'Cash', icon: DollarSign },
                              { id: 'qr', name: 'Terminal QR', icon: CreditCard }
                            ].map((pay) => {
                              const Icon = pay.icon;
                              const isSelected = paymentMethod === pay.id;
                              return (
                                <button
                                  key={pay.id}
                                  type="button"
                                  onClick={() => setPaymentMethod(pay.id as any)}
                                  className={`py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all text-[9.5px] font-black uppercase tracking-wider ${
                                    isSelected 
                                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm scale-102 font-extrabold' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <Icon className="w-4.5 h-4.5" />
                                  <span>{pay.name}</span>
                                </button>
                              );
                            })}
                          </div>
                          
                          <p className="text-[10px] text-slate-400 italic font-semibold mt-1">
                            {paymentMethod === 'later' && "* Order goes to kitchen, billing handled at checkout later."}
                            {paymentMethod === 'cash' && "* Confirm Cash payment before cooking order."}
                            {paymentMethod === 'qr' && "* Generate digital QR scan on screen to verify payment now."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {posStep === 'payment' && (
                    <motion.div
                      key="step-payment"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <span>Payment Verification</span>
                        <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                          Table T{posTable}
                        </span>
                      </div>

                      {paymentMethod === 'cash' ? (
                        <div className="space-y-4 py-1">
                          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Grand Total Due</span>
                            <span className="text-2xl font-black text-slate-800 font-poppins mt-1 block">₹{grandTotal.toFixed(2)}</span>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Cash Received (₹)</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="e.g. 500.00"
                              value={cashReceived}
                              onChange={(e) => setCashReceived(e.target.value)}
                              className="w-full bg-[#fafafc] border border-slate-200 rounded-xl px-4 py-3.5 text-base font-black text-[#0f172a] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:font-normal placeholder:text-slate-300"
                            />
                          </div>

                          {parseFloat(cashReceived) > 0 && (
                            <div className="bg-emerald-50 border border-emerald-100/60 p-4.5 rounded-2xl flex justify-between items-center transition-all duration-300">
                              <div>
                                <span className="text-[10px] font-black text-emerald-800/80 uppercase tracking-wider">Change to Return</span>
                                <span className="text-lg font-black text-emerald-900 font-poppins block mt-0.5">
                                  {parseFloat(cashReceived) >= grandTotal 
                                    ? `₹${(parseFloat(cashReceived) - grandTotal).toFixed(2)}`
                                    : '₹0.00 (Insufficient Cash)'}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-emerald-750 bg-emerald-100/50 px-2.5 py-1 rounded-lg">
                                Cash Tendered
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 py-1 text-center animate-fade-in">
                          <div className="w-40 h-40 mx-auto bg-slate-50 border-2 border-dashed border-indigo-200 rounded-3xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                            {/* QR Code SVG */}
                            <svg className="w-28 h-28 text-slate-800" viewBox="0 0 100 100">
                              <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z" fill="currentColor" />
                              <path d="M45,15 h10 v10 h-10 z M45,35 h15 v10 h-15 z M35,45 h10 v10 h-10 z M15,45 h10 v10 h-10 z M75,45 h10 v10 h-10 z M65,55 h10 v20 h-10 z M45,75 h10 v10 h-10 z M55,65 h10 v15 h-10 z M75,75 h10 v10 h-10 z" fill="currentColor" />
                            </svg>
                            
                            {/* Scan Line Overlay */}
                            <motion.div 
                              animate={{ y: [-10, 140, -10] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                            />
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Dynamic Payment QR</p>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-[280px] mx-auto mt-1">
                              Have the customer scan this code on your screen to pay <strong className="text-slate-800">₹{grandTotal.toFixed(2)}</strong> instantly.
                            </p>
                          </div>

                          <button
                            onClick={async () => {
                              setIsSimulatingPayment(true);
                              setTimeout(() => {
                                handlePlacePOSOrder();
                              }, 1500);
                            }}
                            disabled={isSimulatingPayment}
                            className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                              isSimulatingPayment 
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-wait' 
                                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* POS Footer Actions */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                {posStep === 'table' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setShowPOS(false)}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!posTable}
                      onClick={() => setPosStep('menu')}
                      className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
                        !posTable
                          ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10'
                      }`}
                    >
                      Next: Dishes
                    </button>
                  </>
                )}

                {posStep === 'menu' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setPosStep('table')}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-650 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                    >
                      Back: Table
                    </button>
                    <button
                      type="button"
                      disabled={Object.keys(posCart).length === 0}
                      onClick={() => setPosStep('checkout')}
                      className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
                        Object.keys(posCart).length === 0
                          ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10'
                      }`}
                    >
                      Next: Payment
                    </button>
                  </>
                )}

                {posStep === 'checkout' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setPosStep('menu')}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-655 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                    >
                      Back: Dishes
                    </button>
                    {paymentMethod === 'later' ? (
                      <button
                        type="button"
                        onClick={handlePlacePOSOrder}
                        className="flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10"
                      >
                        Send to Kitchen
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPosStep('payment')}
                        className="flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10"
                      >
                        Continue to Pay
                      </button>
                    )}
                  </>
                )}

                {posStep === 'payment' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => {
                        setPosStep('checkout');
                        setCashReceived('');
                        setIsSimulatingPayment(false);
                      }}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-655 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                    >
                      Back
                    </button>
                    {paymentMethod === 'cash' ? (
                      <button
                        type="button"
                        disabled={!cashReceived || parseFloat(cashReceived) < grandTotal}
                        onClick={handlePlacePOSOrder}
                        className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
                          (!cashReceived || parseFloat(cashReceived) < grandTotal)
                            ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10'
                        }`}
                      >
                        Confirm Cash & Send
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSimulatingPayment}
                        onClick={async () => {
                          setIsSimulatingPayment(true);
                          setTimeout(() => {
                            handlePlacePOSOrder();
                          }, 1500);
                        }}
                        className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
                          isSimulatingPayment
                            ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10'
                        }`}
                      >
                        {isSimulatingPayment ? 'Processing...' : 'Confirm QR & Send'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POS Success Alert Box */}
      <AnimatePresence>
        {showSuccessOrder && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900 text-white rounded-[22px] p-4.5 border border-slate-700 shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black font-poppins text-white">POS Order Sent</p>
              <p className="text-slate-300 text-xs mt-0.5 leading-snug">Order successfully queued to cookline. Table assigned.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiter Billing Modal */}
      <AnimatePresence>
        {billingOrder && (
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
                  <h3 className="text-lg font-black text-slate-800 font-poppins">Table {billingOrder.tableId} Billing</h3>
                </div>
                <button 
                  onClick={() => {
                    setBillingOrder(null);
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
                        {billingOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{((item.price || billingOrder.price / billingOrder.items.length) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150/40 space-y-2 text-xs font-bold text-slate-500">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{(billingOrder.price / 1.05).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (5%)</span>
                        <span>₹{(billingOrder.price - (billingOrder.price / 1.05)).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-200/50 my-2 pt-2 flex justify-between text-[#0f172a] text-sm font-black font-poppins">
                        <span>Grand Total</span>
                        <span>₹{billingOrder.price.toFixed(2)}</span>
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
                      <span className="text-3xl font-black text-emerald-900 font-poppins mt-1 block">₹{billingOrder.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                      Collect cash from customer. Once received, click confirm below to complete order and clear the table.
                    </p>

                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, 'orders', billingOrder.id), { 
                          paymentStatus: 'Paid',
                          paymentMethod: 'cash',
                          status: 'Completed' 
                        });
                        await clearTable(billingOrder.tableId);
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
                        Have the customer scan this code on your screen to pay <strong className="text-slate-850">₹{billingOrder.price.toFixed(2)}</strong>.
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        setIsSimulatingPayment(true);
                        setTimeout(async () => {
                          await updateDoc(doc(db, 'orders', billingOrder.id), { 
                            paymentStatus: 'Paid',
                            paymentMethod: 'upi',
                            status: 'Completed' 
                          });
                          await clearTable(billingOrder.tableId);
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
                          setBillingOrder(null);
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
                          className="w-full bg-[#fafafc] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-850 focus:outline-none focus:border-slate-400 resize-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const reviewId = `REV-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
                          const reviewerName = feedbackGuestName.trim() || `Table ${billingOrder.tableId} Guest`;
                          const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(reviewerName)}`;
                          const todayStr = new Date().toISOString().split('T')[0];
                          const dishName = billingOrder.items?.[0]?.name || 'General Dining';

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
                          setBillingOrder(null);
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
