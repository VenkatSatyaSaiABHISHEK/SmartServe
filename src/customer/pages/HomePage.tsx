import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategoryChips } from '../components/CategoryChips';
import { FoodCard } from '../components/FoodCard';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { BottomSheet } from '../components/BottomSheet';
import { useCartStore } from '../store/useCartStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Biryani', 'Drinks', 'Desserts'];

const ADS = [
  { id: 1, title: "🍕 Pepperoni Feast", desc: "Enjoy 20% OFF on all Gourmet Pizzas today!", tag: "20% OFF", bg: "from-blue-600 to-indigo-600" },
  { id: 2, title: "🥭 Mango Smoothie Combo", desc: "Buy 1 Get 1 Free combo offer!", tag: "BOGO", bg: "from-emerald-600 to-teal-600" },
  { id: 3, title: "🍛 Royal Biryani Deal", desc: "Free cold beverage with any Biryani order!", tag: "COMBO", bg: "from-amber-600 to-orange-600" }
];

export function HomePage() {
  const MOCK_FOODS = useAdminStore(state => state.menuItems);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useCartStore(state => state.items);
  const cartTotal = useCartStore(state => state.getCartTotal());
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const dietPreference = useCartStore(state => state.dietPreference);
  const setDietPreference = useCartStore(state => state.setDietPreference);
  const navigate = useNavigate();

  // Promo Banner Carousel State
  const [adIndex, setAdIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ADS.length);
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
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-[#fafafc] flex flex-col font-sans select-none">
      
      {/* Fixed Header */}
      <div className="px-6 pt-6 pb-2 shrink-0 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Exit
          </button>
          
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[9.5px] font-black uppercase tracking-wider ${slotInfo[currentSlot].color}`}>
              {slotInfo[currentSlot].label}
            </div>
            
            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-700 rounded-full border border-slate-100">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="text-xl font-black text-[#0f172a] leading-tight tracking-tight font-poppins">
          What would you like today?
        </h1>

        {/* Diet Preference Selector */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DIET:</span>
            <span className={`text-[10px] font-black flex items-center gap-1 ${
              dietPreference === 'veg' ? 'text-green-600' : dietPreference === 'non-veg' ? 'text-red-600' : 'text-slate-700'
            }`}>
              {dietPreference === 'veg' && (
                <>
                  <span className="w-2 h-2 border border-[#16a34a] flex items-center justify-center p-0.5 rounded-sm shrink-0">
                    <span className="w-1 h-1 bg-[#16a34a] rounded-full" />
                  </span>
                  Veg
                </>
              )}
              {dietPreference === 'non-veg' && (
                <>
                  <span className="w-2 h-2 border border-[#dc2626] flex items-center justify-center p-0.5 rounded-sm shrink-0">
                    <span className="w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-b-[5px] border-b-[#dc2626]" />
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
            className="text-[9.5px] font-black text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer uppercase tracking-wider"
          >
            Change Preference
          </button>
        </div>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-24">
        
        {/* Promotional Advertisement Carousel Banner */}
        <div className="px-6 pt-4 shrink-0">
          <div className="h-18 rounded-2xl overflow-hidden relative shadow-sm border border-slate-100 bg-slate-900 text-white">
            <AnimatePresence mode="wait">
              {ADS.map((ad, idx) => {
                if (idx !== adIndex) return null;
                return (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute inset-0 bg-gradient-to-r ${ad.bg} p-3 flex justify-between items-center`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-white/20 text-white text-[8px] font-black uppercase px-1 rounded">
                          {ad.tag}
                        </span>
                        <h4 className="text-[11px] font-black tracking-wide truncate">{ad.title}</h4>
                      </div>
                      <p className="text-[9.5px] text-white/80 font-bold leading-tight mt-0.5 truncate">{ad.desc}</p>
                    </div>
                    <span className="text-xl shrink-0">✨</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="pt-4 shrink-0">
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
                <span className="text-slate-700">₹{cartTotal.toFixed(2)}</span>
              </div>
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
    </div>
  );
}
