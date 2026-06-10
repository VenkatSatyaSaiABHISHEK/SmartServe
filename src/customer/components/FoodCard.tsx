import { useCartStore } from '../store/useCartStore';
import { Plus, Minus } from 'lucide-react';

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

  const handleAdd = () => {
    if (quantity === 0) {
      addItem({ id, name, price, quantity: 1, image });
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
    if (code % 3 === 0) return { label: '10% OFF', bg: 'bg-amber-500/90 text-white' };
    if (code % 3 === 1) return { label: 'BOGO', bg: 'bg-emerald-600/90 text-white' };
    if (code % 5 === 0) return { label: 'COMBO', bg: 'bg-blue-600/90 text-white' };
    return null;
  };

  const promo = getPromoTag();

  return (
    <div 
      className="bg-white rounded-2xl p-2 flex flex-col justify-between shadow-[0_6px_16px_rgba(0,0,0,0.015)] border border-[#f1f5f9] hover:border-blue-100 hover:shadow-md transition-all duration-200 relative group h-[190px]"
    >
      <div className="flex flex-col gap-2 h-full">
        {/* Food Image Container */}
        <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-slate-50 shrink-0">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          
          {/* Promo Tag */}
          {promo && (
            <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${promo.bg} shadow-sm`}>
              {promo.label}
            </div>
          )}

          {/* Veg/Non-Veg Indicator Dot */}
          <div className="absolute top-1 right-1 bg-white/95 backdrop-blur-sm p-0.5 rounded-md border border-slate-100/50 shadow-sm">
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
        </div>

        {/* Text Details */}
        <div className="flex-1 flex flex-col justify-between min-h-0 pl-0.5 pr-0.5">
          <h3 className="font-extrabold text-[#1e293b] text-[11px] leading-tight font-poppins line-clamp-2">
            {name}
          </h3>
          <p className="text-blue-600 font-black text-[10px] mt-0.5">
            ₹{price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Selector Area */}
      <div className="mt-2 pl-0.5 pr-0.5">
        {quantity === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            className="w-full py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-0.5 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5 shrink-0" /> Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-0.5 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-800 font-black text-xs cursor-pointer rounded hover:bg-slate-200/50"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="text-[10px] font-black text-slate-800">{quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
              className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-800 font-black text-xs cursor-pointer rounded hover:bg-slate-200/50"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
