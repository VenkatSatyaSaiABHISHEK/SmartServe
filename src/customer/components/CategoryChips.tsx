import { motion } from 'framer-motion';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryChips({ categories, selectedCategory, onSelect }: CategoryChipsProps) {
  return (
    <div className="px-6 flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`relative px-4.5 py-2 rounded-full text-[12.5px] font-bold tracking-wide whitespace-nowrap transition-colors duration-200 cursor-pointer ${
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
            <span className="relative z-10" style={{ color: isSelected ? '#ffffff' : undefined }}>
              {category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
