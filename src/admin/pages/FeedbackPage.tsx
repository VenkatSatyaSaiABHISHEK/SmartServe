import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Search, Star, MessageSquare, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface GuestReview {
  id: string;
  customerName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  dishName: string;
}

const MOCK_REVIEWS: GuestReview[] = [
  { id: 'R-01', customerName: 'Alexander Wright', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop', rating: 5, comment: 'The Truffle Mushroom Risotto was absolutely phenomenal. Exceptional texture and pairing. Station Chef 1 deserves a Michelin star.', date: '2026-06-09', dishName: 'Truffle Mushroom Risotto' },
  { id: 'R-02', customerName: 'Meera Patel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop', rating: 5, comment: 'Clean, professional hospitality. Food was prepared extremely fast. The Artisan Burrata was fresh and plated perfectly.', date: '2026-06-08', dishName: 'Artisan Burrata' },
  { id: 'R-03', customerName: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop', rating: 4, comment: 'Wagyu Beef Burger was succulent and flavorful. Only minor critique was that fries could be slightly crispier. Otherwise, outstanding.', date: '2026-06-07', dishName: 'Wagyu Beef Burger' },
  { id: 'R-04', customerName: 'Devon Carter', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop', rating: 3, comment: 'Waited a bit longer than expected during peak hours. The Matcha Lava Cake was delicious, but service speed could improve.', date: '2026-06-02', dishName: 'Matcha Lava Cake' }
];

export function FeedbackPage() {
  const [reviews] = useState<GuestReview[]>(MOCK_REVIEWS);
  const [ratingFilter, setRatingFilter] = useState<'All' | '5' | '4' | '3'>('All');

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (ratingFilter === 'All') return true;
    return rev.rating.toString() === ratingFilter;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">GUEST FEEDBACK CENTER</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Review live guest feedback ratings, reviews, and dish sentiment scores.
          </p>
        </div>
        
        {/* Rating filters */}
        <div className="flex bg-slate-100 p-1.5 rounded-[16px] border border-slate-200/40 self-start">
          {(['All', '5', '4', '3'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setRatingFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingFilter === filter
                  ? 'bg-white text-[#7c3aed] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {filter} {filter !== 'All' ? '★' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 shadow-sm flex items-center gap-4.5">
          <div className="bg-amber-50 text-amber-500 p-3.5 rounded-xl border border-amber-100/50">
            <Star className="w-6 h-6 fill-amber-500 stroke-amber-500" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Score</span>
            <span className="block text-2xl font-black text-[#0f172a] font-poppins mt-0.5">4.8 / 5.0</span>
          </div>
        </div>

        <div className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 shadow-sm flex items-center gap-4.5">
          <div className="bg-purple-50 text-[#7c3aed] p-3.5 rounded-xl border border-purple-100/50">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reviews</span>
            <span className="block text-2xl font-black text-[#0f172a] font-poppins mt-0.5">{reviews.length} reviews</span>
          </div>
        </div>

        <div className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 shadow-sm flex items-center gap-4.5">
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl border border-emerald-100/50">
            <Heart className="w-6 h-6 fill-emerald-500 stroke-emerald-500" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Positive Ratio</span>
            <span className="block text-2xl font-black text-[#0f172a] font-poppins mt-0.5">99.1% Positive</span>
          </div>
        </div>
      </div>

      {/* Reviews feed */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm flex flex-col md:flex-row gap-5 items-start">
            {/* Reviewer avatar info */}
            <div className="flex md:flex-col items-center md:items-start gap-3 w-44 shrink-0">
              <img src={rev.avatar} alt={rev.customerName} className="w-10 h-10 rounded-[14px] object-cover border border-slate-100" />
              <div>
                <h4 className="font-extrabold text-[13.5px] text-[#0f172a] font-poppins leading-tight">{rev.customerName}</h4>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{rev.date}</span>
              </div>
            </div>

            {/* Review content details */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating
                          ? 'fill-amber-500 stroke-amber-500'
                          : 'fill-slate-100 stroke-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Dish: {rev.dishName}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                "{rev.comment}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
