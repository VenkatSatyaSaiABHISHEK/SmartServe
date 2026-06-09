import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryChips({ categories, selectedCategory, onSelect }: CategoryChipsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress(scrollLeft / maxScroll);
      }
    }
  };

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [categories]);

  return (
    <div className="relative flex flex-col gap-3">
      {/* Scrollable Categories container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-6 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelect(category)}
              className={`relative px-6 py-2.5 rounded-full text-[14px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-300 ${
                isSelected 
                  ? 'text-white' 
                  : 'text-[#475569] bg-white border border-[#e2e8f0]/80 hover:bg-slate-50 shadow-sm shadow-[#000000]/[0.01]'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-[#0f172a] rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{ zIndex: 1 }}
                />
              )}
              <span className="relative z-10" style={{ color: isSelected ? '#ffffff' : undefined }}>{category}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Scroll Indicator */}
      {showScrollIndicator && (
        <div className="px-6 mb-1">
          <div className="h-[2.5px] bg-[#f1f5f9] w-[120px] rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute top-0 bottom-0 left-0 bg-[#cbd5e1] rounded-full"
              style={{
                width: '40px',
                x: scrollProgress * (120 - 40),
              }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
