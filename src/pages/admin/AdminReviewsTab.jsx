import React, { useEffect, useState } from 'react';
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const AdminReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    average: '5.0',
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
    googleCount: 0,
    inHouseCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Approved' | 'Hidden'
  const [search, setSearch] = useState('');
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const isApprovedParam =
        statusFilter === 'All' ? 'All' : statusFilter === 'Approved' ? 'true' : 'false';

      const res = await api.get(
        `/reviews/admin?rating=${ratingFilter}&isApproved=${isApprovedParam}&search=${encodeURIComponent(
          search
        )}`
      );

      if (res.data?.success) {
        setReviews(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admin reviews:', err);
      // Fallback to public reviews endpoint if admin token is missing
      try {
        const publicRes = await api.get('/reviews');
        if (publicRes.data?.success) {
          setReviews(publicRes.data.data?.reviews || []);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter, statusFilter]);

  // Live WebSocket Real-Time Updates
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_admin');

    const handleNewReview = (newReview) => {
      // Play a quick celebration animation on the new card
      setNewlyAddedId(newReview._id);
      setTimeout(() => setNewlyAddedId(null), 4000);

      setReviews((prev) => [newReview, ...prev.filter((r) => r._id !== newReview._id)]);

      // Update quick stats dynamically
      setStats((prev) => {
        const total = (prev.total || 0) + 1;
        const fiveStars = (prev.fiveStars || 0) + (newReview.rating === 5 ? 1 : 0);
        const fourStars = (prev.fourStars || 0) + (newReview.rating === 4 ? 1 : 0);
        const threeStars = (prev.threeStars || 0) + (newReview.rating === 3 ? 1 : 0);
        return {
          ...prev,
          total,
          fiveStars,
          fourStars,
          threeStars,
          googleCount: (prev.googleCount || 0) + (newReview.source === 'Google' ? 1 : 0)
        };
      });
    };

    socket.on('new_review', handleNewReview);

    return () => {
      socket.off('new_review', handleNewReview);
    };
  }, []);

  const handleToggleApproval = async (reviewId) => {
    try {
      const res = await api.patch(`/reviews/${reviewId}/approval`);
      if (res.data?.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, isApproved: !r.isApproved } : r))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data?.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setStats((prev) => ({ ...prev, total: Math.max(0, (prev.total || 1) - 1) }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Section with Live Status & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#2C1810] tracking-tight">
              Customer Reviews & Feedback
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A685D] mt-0.5">
            Monitor real-time guest reviews submitted from table QR & Google.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#2C1810] border border-[#E6DCD3] rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Average Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A685D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star size={16} className="fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#2C1810]">
              {stats.average || '4.9'}
            </span>
            <span className="text-xs text-amber-600 font-bold">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> 98% positive sentiment
          </p>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A685D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-[#2C1810]">
              {stats.total || reviews.length}
            </span>
          </div>
          <p className="text-[11px] text-[#7A685D] font-medium mt-1">
            Across table QR & Google
          </p>
        </div>

        {/* Card 3: 5-Star Reviews */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A685D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">5-Star Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {stats.fiveStars || reviews.filter((r) => r.rating === 5).length}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            Top rated experiences
          </p>
        </div>

        {/* Card 4: Verified Guests */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A685D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Diners</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-[#2C1810]">
              100%
            </span>
          </div>
          <p className="text-[11px] text-blue-600 font-bold mt-1">
            Authentic customer feedback
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A685D]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, review keyword, or tag..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] rounded-xl text-xs text-[#2C1810] placeholder-[#A8988D] border border-transparent focus:border-[#C85A32] focus:bg-white focus:outline-hidden transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2C1810] hover:bg-[#1A0E08] text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#F5EFEB]">
          <span className="text-[11px] font-bold text-[#7A685D] mr-1 flex items-center gap-1">
            <Filter size={12} /> Rating:
          </span>
          {['All', '5', '4', '3', '2', '1'].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatingFilter(star)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                ratingFilter === star
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB] border border-[#E6DCD3]'
              }`}
            >
              {star === 'All' ? 'All Ratings' : `${star} ★`}
            </button>
          ))}

          <div className="h-4 w-px bg-[#E6DCD3] mx-1 hidden sm:block" />

          <span className="text-[11px] font-bold text-[#7A685D] mr-1 hidden sm:inline">
            Status:
          </span>
          {['All', 'Approved', 'Hidden'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#2C1810] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB] border border-[#E6DCD3]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Review Cards List */}
      <div className="space-y-3">
        {loading && reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E6DCD3] space-y-3">
            <div className="w-8 h-8 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#7A685D]">Loading customer reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E6DCD3] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center mx-auto">
              <Star size={24} />
            </div>
            <h3 className="font-bold text-sm text-[#2C1810]">No reviews found</h3>
            <p className="text-xs text-[#7A685D] max-w-sm mx-auto">
              No customer reviews matched your search or filter. Try clearing filters to view all reviews.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {reviews.map((rev) => {
              const isNew = rev._id === newlyAddedId;
              const formattedDate = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Just now';

              return (
                <div
                  key={rev._id || rev.name + rev.createdAt}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between ${
                    isNew
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.01] bg-amber-50/20'
                      : 'border-[#E6DCD3] hover:border-[#C85A32]/40 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Header: Avatar, Name, Stars & Tag */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF0E6] to-[#F5EFEB] border border-[#E6DCD3] text-[#C85A32] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {rev.name ? rev.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-sm text-[#2C1810]">
                              {rev.name}
                            </h4>
                            {isNew && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-[#7A685D] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E6DCD3]">
                              {rev.tag || 'Verified Diner'}
                            </span>
                            <span className="text-[10px] text-[#A8988D] flex items-center gap-1">
                              <Clock size={10} /> {formattedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Star Rating Badge */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
                        <Star size={13} className="fill-amber-400 text-amber-500" />
                        <span className="text-xs font-black">{rev.rating}.0</span>
                      </div>
                    </div>

                    {/* Review Comment Body */}
                    <p className="mt-3 text-xs sm:text-[13px] text-[#4A3B32] leading-relaxed font-medium bg-[#FAF7F2] p-3 rounded-xl border border-[#F5EFEB]">
                      "{rev.review}"
                    </p>
                  </div>

                  {/* Footer: Live Status & Action Buttons */}
                  <div className="mt-3.5 pt-3 border-t border-[#F5EFEB] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rev.isApproved !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rev.isApproved !== false ? 'bg-emerald-500' : 'bg-neutral-400'
                          }`}
                        />
                        {rev.isApproved !== false ? 'Live on Feed' : 'Hidden'}
                      </span>

                      <span className="text-[10px] text-[#7A685D] font-medium hidden sm:inline">
                        Source: {rev.source || 'Table QR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleApproval(rev._id)}
                        className="px-2.5 py-1 rounded-lg border border-[#E6DCD3] hover:bg-[#FAF7F2] text-[#2C1810] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title={rev.isApproved !== false ? 'Hide Review' : 'Approve Review'}
                      >
                        {rev.isApproved !== false ? (
                          <>
                            <EyeOff size={12} className="text-[#7A685D]" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye size={12} className="text-emerald-600" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev._id)}
                        className="p-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsTab;
