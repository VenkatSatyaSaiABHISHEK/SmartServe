import { useCartStore } from '../store/useCartStore';
import { LiquidButton } from './animations/LiquidButton';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
}

export function FoodCard({ id, name, price, image }: FoodCardProps) {
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

  return (
    <div 
      onClick={handleAdd}
      className="bg-white rounded-[32px] p-3.5 flex flex-col justify-between shadow-[0_12px_24px_rgba(0,0,0,0.02)] border border-[#f1f5f9] hover:border-purple-200/50 hover:shadow-[0_16px_32px_rgba(124,58,237,0.04)] cursor-pointer active:scale-[0.98] transition-all duration-300 relative group h-full"
    >
      <div className="flex flex-col gap-3">
        <div className="w-full aspect-square rounded-[24px] overflow-hidden relative bg-slate-100">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          {/* Message Square / Tap to Add Icon Badge */}
          <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform group-hover:scale-105">
            <MessageSquare className="w-3.5 h-3.5 text-purple-300 fill-purple-300/35" />
            <span className="text-[10px] font-extrabold tracking-wide">TAP TO ADD</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-0.5 pl-1 pr-1">
          <h3 className="font-bold text-[#1b253b] text-[15px] leading-snug break-words">
            {name}
          </h3>
          <p className="text-[#64748b] font-semibold text-[14px] mt-0.5">
            ${price.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="pl-1 pr-1 pb-1 mt-2">
        <AnimatePresence>
          {quantity > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scale: 0.9 }}
              animate={{ height: "auto", opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="relative w-full overflow-hidden"
            >
              <LiquidButton 
                quantity={quantity}
                onAdd={handleAdd}
                onRemove={handleRemove}
                className="w-full justify-between"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
