import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ShoppingBag, X, Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategoryChips } from '../components/CategoryChips';
import { FoodCard } from '../components/FoodCard';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { BottomSheet } from '../components/BottomSheet';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { exitFullscreen } from '../utils/fullscreen';
import { MenuSkeleton } from '../components/MenuSkeleton';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Biryani', 'Drinks', 'Desserts'];

const ADS = [
  { 
    id: 1, 
    title: "🍕 Pepperoni Feast", 
    desc: "Enjoy 20% OFF on all Gourmet Pizzas today!", 
    tag: "20% OFF", 
    bg: "bg-[#e0e7ff]", 
    badgeBg: "bg-indigo-600/10 text-indigo-700", 
    textColor: "text-indigo-950", 
    descColor: "text-indigo-600/80" 
  },
  { 
    id: 2, 
    title: "🥭 Mango Smoothie Combo", 
    desc: "Buy 1 Get 1 Free combo offer!", 
    tag: "BOGO", 
    bg: "bg-[#ecfdf5]", 
    badgeBg: "bg-emerald-600/10 text-emerald-700", 
    textColor: "text-emerald-950", 
    descColor: "text-emerald-600/80" 
  },
  { 
    id: 3, 
    title: "🍛 Royal Biryani Deal", 
    desc: "Free cold beverage with any Biryani order!", 
    tag: "COMBO", 
    bg: "bg-[#fffbeb]", 
    badgeBg: "bg-amber-600/10 text-amber-700", 
    textColor: "text-amber-950", 
    descColor: "text-amber-600/80" 
  }
];

