import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Gift,
  Clock,
  MapPin,
  X,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Lock,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Tag,
  Target,
  Ticket,
  Zap,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// 5 Milestone Configs matching Image 2 exactly
const STAGE_CONFIGS = [
  {
    stageNumber: 1,
    stage: 'Stage 1',
    title: 'Free Regular Coffee',
    originalPrice: '₹120',
    discountedPrice: 'FREE',
    couponCode: 'FREECOFFEE',
    discountType: 'fixed',
    discountValue: 120,
    requiredOrders: 1,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
    description: 'Freshly brewed artisanal espresso with velvet steamed milk.',
    perkHighlight: '100% Free Regular Coffee'
  },
  {
    stageNumber: 2,
    stage: 'Stage 2',
    title: '₹50 OFF on Burgers',
    originalPrice: '₹200',
    discountedPrice: '₹150',
    couponCode: 'BURGER50',
    discountType: 'fixed',
    discountValue: 50,
    requiredOrders: 2,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    description: 'Juicy handcrafted gourmet burger with signature sauce.',
    perkHighlight: 'Instant ₹50 OFF on Burgers'
  },
  {
    stageNumber: 3,
    stage: 'Stage 3',
    title: 'Free Garlic Bread',
    originalPrice: '₹150',
    discountedPrice: 'FREE',
    couponCode: 'FREEGARLIC',
    discountType: 'fixed',
    discountValue: 150,
    requiredOrders: 3,
    image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=500&q=80',
    description: 'Crispy oven-baked baguette with aromatic garlic butter.',
    perkHighlight: '100% Free Garlic Bread'
  },
  {
    stageNumber: 4,
    stage: 'Stage 4',
    title: '₹100 OFF on Pasta',
    originalPrice: '₹250',
    discountedPrice: '₹150',
    couponCode: 'PASTA100',
    discountType: 'fixed',
    discountValue: 100,
    requiredOrders: 4,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80',
    description: 'Italian pasta in rich tomato-basil & melted parmesan.',
    perkHighlight: 'Instant ₹100 OFF on Pasta'
  },
  {
    stageNumber: 5,
    stage: 'Stage 5',
    title: 'Free Dessert',
    originalPrice: '₹180',
    discountedPrice: 'FREE',
    couponCode: 'FREEDESSERT',
    discountType: 'fixed',
    discountValue: 180,
    requiredOrders: 5,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
    description: 'Rich Belgian chocolate cake with glazed cherry topping.',
    perkHighlight: '100% Free Chef Dessert'
  }
];

