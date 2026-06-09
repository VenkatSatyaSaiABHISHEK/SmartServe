import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategoryChips } from '../components/CategoryChips';
import { FoodCard } from '../components/FoodCard';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { BottomSheet } from '../components/BottomSheet';
import { useCartStore } from '../store/useCartStore';
import { useAdminStore } from '../../admin/store/useAdminStore';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Biryani', 'Drinks', 'Desserts'];

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

  const gst = cartTotal * 0.05; // 5% GST
  const grandTotal = cartTotal + gst;

  // Filter foods by both category and dietary preference
  const filteredFoods = MOCK_FOODS.filter(food => {
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesDiet = dietPreference === 'all' || food.type === dietPreference;
    return matchesCategory && matchesDiet;
  });

  return (
    <div className="min-h-screen bg-[#fafafc] pb-32">
      {/* Header - Made More Compact */}
      <div className="px-6 pt-7 pb-2">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[#64748b] font-semibold text-[14px] tracking-wide">Good Afternoon 👋</p>
          <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-[#f1f5f9] text-[#1e293b] hover:bg-slate-50 transition-colors">
            <Search className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
        </div>
        <h1 className="text-[30px] font-extrabold text-[#0f172a] leading-[1.15] tracking-[-0.02em] font-poppins mb-3">
          What would <br />
          you like today?
        </h1>
      </div>

      {/* Diet Preference Status Banner */}
      <div className="px-6 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#f1f5f9] shadow-[0_4px_10px_rgba(0,0,0,0.01)]">
          <span className="text-[11px] font-bold text-slate-400">DIET:</span>
          <span className={`text-[12px] font-extrabold flex items-center gap-1.5 ${
            dietPreference === 'veg' ? 'text-green-600' : dietPreference === 'non-veg' ? 'text-red-600' : 'text-slate-700'
          }`}>
            {dietPreference === 'veg' && (
              <>
                <span className="w-2.5 h-2.5 border-2 border-[#16a34a] flex items-center justify-center p-0.5 rounded-sm shrink-0">
                  <span className="w-1 h-1 bg-[#16a34a] rounded-full" />
                </span>
                Pure Veg Only
              </>
            )}
            {dietPreference === 'non-veg' && (
              <>
                <span className="w-2.5 h-2.5 border-2 border-[#dc2626] flex items-center justify-center p-0.5 rounded-sm shrink-0">
                  <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#dc2626]" />
                </span>
                Non-Veg Only
              </>
            )}
            {dietPreference === 'all' && (
              <>
                ✨ All Foods
              </>
            )}
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
          className="text-[12px] font-bold text-[#7c3aed] bg-[#f5f3ff] px-3 py-1 rounded-full hover:bg-[#edd4ff]/50 transition-colors cursor-pointer"
        >
          Change filter
        </button>
      </div>

      {/* Categories */}
      <CategoryChips 
        categories={CATEGORIES} 
        selectedCategory={selectedCategory} 
        onSelect={setSelectedCategory} 
      />

      {/* Food Grid */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4">
        {filteredFoods.map(food => (
          <FoodCard key={food.id} {...food} />
        ))}
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />

      {/* Cart Bottom Sheet */}
      <BottomSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Order</h2>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Your cart is empty. Add some delicious food!
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover bg-slate-100" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                    <p className="text-slate-500 font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-slate-600">-</button>
                    <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-slate-600">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-slate-100 w-full my-2" />

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (5%)</span>
                <span className="font-medium">${gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-800 mt-2">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setIsCartOpen(false)}
                className="flex-1 py-4 rounded-full font-semibold text-slate-600 bg-slate-100"
              >
                Continue Shopping
              </button>
              <button 
                onClick={() => navigate('/payment')}
                className="flex-[1.5] py-4 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-purple-500/25"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
