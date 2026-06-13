import { useState, useEffect } from 'react';
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

export function FeedbackPage() {
  const { reviews, reviewsLoaded, listenToReviews } = useAdminStore();
  const [ratingFilter, setRatingFilter] = useState<'All' | '5' | '4' | '3'>('All');

  useEffect(() => {
    const unsub = listenToReviews();
    return () => unsub();
  }, [listenToReviews]);

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (ratingFilter === 'All') return true;
    return rev.rating.toString() === ratingFilter;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const positiveRatio = reviews.length > 0
    ? ((positiveReviews / reviews.length) * 100).toFixed(1)
    : '0.0';

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
            <span className="block text-2xl font-black text-[#0f172a] font-poppins mt-0.5">{avgRating} / 5.0</span>
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
            <span className="block text-2xl font-black text-[#0f172a] font-poppins mt-0.5">{positiveRatio}% Positive</span>
          </div>
        </div>
      </div>

      {/* Reviews feed */}
      <div className="space-y-4">
        {!reviewsLoaded ? (
          <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400 mt-3">Loading guest feedback...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-12 text-center shadow-sm">
            <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4.5">
              <MessageSquare className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-[15px] font-black text-[#0f172a] font-poppins">No Feedback Found</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-sm mx-auto">
              There is no guest feedback matching your criteria or recorded in the database.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
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
          ))
        )}
      </div>
    </div>
  );
}
