import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiquidButtonProps {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  className?: string;
}

export function LiquidButton({ quantity, onAdd, onRemove, className }: LiquidButtonProps) {
  const isAdded = quantity > 0;

  return (
    <motion.div
      layout
      initial={{ borderRadius: 24 }}
      animate={{
        width: isAdded ? 96 : 48,
        borderRadius: isAdded ? 24 : 24,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "h-12 bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white flex items-center justify-center overflow-hidden shadow-lg shadow-purple-500/25 cursor-pointer hover:brightness-105 active:scale-95 transition-all duration-200",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {!isAdded ? (
          <motion.button
            key="add"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full flex items-center justify-center rounded-tl-[24px]"
            onClick={onAdd}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.div
            key="controls"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between w-full px-2 h-full rounded-tl-[24px]"
          >
            <button onClick={onRemove} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <motion.span 
              key={quantity}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-sm font-semibold min-w-[12px] text-center"
            >
              {quantity}
            </motion.span>
            <button onClick={onAdd} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
