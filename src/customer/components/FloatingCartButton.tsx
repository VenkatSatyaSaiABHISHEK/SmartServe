import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';

interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const count = useCartStore(state => state.getCartCount());

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white rounded-full flex items-center gap-3 px-6 py-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] z-40 border border-slate-700/50 backdrop-blur-md"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <motion.div 
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
            >
              {count}
            </motion.div>
          </div>
          <span className="font-semibold text-sm">View Cart</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
