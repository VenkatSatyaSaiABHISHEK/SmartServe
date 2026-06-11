import { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FoodCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  type?: 'veg' | 'non-veg';
}

export function FoodCard({ id, name, price, image, type }: FoodCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  
  const cartItem = items.find(item => item.id === id);
  const quantity = cartItem?.quantity || 0;

  const [imgSrc, setImgSrc] = useState(image || '');

  const fallbackImages: Record<string, string> = {
    pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60',
    biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=60',
    paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=60',
    tikka: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&auto=format&fit=crop&q=60',
    starter: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&auto=format&fit=crop&q=60',
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60',
    drink: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&auto=format&fit=crop&q=60',
    dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&auto=format&fit=crop&q=60',
    default: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop&q=60'
  };

  const getFallbackImage = () => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('pizza')) return fallbackImages.pizza;
    if (lowerName.includes('biryani')) return fallbackImages.biryani;
    if (lowerName.includes('paneer') || lowerName.includes('butter') || lowerName.includes('masala')) return fallbackImages.paneer;
    if (lowerName.includes('tikka')) return fallbackImages.tikka;
    if (lowerName.includes('starter') || lowerName.includes('corn')) return fallbackImages.starter;
    if (lowerName.includes('drink') || lowerName.includes('beverage') || lowerName.includes('coke') || lowerName.includes('water')) return fallbackImages.drink;
    if (lowerName.includes('dessert') || lowerName.includes('sweet') || lowerName.includes('ice cream')) return fallbackImages.dessert;
    return fallbackImages.default;
  };

  useEffect(() => {
    setImgSrc(image || '');
  }, [image]);

  const handleImgError = () => {
    setImgSrc(getFallbackImage());
  };

  const activeSrc = imgSrc.trim() === '' ? getFallbackImage() : imgSrc;

  const handleAdd = () => {
    if (quantity === 0) {
      addItem({ id, name, price, quantity: 1, image: activeSrc });
    } else {
      updateQuantity(id, quantity + 1);
    }
  };

  const handleRemove = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      removeItem(id);
    }
  };

  // Deterministic Discount / Combo offer mapping
  const getPromoTag = () => {
    const code = id.charCodeAt(id.length - 1) || 0;
    if (code % 3 === 0) return { label: '10% OFF', bg: 'bg-amber-500/95 text-white' };
    if (code % 3 === 1) return { label: 'BOGO', bg: 'bg-emerald-600/95 text-white' };
    if (code % 5 === 0) return { label: 'COMBO', bg: 'bg-blue-600/95 text-white' };
    return null;
  };

  const promo = getPromoTag();

  return (
    <div 
      onClick={handleAdd}
      className="bg-white rounded-3xl p-1.5 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] border border-slate-100/80 hover:border-indigo-100 transition-all duration-300 relative group h-[195px] cursor-pointer overflow-hidden"
    >
      <div className="flex flex-col gap-2 h-full">
        {/* Food Image Container (Bigger) */}
        <div className="w-full h-[120px] rounded-[20px] overflow-hidden relative bg-slate-50 shrink-0">
          <img 
            src={activeSrc} 
            alt={name} 
            onError={handleImgError}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          
          {/* Promo Tag */}
          {promo && (
            <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${promo.bg} shadow-sm`}>
              {promo.label}
            </div>
          )}

          {/* Veg/Non-Veg Indicator Dot */}
          <div className="absolute top-1.5 right-1.5 bg-white/95 backdrop-blur-sm p-0.5 rounded-md border border-slate-100/50 shadow-sm">
            {type === 'veg' ? (
              <span className="w-2.5 h-2.5 border border-emerald-600 flex items-center justify-center p-0.5 rounded-sm">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full shrink-0" />
              </span>
            ) : (
              <span className="w-2.5 h-2.5 border border-red-600 flex items-center justify-center p-0.5 rounded-sm">
                <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-red-600 shrink-0" />
              </span>
            )}
          </div>

          {/* Quantity Circle Counter Overlay (replaces big buttons, extremely clean!) */}
          {quantity > 0 && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute bottom-2.5 right-2.5 bg-indigo-600 text-white w-7.5 h-7.5 rounded-full flex items-center justify-center text-[12px] font-black shadow-lg shadow-indigo-600/30 border-2 border-white z-10"
            >
              {quantity}
            </motion.div>
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 flex flex-col justify-between pl-1 pr-1 pb-0.5">
          <h3 className="font-extrabold text-slate-800 text-[10.5px] leading-snug line-clamp-2">
            {name}
          </h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-indigo-600 font-black text-[10.5px]">
              ₹{price.toFixed(2)}
            </p>
            {quantity > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full p-0.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 text-[10px] font-black cursor-pointer rounded-full hover:bg-slate-200/60 transition-colors"
                >
                  -
                </button>
                <span className="text-[10px] font-black text-slate-700 min-w-[10px] text-center">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd();
                  }}
                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 text-[10px] font-black cursor-pointer rounded-full hover:bg-slate-200/60 transition-colors"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
