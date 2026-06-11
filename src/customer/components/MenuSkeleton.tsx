import { motion } from 'framer-motion';

export function MenuSkeleton() {
  // Skeleton count for menu cards (e.g. 6 cards to fill the initial viewport)
  const cardSkeletons = Array.from({ length: 6 });
  const categorySkeletons = Array.from({ length: 5 });

  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-[#f8fafc] flex flex-col font-sans select-none">
      
      {/* Top Header Bar Skeleton */}
      <div className="px-6 py-3.5 shrink-0 bg-white border-b border-slate-100 flex justify-between items-center z-30">
        <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
        <div className="w-24 h-6 bg-slate-100 rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-slate-50 rounded-full animate-pulse" />
      </div>

      {/* Main Body (non-scrollable skeleton representation) */}
      <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col gap-5">
        
        {/* Title / Headline Skeleton */}
        <div className="space-y-2 shrink-0">
          <div className="w-48 h-6 bg-slate-200 rounded-lg animate-pulse" />
          <div className="w-32 h-4 bg-slate-100 rounded-lg animate-pulse" />
        </div>

        {/* Top Promo Banner Skeleton */}
        <div className="w-full h-22 bg-slate-200/60 rounded-3xl border border-slate-150 p-4 shrink-0 flex items-center justify-between relative overflow-hidden animate-pulse">
          <div className="flex flex-col gap-2 w-2/3">
            <div className="w-12 h-3.5 bg-slate-300 rounded" />
            <div className="w-36 h-4 bg-slate-300 rounded" />
            <div className="w-28 h-3 bg-slate-200 rounded mt-1" />
          </div>
          <div className="w-16 h-16 bg-slate-300 rounded-2xl" />
        </div>

        {/* Categories Chips Skeleton */}
        <div className="flex gap-2 overflow-x-hidden pt-1 pb-2 shrink-0">
          {categorySkeletons.map((_, i) => (
            <div
              key={i}
              className="px-4 py-2 bg-white border border-slate-100 rounded-full shrink-0 flex items-center justify-center animate-pulse"
              style={{
                width: i % 2 === 0 ? '70px' : '90px',
              }}
            >
              <div className="w-full h-3 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>

        {/* 3-Column Food Grid Skeleton */}
        <div className="grid grid-cols-3 gap-2 flex-1 overflow-hidden">
          {cardSkeletons.map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-1.5 flex flex-col justify-between border border-slate-100/80 h-[195px] overflow-hidden"
            >
              <div className="flex flex-col gap-2 h-full">
                {/* Image placeholder */}
                <div className="w-full h-[120px] rounded-[20px] bg-slate-100 animate-pulse shrink-0" />
                
                {/* Details placeholders */}
                <div className="flex-1 flex flex-col justify-between pl-1 pr-1 pb-0.5 gap-1.5">
                  <div className="w-full h-3 bg-slate-150 rounded animate-pulse" />
                  <div className="flex justify-between items-center mt-1">
                    <div className="w-10 h-3 bg-indigo-100 rounded animate-pulse" />
                    <div className="w-4 h-4 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
