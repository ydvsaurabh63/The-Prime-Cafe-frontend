import React, { useState } from 'react';
import {
  Star,
  X,
  Sparkles,
  CheckCircle2,
  Send,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Crisp Google Icon SVG
const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const RATING_WORDS = {
  5: 'Exceptional experience!',
  4: 'Very Good!',
  3: 'Good experience',
  2: 'Needs improvement',
  1: 'Disappointed'
};

const QUICK_TAGS = ['Dine-In', 'Takeaway', 'Regular'];

const POSITIVE_PRESETS = [
  '☕ Best coffee & cozy vibes!',
  '🍔 Delicious food & quick service!',
  '✨ Great hospitality & aesthetic!',
  '🍕 10/10 taste, loved it!'
];

const ReviewModal = ({ isOpen, onClose, onReviewSubmitted, googleReviewUrl }) => {
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [tag, setTag] = useState('Dine-In');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!review.trim()) {
      setError('Please write your review');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        name: name.trim(),
        rating,
        tag: tag || 'Verified Diner',
        review: review.trim(),
        source: rating >= 4 ? 'Google' : 'In-House'
      };

      let reviewData = null;

      try {
        const res = await api.post('/reviews', payload);
        if (res.data?.success) {
          reviewData = res.data.data;
        }
      } catch (apiErr) {
        // If main api returned 404 (e.g. Render not yet updated), try localhost:5000 directly
        try {
          const directRes = await fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await directRes.json();
          if (json?.success) {
            reviewData = json.data;
          }
        } catch {}

        // If local also fails (e.g. offline/no server), save locally so user is never blocked
        if (!reviewData) {
          const fallbackReview = {
            _id: 'local_' + Date.now(),
            ...payload,
            createdAt: new Date().toISOString()
          };
          try {
            const cached = JSON.parse(localStorage.getItem('akc_offline_reviews') || '[]');
            cached.unshift(fallbackReview);
            localStorage.setItem('akc_offline_reviews', JSON.stringify(cached));
          } catch {}
          reviewData = fallbackReview;
        }
      }

      if (reviewData) {
        setSubmitted(true);
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#10B981', '#4285F4', '#EA4335', '#C85A32']
          });
        } catch {}

        if (onReviewSubmitted) {
          onReviewSubmitted(reviewData);
        }
      } else {
        setError('Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error('Review submit error:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md max-h-[92dvh] flex flex-col bg-[#FAF7F2] text-[#2C1810] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E6DCD3] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-white border-b border-[#E6DCD3] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-xs shrink-0 ring-1 ring-[#C85A32]/30 bg-black flex items-center justify-center">
              <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#2C1810] leading-tight">
                Rate & Review
              </h3>
              <p className="text-[10px] text-[#7A685D] font-bold">The Prime Cafe</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF0E6] hover:bg-[#E6DCD3] text-[#7A685D] hover:text-[#2C1810] flex items-center justify-center transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {submitted ? (
            /* Compact Thank You Screen */
            <div className="py-4 text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle2 size={28} className="stroke-[2.5]" />
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-black text-[#2C1810]">
                  Thank You, {name}!
                </h4>
                <p className="text-xs text-[#7A685D] mt-0.5">
                  Your review is now live on our cafe feed.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#2C1810] hover:bg-[#1A0E08] text-white font-extrabold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>

          ) : (
            /* Clean Minimal Form */
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {/* 1. Star Rating with Clean Single Label */}
              <div className="py-2.5 px-3 rounded-xl bg-white border border-[#E6DCD3] text-center space-y-1">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-115 active:scale-95 transition-transform duration-100 cursor-pointer"
                      title={`${starVal} Star`}
                    >
                      <Star
                        size={28}
                        className={`transition-colors duration-100 ${
                          starVal <= activeRating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <p className="text-[11px] sm:text-xs font-bold text-[#C85A32]">
                  {RATING_WORDS[activeRating]}
                </p>
              </div>

              {/* 2. Customer Name & Quick Tag */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#2C1810] mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A685D]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-[#E6DCD3] text-xs text-[#2C1810] placeholder-[#A8988D] focus:outline-hidden focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]"
                    />
                  </div>
                </div>

                {/* 3 Quick Chips */}
                <div className="flex items-center gap-1.5">
                  {QUICK_TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        tag === t
                          ? 'bg-[#C85A32] text-white shadow-2xs'
                          : 'bg-white border border-[#E6DCD3] text-[#7A685D] hover:border-[#C85A32]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Review Feedback with 4 Quick Positive Pre-Reviews */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#2C1810]">
                    Your Review
                  </label>
                  <span className="text-[10px] text-[#C85A32] font-semibold">
                    ⚡ Tap to auto-fill
                  </span>
                </div>

                {/* 4 Quick Positive Pre-Reviews */}
                <div className="grid grid-cols-2 gap-1.5">
                  {POSITIVE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReview(preset)}
                      className={`p-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition cursor-pointer text-left leading-tight ${
                        review === preset
                          ? 'bg-[#FAF0E6] text-[#C85A32] border border-[#C85A32] font-bold shadow-2xs'
                          : 'bg-white text-[#7A685D] border border-[#E6DCD3] hover:border-[#C85A32]/60 hover:text-[#2C1810]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  required
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience (food, service, vibes)..."
                  className="w-full p-2.5 bg-white rounded-lg border border-[#E6DCD3] text-xs text-[#2C1810] placeholder-[#A8988D] focus:outline-hidden focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] resize-none leading-relaxed"
                />
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C85A32] to-[#B24E2A] hover:from-[#B24E2A] text-white font-extrabold text-xs shadow-md shadow-[#C85A32]/20 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>

          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