const LoyaltyRewardHero = () => {
  const { user, isAuthenticated } = useAuth();
  const { applyCouponCode, appliedCoupon } = useCart();
  const scrollContainerRef = useRef(null);
  const cardRefs = useRef({});

  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [steps, setSteps] = useState([]);
  const [stages, setStages] = useState(STAGE_CONFIGS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [claimToast, setClaimToast] = useState(null);
  const [activeStageIndex, setActiveStageIndex] = useState(2); // Default to Stage 3 for demonstration if empty

  // Format short date e.g. "12 Oct"
  const formatShortDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  // Format full date e.g. "12 Oct 2026"
  const formatFullDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Fetch live loyalty status from backend
  const fetchLoyaltyData = useCallback(async () => {
    try {
      setLoading(true);
      let guestOrdersCount = 0;
      try {
        const guestOrders = JSON.parse(sessionStorage.getItem('akc_guest_orders') || '[]');
        guestOrdersCount = Array.isArray(guestOrders) ? guestOrders.length : 0;
      } catch {}

      // Guest claimed rewards from session storage
      let localClaimed = [];
      try {
        localClaimed = JSON.parse(sessionStorage.getItem('akc_claimed_rewards') || '[]');
      } catch {}

      const url = isAuthenticated
        ? '/loyalty/status'
        : `/loyalty/status?guestOrders=${guestOrdersCount}`;

      const res = await api.get(url);

      if (res.data?.success) {
        const data = res.data.data;
        const count = data.totalOrders ?? guestOrdersCount;
        setTotalOrders(count);

        const mergedClaimed = Array.from(
          new Set([...(data.claimedRewards || []), ...localClaimed])
        );
        setClaimedRewards(mergedClaimed);

        if (Array.isArray(data.steps) && data.steps.length > 0) {
          setSteps(data.steps);
        } else {
          // Fallback step calculation
          const now = new Date();
          const fallbackSteps = [1, 2, 3, 4, 5].map((orderNum) => {
            const offsetDays = (orderNum - Math.max(count, 1)) * 6;
            const projected = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
            return {
              id: orderNum,
              label: `Order ${orderNum}`,
              date: formatShortDate(projected),
              status: count >= orderNum ? 'completed' : count === orderNum - 1 ? 'active' : 'locked'
            };
          });
          setSteps(fallbackSteps);
        }

        if (Array.isArray(data.stages) && data.stages.length > 0) {
          setStages(data.stages);
        }
      }
    } catch (err) {
      console.warn('Error fetching loyalty status:', err);
      // Fallback state if server fails or network drop
      setTotalOrders(2);
      setClaimedRewards([1, 2]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  // Determine stage visual status: 'claimed' | 'available' | 'locked'
  const getStageStatus = (stage) => {
    const isClaimed = claimedRewards.includes(stage.stageNumber);
    if (isClaimed) return 'claimed';
    const isEligible = totalOrders >= stage.requiredOrders;
    if (isEligible) return 'available';
    return 'locked';
  };

  // Get milestone date string matching Image 2 style
  const getStageDateText = (stage, status) => {
    if (status === 'claimed') {
      const baseDate = new Date();
      const diffDays = (stage.stageNumber - 3) * 6;
      const d = new Date(baseDate.getTime() + diffDays * 24 * 60 * 60 * 1000);
      return formatFullDate(d);
    }
    return '';
  };

  // Smooth scroll a specific stage card into view (especially useful on mobile)
  const scrollToStage = (stageNum) => {
    setActiveStageIndex(stageNum - 1);
    const cardEl = cardRefs.current[stageNum];
    if (cardEl && scrollContainerRef.current) {
      cardEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Handle claiming a reward
  const handleClaimStage = async (e, stage) => {
    if (e) e.stopPropagation();
    const status = getStageStatus(stage);

    if (status === 'locked') {
      setClaimToast({
        isWarning: true,
        message: `Complete ${stage.requiredOrders - totalOrders} more order to unlock ${stage.title}!`,
        showOrderLink: true
      });
      setTimeout(() => setClaimToast(null), 4500);
      return;
    }

    try {
      // 1. Call backend claim endpoint
      try {
        await api.post('/loyalty/claim', { stageNumber: stage.stageNumber });
      } catch (apiErr) {
        console.warn('Claim API notice:', apiErr);
      }

      // 2. Mark stage as claimed in state & session
      const newClaimed = Array.from(new Set([...claimedRewards, stage.stageNumber]));
      setClaimedRewards(newClaimed);
      try {
        sessionStorage.setItem('akc_claimed_rewards', JSON.stringify(newClaimed));
      } catch {}

      // 3. Apply coupon code directly to cart
      if (stage.couponCode) {
        navigator.clipboard?.writeText(stage.couponCode);
        setCopiedCode(stage.couponCode);
        await applyCouponCode(stage.couponCode);
        setCouponApplied(true);
      }

      // 4. Trigger celebratory confetti
      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#FFFFFF', '#FCD34D', '#D45427']
        });
      } catch {}

      setClaimToast({
        isWarning: false,
        message: `🎉 ${stage.title} Claimed! Coupon code ${stage.couponCode} applied to cart!`,
        showOrderLink: true
      });

      setTimeout(() => setClaimToast(null), 5000);
    } catch (err) {
      console.error('Claim error:', err);
    }
  };

  // Scroll left/right handlers for mobile
  const scrollTrack = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1C1109] via-[#140C07] to-[#0D0704] border border-[#3E2314] shadow-2xl text-white p-3.5 sm:p-6 md:p-7 space-y-4 sm:space-y-6">
      {/* Background warm ambient radial glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Claim Toast Notification */}
      {claimToast && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border-2 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 max-w-full sm:max-w-lg ${
            claimToast.isWarning
              ? 'bg-[#1E120A]/95 border-amber-400 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
              : 'bg-[#0E2015]/95 border-emerald-400 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {claimToast.isWarning ? (
              <AlertTriangle size={18} className="text-amber-400 shrink-0 animate-bounce" />
            ) : (
              <Sparkles size={18} className="text-emerald-400 shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-bold truncate">
              {claimToast.message}
            </p>
          </div>
          {claimToast.showOrderLink && (
            <Link
              to="/order"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 font-black text-xs whitespace-nowrap shadow-md active:scale-95 transition shrink-0"
            >
              Order Now →
            </Link>
          )}
        </div>
      )}

      {/* 1. TOP HEADER & MOTIVATING CAPTION (Matching Image 2) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 shadow-inner">
              <Award size={20} className="stroke-[2.2]" />
            </span>
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-black text-amber-100 tracking-tight">
                Customer Visit Check-In
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-900/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Gift size={15} className="text-neutral-950 stroke-[2.5]" />
              <span>Claim Rewards</span>
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={fetchLoyaltyData}
                disabled={loading}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                title="Refresh loyalty progress"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Motivating Subtitle from Image 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-white/5">
          <p className="text-xs sm:text-sm text-neutral-400 font-medium">
            Complete your purchases and unlock exciting rewards.
          </p>
          <div className="text-[11px] sm:text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{Math.min(totalOrders, 5)} / 5 Completed</span>
          </div>
        </div>
      </div>

      {/* 2. CONNECTED STEPPER TIMELINE (Orders 1 to 5 - Exact Image 2 Style) */}
      <div className="relative pt-1 pb-2 sm:pt-2 sm:pb-3 px-1 sm:px-4">
        {/* Connecting lines between the 5 nodes */}
        <div className="absolute top-[36px] sm:top-[44px] md:top-[48px] left-[10%] right-[10%] -translate-y-1/2 flex pointer-events-none z-0">
          {[1, 2, 3, 4].map((stepIdx) => {
            const isCompletedSegment = totalOrders >= stepIdx + 1;
            const isTransitionSegment = totalOrders === stepIdx;

            return (
              <div key={stepIdx} className="flex-1 flex items-center">
                {isCompletedSegment ? (
                  // Solid green line
                  <div className="w-full h-[2.5px] sm:h-[3px] bg-[#00C888] shadow-[0_0_12px_rgba(0,200,136,0.9)] rounded-full" />
                ) : isTransitionSegment ? (
                  // Transition gradient from green to amber
                  <div className="w-full h-[2.5px] sm:h-[3px] bg-gradient-to-r from-[#00C888] via-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)] rounded-full" />
                ) : (
                  // Dashed golden line
                  <div className="w-full border-t-2 border-dashed border-amber-300/40" />
                )}
              </div>
            );
          })}
        </div>

        {/* The 5 Node Columns */}
        <div className="grid grid-cols-5 relative z-10 gap-1 sm:gap-2">
          {STAGE_CONFIGS.map((stage) => {
            const orderNum = stage.stageNumber;
            const isCompleted = totalOrders >= orderNum;
            const isActiveNext = totalOrders === orderNum - 1;
            const stepInfo = steps.find((s) => s.id === orderNum);

            // Display dynamic date or fallback sequential date
            const dateDisplay = stepInfo?.date || (
              orderNum === 1 ? '12 Oct' :
              orderNum === 2 ? '18 Oct' :
              orderNum === 3 ? '24 Oct' :
              orderNum === 4 ? '31 Oct' : '07 Nov'
            );

            return (
              <div
                key={orderNum}
                onClick={() => scrollToStage(orderNum)}
                className="flex flex-col items-center text-center group cursor-pointer"
                title={`Click to view Stage ${orderNum}: ${stage.title}`}
              >
                {/* Top Label: "Order 1", "Order 2", etc. */}
                <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-amber-200/90 mb-1.5 sm:mb-2 tracking-tight group-hover:text-amber-100 transition truncate max-w-full">
                  Order {orderNum}
                </span>

                {/* Stepper Node Circle */}
                <div className="relative">
                  {isCompleted ? (
                    // Completed: Vibrant Emerald circle with white checkmark
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#00C888] text-white flex items-center justify-center shadow-[0_0_15px_rgba(0,200,136,0.8)] transition-transform duration-200 group-hover:scale-110">
                      <Check size={16} className="sm:w-5 sm:h-5 stroke-[3] text-white" />
                    </div>
                  ) : isActiveNext ? (
                    // Active / Next Target: Glowing Golden Amber circle with white Gift box
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-neutral-950 flex items-center justify-center shadow-[0_0_22px_rgba(245,158,11,0.95)] ring-2 sm:ring-4 ring-amber-500/40 transition-transform duration-200 group-hover:scale-110 animate-pulse">
                      <Gift size={16} className="sm:w-5 sm:h-5 stroke-[2.3] text-neutral-950" />
                    </div>
                  ) : (
                    // Future / Locked: Dark circle with light lock icon
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#20130C] border-2 border-white/20 text-neutral-400 flex items-center justify-center transition-colors duration-200 group-hover:border-amber-400/50">
                      <Lock size={13} className="sm:w-4 sm:h-4 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Bottom Date Label (e.g. 12 Oct, 18 Oct, 24 Oct) */}
                <span className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-semibold text-neutral-400 group-hover:text-amber-200 transition">
                  {dateDisplay}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. THE 5 STAGE CARDS (EXACT DESIGN MATCHING IMAGE 2) */}
      <div className="relative">
        {/* Mobile Left & Right navigation buttons */}
        <div className="flex sm:hidden items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-bold text-neutral-400">
            Swipe to explore all 5 stages →
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollTrack('left')}
              className="p-1 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95"
              title="Previous"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollTrack('right')}
              className="p-1 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95"
              title="Next"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable track for mobile, clean 5-column grid on desktop */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 sm:gap-3.5 pb-2 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible"
        >
          {STAGE_CONFIGS.map((stage, idx) => {
            const status = getStageStatus(stage);
            const isClaimed = status === 'claimed';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';
            const dateText = getStageDateText(stage, status);

            // Active Stage (like Stage 3 in Image 2) gets golden highlight glow
            const isHighlight = isAvailable;

            return (
              <div
                key={stage.stageNumber}
                ref={(el) => (cardRefs.current[stage.stageNumber] = el)}
                onClick={() => setSelectedProduct(stage)}
                className={`relative flex flex-col justify-between rounded-2xl p-2.5 sm:p-3 transition-all duration-300 snap-center shrink-0 w-[160px] min-w-[160px] sm:w-auto sm:min-w-0 cursor-pointer group ${
                  isHighlight
                    ? 'bg-gradient-to-b from-[#2E1A0E] to-[#1E1109] border-2 border-[#F59E0B] shadow-[0_0_30px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50 scale-[1.02]'
                    : isClaimed
                    ? 'bg-[#180E08]/90 border border-emerald-500/50 shadow-md hover:border-emerald-400'
                    : 'bg-[#150D07]/90 border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Card Top: Stage Badge (Pill) */}
                <div className="flex justify-center mb-2">
                  <span
                    className={`text-[11px] font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider transition ${
                      isHighlight
                        ? 'bg-[#FBBF24] text-neutral-950 shadow-md font-extrabold'
                        : isClaimed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 text-neutral-300 border border-white/10'
                    }`}
                  >
                    {stage.stage}
                  </span>
                </div>

                {/* Appetizing Food Image */}
                <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/5">
                  <img
                    src={stage.image}
                    alt={stage.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Status Badge (Matching Image 2) */}
                <div className="my-2 flex justify-center">
                  {isClaimed ? (
                    // ✓ Claimed (Green Pill with Green Border & Checkmark)
                    <div className="w-full py-1 px-2 rounded-full border border-emerald-500/80 bg-emerald-950/40 text-emerald-400 text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs">
                      <Check size={13} className="stroke-[3] text-emerald-400" />
                      <span>Claimed</span>
                    </div>
                  ) : isAvailable ? (
                    // 🎁 Available (Solid Golden Amber Pill with dark text)
                    <div className="w-full py-1 px-2 rounded-full bg-[#FBBF24] text-neutral-950 text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 shadow-md">
                      <Gift size={13} className="stroke-[2.5] text-neutral-950" />
                      <span>Available</span>
                    </div>
                  ) : (
                    // 🔒 Locked (Dark Pill with lock icon)
                    <div className="w-full py-1 px-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1">
                      <Lock size={12} className="text-neutral-400" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>

                {/* Dish / Offer Title */}
                <div className="text-center mb-1 flex-1 flex flex-col justify-center min-h-[36px]">
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight group-hover:text-amber-200 transition line-clamp-2">
                    {stage.title}
                  </h4>
                </div>

                {/* Price Display (Strikethrough Original + Green Discount/FREE) */}
                <div className="text-center mb-2.5 flex items-center justify-center gap-1.5">
                  <span className="line-through text-neutral-400 text-xs font-medium">
                    {stage.originalPrice}
                  </span>
                  <span
                    className={`font-black text-xs sm:text-sm ${
                      stage.discountedPrice === 'FREE'
                        ? 'text-[#00C888]'
                        : isLocked
                        ? 'text-neutral-200'
                        : 'text-[#00C888]'
                    }`}
                  >
                    {stage.discountedPrice}
                  </span>
                </div>

                {/* Card Action / Footer (Claim Now button vs Completed Date vs Locked Requirement) */}
                <div className="mt-auto pt-1">
                  {isClaimed ? (
                    // Claimed: Display Completed Date with calendar icon
                    <div className="py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-semibold text-neutral-300">
                      <Calendar size={12} className="text-neutral-400 shrink-0" />
                      <span>{dateText || 'Claimed'}</span>
                    </div>
                  ) : isAvailable ? (
                    // Available: Solid Orange "Claim Now" Button
                    <button
                      type="button"
                      onClick={(e) => handleClaimStage(e, stage)}
                      className="w-full py-2 px-3 rounded-xl bg-[#D45427] hover:bg-[#B9441D] text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-950/50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Claim Now</span>
                    </button>
                  ) : (
                    // Locked: Dark Pill with dynamic lock icon & concise text
                    <div className="w-full py-1.5 px-1.5 rounded-xl bg-white/5 border border-white/5 text-neutral-400 text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1">
                      <Lock size={10} className="text-amber-400/80 shrink-0" />
                      <span className="truncate">{stage.requiredOrders - totalOrders} more order{stage.requiredOrders - totalOrders > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Page Indicator Dots */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 pt-2">
          {STAGE_CONFIGS.map((stage, idx) => (
            <button
              key={stage.stageNumber}
              type="button"
              onClick={() => scrollToStage(stage.stageNumber)}
              className={`h-1.5 rounded-full transition-all ${
                activeStageIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/20'
              }`}
              title={`Jump to Stage ${stage.stageNumber}`}
            />
          ))}
        </div>
      </div>

      {/* 4. BOTTOM INFO BAR */}
      <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-1 sm:flex sm:items-center sm:justify-between text-[10px] sm:text-xs text-amber-100/90 font-medium text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2">
          <Clock size={14} className="text-amber-400 shrink-0" />
          <span className="truncate">10 AM – 11:30 PM</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2">
          <MapPin size={14} className="text-amber-400 shrink-0" />
          <span className="truncate">Dine-In & Takeaway</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2">
          <ShieldCheck size={14} className="text-amber-400 shrink-0" />
          <span className="truncate">Fresh & Hygienic</span>
        </div>
      </div>

      {/* 5. DEDICATED PRODUCT PREVIEW & CLAIM MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md max-h-[92dvh] flex flex-col bg-gradient-to-b from-[#25150C] via-[#1A0E08] to-[#100804] border border-amber-500/40 text-[#FAF7F2] rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white/80 hover:text-white border border-white/20 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-90"
              title="Close"
            >
              <X size={15} />
            </button>

            {/* Product Image Banner */}
            <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-black/60 shrink-0">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#25150C] via-transparent to-black/30 pointer-events-none" />

              {/* Top Floating Badges with Icons */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles size={11} className="stroke-[2.5]" />
                  <span>{selectedProduct.stage}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                  <Gift size={11} className="stroke-[2.5]" />
                  <span>{selectedProduct.discountedPrice === 'FREE' ? 'FREE DISH' : selectedProduct.discountedPrice}</span>
                </span>
              </div>
            </div>

            {/* Product Information Body */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedProduct.title}
                </h3>
              </div>

              {/* 3-Column Compact Metric Grid with Icons */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-black/40 border border-white/10 text-center">
                {/* Col 1: Value */}
                <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    <Tag size={10} className="text-emerald-400" />
                    <span>Value</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="line-through text-neutral-400 text-[11px]">{selectedProduct.originalPrice}</span>
                    <span className="text-emerald-400 font-black text-xs sm:text-sm">{selectedProduct.discountedPrice}</span>
                  </div>
                </div>

                {/* Col 2: Goal / Need */}
                <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    <Target size={10} className="text-amber-400" />
                    <span>Target</span>
                  </div>
                  <div className="mt-1 font-black text-xs sm:text-sm">
                    {totalOrders >= selectedProduct.requiredOrders ? (
                      <span className="text-emerald-400 flex items-center gap-0.5 text-[11px]">
                        <CheckCircle2 size={12} /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-300">
                        {selectedProduct.requiredOrders - totalOrders} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Col 3: Coupon Code */}
                <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    <Ticket size={10} className="text-orange-400" />
                    <span>Code</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-black text-amber-300 truncate max-w-full px-1">
                    {totalOrders >= selectedProduct.requiredOrders ? (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(selectedProduct.couponCode)}
                        className="hover:underline flex items-center gap-1 text-emerald-400 cursor-pointer"
                        title="Click to copy code"
                      >
                        <span>{selectedProduct.couponCode}</span>
                        {copiedCode === selectedProduct.couponCode ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                    ) : (
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-1 flex items-center gap-2">
                {getStageStatus(selectedProduct) === 'available' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      handleClaimStage(e, selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 font-black text-xs sm:text-sm text-center shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Gift size={14} className="stroke-[2.5]" />
                    <span>Claim Now</span>
                  </button>
                ) : (
                  <Link
                    to="/order"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 font-black text-xs sm:text-sm text-center shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} className="stroke-[2.5]" />
                    <span>Order Now to Unlock</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. OVERALL REWARDS SUMMARY MODAL (When clicking "Claim Rewards" button) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#1C120B] border border-[#3D2314] text-[#FAF7F2] rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-[#23150D] shrink-0">
              <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-base sm:text-lg">
                <Gift size={22} className="text-amber-400 shrink-0" />
                <span>Visit Rewards Roadmap • 5 Exciting Milestones</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#2A180E] border border-amber-400/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-200 block font-bold">Your Live Progress</span>
                  <p className="text-sm font-extrabold text-white mt-0.5">
                    {Math.min(totalOrders, 5)} of 5 Visits Completed
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {totalOrders >= 5 ? 'All 5 Stages Completed 🎉' : `${5 - Math.min(totalOrders, 5)} More to Unlock`}
                </span>
              </div>

              {/* List of 5 Stages */}
              <div className="space-y-3">
                {STAGE_CONFIGS.map((stage) => {
                  const status = getStageStatus(stage);
                  const isClaimed = status === 'claimed';
                  const isAvailable = status === 'available';

                  return (
                    <div
                      key={stage.stageNumber}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isAvailable
                          ? 'bg-[#2E1A0E] border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                          : isClaimed
                          ? 'bg-[#1D130B] border-emerald-500/50'
                          : 'bg-[#150D07] border-white/10 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={stage.image}
                          alt={stage.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-400 uppercase">
                              {stage.stage}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                              {stage.originalPrice} → {stage.discountedPrice}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-sm text-white mt-0.5">
                            {stage.title}
                          </h5>
                          <p className="text-xs text-neutral-400 line-clamp-1">{stage.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isClaimed ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <Check size={13} className="stroke-[3]" /> Claimed
                          </span>
                        ) : isAvailable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              handleClaimStage(e, stage);
                              setIsModalOpen(false);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#D45427] hover:bg-[#B9441D] text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                          >
                            Claim Now
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400 font-semibold px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                            Complete {stage.requiredOrders - totalOrders} more order{stage.requiredOrders - totalOrders > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 p-4 bg-[#23150D] flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LoyaltyRewardHero;