export function HomePage() {
  const MOCK_FOODS = useAdminStore(state => state.menuItems);
  const menuItemsLoaded = useAdminStore(state => state.menuItemsLoaded);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { orderId, status: orderStatus, estimatedTimeMins } = useOrderStore();
  const previousOrderId = useOrderStore(state => state.previousOrderId);
  
  const cartItems = useCartStore(state => state.items);
  const isDiscountActive = useCartStore(state => state.isDiscountActive);
  const applyDiscount = useCartStore(state => state.applyDiscount);
  
  const rawSubtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = isDiscountActive ? rawSubtotal * 0.2 : 0;
  const cartTotal = rawSubtotal - discountAmount;
  
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const dietPreference = useCartStore(state => state.dietPreference);
  const setDietPreference = useCartStore(state => state.setDietPreference);
  const tableNumber = useCartStore(state => state.tableNumber);
  const navigate = useNavigate();

  // Feedback states for previous order review
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [selectedDish, setSelectedDish] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [previousOrderItems, setPreviousOrderItems] = useState<string[]>([]);

  // Fetch items from the previous order to pre-populate chips
  useEffect(() => {
    if (previousOrderId) {
      getDoc(doc(db, 'orders', previousOrderId)).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.items) {
            const names = data.items.map((it: any) => it.name);
            setPreviousOrderItems(names);
          }
        }
      }).catch(err => console.error("Error loading previous order items:", err));
    }
  }, [previousOrderId]);

  if (!menuItemsLoaded) {
    return <MenuSkeleton />;
  }

  // Promo Banner Carousel State
  const [adIndex, setAdIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev: number) => (prev + 1) % ADS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = new Date().getHours();
  let currentSlot: 'morning' | 'evening' | 'night' = 'morning';
  if (currentHour >= 5 && currentHour < 12) {
    currentSlot = 'morning';
  } else if (currentHour >= 12 && currentHour < 19) {
    currentSlot = 'evening';
  } else {
    currentSlot = 'night';
  }

  const slotInfo = {
    morning: { label: 'Morning Menu Active 🌅', color: 'text-amber-700 bg-amber-50 border-amber-100/60' },
    evening: { label: 'Evening Menu Active 🌆', color: 'text-indigo-700 bg-indigo-50 border-indigo-100/60' },
    night: { label: 'Night Menu Active 🌌', color: 'text-purple-700 bg-purple-50 border-purple-100/60' }
  };

  const gst = cartTotal * 0.05; // 5% GST
  const grandTotal = cartTotal + gst;

  // Filter foods by category, dietary preference, and time-of-day slot
  const filteredFoods = MOCK_FOODS.filter(food => {
    const matchesSlot = !food.slot || food.slot === 'all' || food.slot === currentSlot;
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesDiet = dietPreference === 'all' || food.type === dietPreference;
    return matchesSlot && matchesCategory && matchesDiet;
  });

  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-[#f8fafc] flex flex-col font-sans select-none">
      
      {/* Slim Fixed Top Bar */}
      <div className="px-6 py-3.5 shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-100 flex justify-between items-center z-30">
        <button 
          onClick={() => {
            exitFullscreen();
            navigate('/');
          }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Exit
        </button>
        
        {/* Fixed Welcome Message Box in the Center */}
        <div className="bg-indigo-50/80 border border-indigo-100/30 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_2px_10px_rgba(99,102,241,0.03)]">
          <span>Welcome</span>
          {tableNumber > 0 && (
            <>
              <span className="w-1 h-1 bg-indigo-300 rounded-full" />
              <span>Table {tableNumber}</span>
            </>
          )}
        </div>
        
        <button className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-700 rounded-full border border-slate-100">
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-24">
        
        {/* Active Order / Previous Order Banner */}
        {orderId && (
          <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl flex justify-between items-center shadow-sm">
            <div className="min-w-0">
              <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Active Order</span>
              <h4 className="text-xs font-black text-slate-800 font-poppins mt-1.5">Order #{orderId} • {orderStatus}</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Est. Delivery: {estimatedTimeMins} mins</p>
            </div>
            <button 
              onClick={() => navigate('/tracking')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-sm cursor-pointer shrink-0 transition-colors animate-pulse"
            >
              Track Live
            </button>
          </div>
        )}

        {!orderId && previousOrderId && (
          <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-emerald-55 to-teal-55 border border-emerald-100 rounded-3xl flex justify-between items-center shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Next order 20% Off</span>
                {isDiscountActive ? (
                  <span className="text-[9px] font-extrabold text-emerald-700 animate-pulse">Applied 🏷️</span>
                ) : (
                  <span className="text-[9px] font-extrabold text-slate-400">Available</span>
                )}
              </div>
              <h4 className="text-xs font-black text-slate-855 mt-1.5 font-poppins">Previous Order: #{previousOrderId}</h4>
              <p className="text-[10px] font-bold text-emerald-655 mt-0.5">
                {isDiscountActive ? "20% discount is active in your cart!" : "Tap 'Claim' to apply 20% discount on your next order!"}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0 items-end ml-2">
              {!isDiscountActive ? (
                <button 
                  onClick={() => {
                    applyDiscount(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-sm cursor-pointer shrink-0 transition-colors"
                >
                  Claim
                </button>
              ) : (
                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-wider">✓ Active</span>
              )}

              {!feedbackSubmitted && (
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="bg-white border border-emerald-200 text-emerald-650 hover:bg-slate-50 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl shadow-sm cursor-pointer transition-colors shrink-0"
                >
                  Rate Food
                </button>
              )}
            </div>
          </div>
        )}

        {/* Welcome Header & Diet Selector inside scrollable area (hides on scroll) */}
        <div className="px-6 pt-5 pb-1">
          <h1 className="text-lg font-black text-[#0f172a] leading-tight tracking-tight font-poppins">
            What would you like today?
          </h1>

          {/* Diet Preference Selector */}
          <div className="flex items-center justify-between mt-3 bg-white p-2.5 rounded-2xl border border-slate-100/80 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DIET:</span>
              <span className={`text-[10px] font-black flex items-center gap-1 ${
                dietPreference === 'veg' ? 'text-green-600' : dietPreference === 'non-veg' ? 'text-red-600' : 'text-slate-700'
              }`}>
                {dietPreference === 'veg' && (
                  <>
                    <span className="w-2.5 h-2.5 border border-[#16a34a] flex items-center justify-center p-0.5 rounded-sm shrink-0">
                      <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full" />
                    </span>
                    Veg
                  </>
                )}
                {dietPreference === 'non-veg' && (
                  <>
                    <span className="w-2.5 h-2.5 border border-[#dc2626] flex items-center justify-center p-0.5 rounded-sm shrink-0">
                      <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5.5px] border-b-[#dc2626]" />
                    </span>
                    Non-Veg
                  </>
                )}
                {dietPreference === 'all' && "✨ All Foods"}
              </span>
            </div>
            
            <button 
              onClick={() => {
                const next: Record<typeof dietPreference, typeof dietPreference> = {
                  all: 'veg',
                  veg: 'non-veg',
                  'non-veg': 'all'
                };
                setDietPreference(next[dietPreference]);
              }}
              className="text-[9.5px] font-black text-blue-600 bg-blue-50/80 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer uppercase tracking-wider"
            >
              Change Preference
            </button>
          </div>
        </div>

        {/* Promotional Advertisement Carousel Banner */}
        <div className="px-6 pt-3 shrink-0">
          <motion.div 
            animate={{ 
              backgroundColor: ADS[adIndex].bg === 'bg-[#e0e7ff]' ? '#e0e7ff' : 
                               ADS[adIndex].bg === 'bg-[#ecfdf5]' ? '#ecfdf5' : '#fffbeb' 
            }}
            transition={{ duration: 0.4 }}
            className="h-22 rounded-2xl relative shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/50 flex justify-between items-center p-3 px-4 text-slate-800"
          >
            {/* Left side: Slides of text */}
            <div className="min-w-0 flex-1 relative h-full overflow-hidden">
              <AnimatePresence mode="wait">
                {ADS.map((ad, idx) => {
                  if (idx !== adIndex) return null;
                  return (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded ${ad.badgeBg}`}>
                          {ad.tag}
                        </span>
                        <h4 className={`text-[12.5px] font-black tracking-wide truncate ${ad.textColor}`}>
                          {ad.title}
                        </h4>
                      </div>
                      <p className={`text-[10px] font-bold leading-tight mt-1 truncate ${ad.descColor}`}>
                        {ad.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right side: Fixed Lottie animation popping out of the top */}
            <div className="w-22 h-22 shrink-0 flex items-center justify-center relative -mt-7 -mr-3 z-10">
              <DotLottieReact
                src="https://lottie.host/a17a42f5-3489-426c-8967-49eb5f3e588f/dRnBMKw7wA.lottie"
                loop
                autoplay
                renderConfig={{
                  devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
                  autoResize: true,
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Categories horizontal wrap chips: Sticky top container */}
        <div className="sticky top-0 z-20 bg-[#f8fafc]/95 backdrop-blur-md border-b border-slate-100/60 pt-4 pb-3.5 shrink-0">
          <CategoryChips 
            categories={CATEGORIES} 
            selectedCategory={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        </div>

        {/* 3-Column Food Grid */}
        <div className="px-6 py-2.5">
          {filteredFoods.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic font-bold">
              No items match this selection.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredFoods.map(food => (
                <FoodCard key={food.id} {...food} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button (Absolute, positioned inside frame) */}
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />

      {/* Cart Bottom Sheet Overlay */}
      <BottomSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <h2 className="text-lg font-black text-slate-800 mb-4 font-poppins uppercase tracking-wider">Your Order</h2>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold">
            Your cart is empty. Add some delicious food!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 max-h-[35vh] overflow-y-auto pr-1">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3 items-center bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-800 truncate font-poppins">{item.name}</h4>
                    <p className="text-blue-600 font-black text-[10px] mt-0.5">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-slate-400 hover:text-slate-800 text-[10px] font-black cursor-pointer">-</button>
                    <span className="text-[10px] font-black w-4 text-center text-slate-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-slate-400 hover:text-slate-800 text-[10px] font-black cursor-pointer">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-slate-100 w-full my-1" />

            <div className="flex flex-col gap-2 text-xs font-bold">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-700">₹{rawSubtotal.toFixed(2)}</span>
              </div>
              {isDiscountActive && (
                <div className="flex justify-between text-emerald-600 font-extrabold font-poppins animate-pulse">
                  <span>Re-order 20% Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>GST (5%)</span>
                <span className="text-slate-700">₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-850 pt-1 border-t border-dashed border-slate-200 font-poppins">
                <span>Total</span>
                <span className="text-blue-600">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button 
                onClick={() => setIsCartOpen(false)}
                className="flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-wider text-slate-500 bg-slate-100 cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => navigate('/payment')}
                className="flex-[1.5] py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10 cursor-pointer text-center"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-2xl space-y-5 text-slate-805"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-poppins font-black text-sm text-slate-900 uppercase tracking-tight">
                    Rate Order #{previousOrderId}
                  </h3>
                  <span className="text-[9.5px] text-slate-400 font-extrabold uppercase mt-0.5 block">Loyalty Reward Review</span>
                </div>
                <button onClick={() => setShowFeedbackModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedbackSubmitted ? (
                <div className="flex flex-col items-center py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 font-poppins">Feedback Submitted!</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Thank you for sharing your experience.</p>
                  </div>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="mt-4 px-6 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs font-bold text-slate-600">
                  {/* Dish selection */}
                  {previousOrderItems.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Which dish did you enjoy most?</span>
                      <div className="flex flex-wrap gap-1.5">
                        {previousOrderItems.map((dish: string) => (
                          <button
                            key={dish}
                            type="button"
                            onClick={() => setSelectedDish(dish)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              (selectedDish || previousOrderItems[0]) === dish
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-55 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {dish}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Star selection */}
                  <div className="flex flex-col items-center py-1.5 border-y border-slate-55 space-y-1.5">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Select Rating Score</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= rating
                                ? 'fill-amber-400 stroke-amber-500'
                                : 'fill-slate-100 stroke-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and comment */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block pl-1">Your Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Liam (defaults to Guest)"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-[#fafafc] border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-300 focus:bg-white transition-all shadow-inner"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block pl-1">Review Comments</label>
                      <textarea
                        placeholder="Tell us about food taste, plating, or service..."
                        rows={3}
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="w-full bg-[#fafafc] border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-300 focus:bg-white transition-all resize-none shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const reviewId = `REV-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
                        const dishToRate = selectedDish || (previousOrderItems[0] || 'General Experience');
                        const reviewerName = guestName.trim() || `Table ${tableNumber || 1} Guest`;
                        const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(reviewerName)}`;
                        const todayStr = new Date().toISOString().split('T')[0];

                        await setDoc(doc(db, 'reviews', reviewId), {
                          id: reviewId,
                          customerName: reviewerName,
                          avatar: avatarUrl,
                          rating: rating,
                          comment: feedbackComment,
                          date: todayStr,
                          dishName: dishToRate
                        });

                        setFeedbackSubmitted(true);
                      } catch (e) {
                        console.error("Error submitting feedback:", e);
                      }
                    }}
                    disabled={!feedbackComment.trim()}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer shadow-md shadow-slate-900/10 active:scale-98 transition-all"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
