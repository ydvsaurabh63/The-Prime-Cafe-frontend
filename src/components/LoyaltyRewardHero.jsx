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
    <section className="relative overflow-hidden rounded-3xl bg-[#FEF6DB] border border-[#EEDCBA] shadow-sm text-[#2C1810] p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
      {/* Background warm ambient radial glow using the requested butter cream tint */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#FDEFBD]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#FDE293]/50 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Claim Toast Notification */}
      {claimToast && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 flex items-center justify-between gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-2 text-[#2C1810] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 max-w-full sm:max-w-lg ${
            claimToast.isWarning
              ? 'bg-white/95 border-amber-400 text-amber-900 shadow-[0_4px_30px_rgba(245,158,11,0.2)]'
              : 'bg-white/95 border-emerald-500 text-emerald-900 shadow-[0_4px_30px_rgba(16,185,129,0.2)]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {claimToast.isWarning ? (
              <AlertTriangle size={18} className="text-amber-500 shrink-0 animate-bounce" />
            ) : (
              <Sparkles size={18} className="text-emerald-500 shrink-0" />
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

      {/* 1. TOP HEADER & MOTIVATING CAPTION */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="p-1.5 sm:p-2 rounded-xl bg-[#FEF8E3] text-amber-800 border border-[#EEDCBA] shrink-0 shadow-2xs">
              <Award size={18} className="stroke-[2.2]" />
            </span>
            <div>
              <h3 className="text-sm sm:text-lg md:text-xl font-black text-[#2C1810] tracking-tight">
                Customer Visit Check-In
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 text-xs sm:text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Gift size={14} className="text-neutral-950 stroke-[2.5]" />
              <span>Claim Rewards</span>
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={fetchLoyaltyData}
                disabled={loading}
                className="p-1.5 text-[#7A685D] hover:text-[#2C1810] rounded-lg hover:bg-[#EEDCBA]/50 transition cursor-pointer"
                title="Refresh loyalty progress"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-amber-500' : ''} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-[#EEDCBA]">
          <div className="text-[11px] sm:text-xs font-black text-[#C85A32] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
            <span>{Math.min(totalOrders, 5)} / 5 Completed</span>
          </div>
        </div>
      </div>

      {/* 2. CONNECTED STEPPER TIMELINE */}
      <div className="relative pt-0.5 pb-1 sm:pt-1 sm:pb-2 px-1 sm:px-4">
        {/* Connecting lines between the 5 nodes */}
        <div className="absolute top-[32px] sm:top-[38px] md:top-[42px] left-[10%] right-[10%] -translate-y-1/2 flex pointer-events-none z-0">
          {[1, 2, 3, 4].map((stepIdx) => {
            const isCompletedSegment = totalOrders >= stepIdx + 1;
            const isTransitionSegment = totalOrders === stepIdx;

            return (
              <div key={stepIdx} className="flex-1 flex items-center">
                {isCompletedSegment ? (
                  // Solid green line
                  <div className="w-full h-[2.5px] bg-[#00C888] shadow-sm rounded-full" />
                ) : isTransitionSegment ? (
                  // Transition gradient from green to amber
                  <div className="w-full h-[2.5px] bg-gradient-to-r from-[#00C888] via-amber-400 to-amber-500 shadow-sm rounded-full" />
                ) : (
                  // Dashed golden line
                  <div className="w-full border-t-2 border-dashed border-[#E0CCA6]" />
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
                <span className="text-[10px] sm:text-xs font-black text-[#4A2C18] mb-1 sm:mb-1.5 tracking-tight group-hover:text-[#C85A32] transition truncate max-w-full">
                  Order {orderNum}
                </span>

                {/* Stepper Node Circle */}
                <div className="relative">
                  {isCompleted ? (
                    // Completed: Vibrant Emerald circle with white checkmark
                    <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#00C888] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-110">
                      <Check size={14} className="sm:w-4 sm:h-4 stroke-[3] text-white" />
                    </div>
                  ) : isActiveNext ? (
                    // Active / Next Target: Glowing Golden Amber circle with white Gift box
                    <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-neutral-950 flex items-center justify-center shadow-md shadow-amber-500/30 ring-2 sm:ring-3 ring-amber-400/40 transition-transform duration-200 group-hover:scale-110 animate-pulse">
                      <Gift size={14} className="sm:w-4 sm:h-4 stroke-[2.3] text-neutral-950" />
                    </div>
                  ) : (
                    // Future / Locked: Clean white circle with subtle border & lock icon
                    <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white border-2 border-[#EEDCBA] text-[#7A685D] flex items-center justify-center shadow-2xs transition-colors duration-200 group-hover:border-[#C85A32]/60">
                      <Lock size={12} className="sm:w-3.5 sm:h-3.5 text-[#7A685D]" />
                    </div>
                  )}
                </div>

                {/* Bottom Date Label */}
                <span className="mt-1 sm:mt-1.5 text-[9px] sm:text-[11px] font-bold text-[#8C7A6B] group-hover:text-[#2C1810] transition">
                  {dateDisplay}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. THE 5 STAGE CARDS */}
      <div className="relative">
        {/* Mobile Left & Right navigation buttons */}
        <div className="flex sm:hidden items-center justify-between px-1 mb-1.5">
          <span className="text-[11px] font-bold text-[#7A685D]">
            Swipe to explore all 5 stages →
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollTrack('left')}
              className="p-1 rounded-full bg-white border border-[#EEDCBA] text-[#4A2C18] hover:bg-[#FEF8E3] active:scale-95"
              title="Previous"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollTrack('right')}
              className="p-1 rounded-full bg-white border border-[#EEDCBA] text-[#4A2C18] hover:bg-[#FEF8E3] active:scale-95"
              title="Next"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable track for mobile, clean 5-column grid on desktop */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-2 sm:gap-3 pb-1.5 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible"
        >
          {STAGE_CONFIGS.map((stage, idx) => {
            const status = getStageStatus(stage);
            const isClaimed = status === 'claimed';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';
            const dateText = getStageDateText(stage, status);

            const isHighlight = isAvailable;

            return (
              <div
                key={stage.stageNumber}
                ref={(el) => (cardRefs.current[stage.stageNumber] = el)}
                onClick={() => setSelectedProduct(stage)}
                className={`relative flex flex-col justify-between rounded-2xl p-2 sm:p-2.5 transition-all duration-300 snap-center shrink-0 w-[155px] min-w-[155px] sm:w-auto sm:min-w-0 cursor-pointer group ${
                  isHighlight
                    ? 'bg-white border-2 border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.2)] ring-1 ring-amber-300/40 scale-[1.01]'
                    : isClaimed
                    ? 'bg-white border border-emerald-400/80 shadow-xs hover:border-emerald-500'
                    : 'bg-white border border-[#EEDCBA] hover:border-[#C85A32]/50 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Card Top: Stage Badge (Pill) */}
                <div className="flex justify-center mb-1.5">
                  <span
                    className={`text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider transition ${
                      isHighlight
                        ? 'bg-amber-400 text-neutral-950 shadow-xs font-black'
                        : isClaimed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold'
                        : 'bg-[#FEF8E3] text-[#7A685D] border border-[#EEDCBA] font-bold'
                    }`}
                  >
                    {stage.stage}
                  </span>
                </div>

                {/* Appetizing Food Image */}
                <div className="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-[#FEF8E3] shrink-0 border border-[#EEDCBA]/70">
                  <img
                    src={stage.image}
                    alt={stage.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Status Badge */}
                <div className="my-1.5 flex justify-center">
                  {isClaimed ? (
                    <div className="w-full py-1 px-2 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-1 shadow-2xs">
                      <Check size={12} className="stroke-[3] text-emerald-600" />
                      <span>Claimed</span>
                    </div>
                  ) : isAvailable ? (
                    <div className="w-full py-1 px-2 rounded-full bg-amber-400 text-neutral-950 text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-1 shadow-xs">
                      <Gift size={12} className="stroke-[2.5] text-neutral-950" />
                      <span>Available</span>
                    </div>
                  ) : (
                    <div className="w-full py-0.5 px-2 rounded-full bg-[#FEF8E3] border border-[#EEDCBA] text-[#7A685D] text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1">
                      <Lock size={11} className="text-[#7A685D]" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>

                {/* Dish / Offer Title */}
                <div className="text-center mb-1 flex-1 flex flex-col justify-center min-h-[30px]">
                  <h4 className="text-xs sm:text-xs font-black text-[#2C1810] leading-tight group-hover:text-[#C85A32] transition line-clamp-2">
                    {stage.title}
                  </h4>
                </div>

                {/* Price Display */}
                <div className="text-center mb-1.5 flex items-center justify-center gap-1.5">
                  <span className="line-through text-[#9E8E84] text-[11px] font-medium">
                    {stage.originalPrice}
                  </span>
                  <span
                    className={`font-black text-xs ${
                      stage.discountedPrice === 'FREE'
                        ? 'text-emerald-600'
                        : isLocked
                        ? 'text-[#2C1810]'
                        : 'text-emerald-600'
                    }`}
                  >
                    {stage.discountedPrice}
                  </span>
                </div>

                {/* Card Action / Footer */}
                <div className="mt-auto pt-0.5">
                  {isClaimed ? (
                    <div className="py-1 flex items-center justify-center gap-1 text-[10px] font-bold text-[#7A685D]">
                      <Calendar size={11} className="text-[#7A685D] shrink-0" />
                      <span>{dateText || 'Claimed'}</span>
                    </div>
                  ) : isAvailable ? (
                    <button
                      type="button"
                      onClick={(e) => handleClaimStage(e, stage)}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-[#D45427] hover:bg-[#B9441D] text-white font-black text-xs shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Claim Now</span>
                    </button>
                  ) : (
                    <div className="w-full py-1 px-1.5 rounded-xl bg-[#FEF8E3] border border-[#EEDCBA] text-[#7A685D] text-[10px] font-semibold flex items-center justify-center gap-1">
                      <Lock size={10} className="text-[#7A685D] shrink-0" />
                      <span className="truncate">{stage.requiredOrders - totalOrders} more order{stage.requiredOrders - totalOrders > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Page Indicator Dots */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 pt-1.5">
          {STAGE_CONFIGS.map((stage, idx) => (
            <button
              key={stage.stageNumber}
              type="button"
              onClick={() => scrollToStage(stage.stageNumber)}
              className={`h-1.5 rounded-full transition-all ${
                activeStageIndex === idx ? 'w-4 bg-[#C85A32]' : 'w-1.5 bg-[#E0CCA6]'
              }`}
              title={`Jump to Stage ${stage.stageNumber}`}
            />
          ))}
        </div>
      </div>

      {/* 4. BOTTOM INFO BAR */}
      <div className="pt-1.5 border-t border-[#EEDCBA] grid grid-cols-3 gap-1 sm:flex sm:items-center sm:justify-between text-[10px] sm:text-[11px] text-[#7A685D] font-bold text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2">
          <Clock size={13} className="text-[#C85A32] shrink-0" />
          <span className="truncate">10 AM – 11:30 PM</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2">
          <MapPin size={13} className="text-[#C85A32] shrink-0" />
          <span className="truncate">Dine-In & Takeaway</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2">
          <ShieldCheck size={13} className="text-[#C85A32] shrink-0" />
          <span className="truncate">Fresh & Hygienic</span>
        </div>
      </div>

      {/* 5. DEDICATED PRODUCT PREVIEW & CLAIM MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md max-h-[92dvh] flex flex-col bg-[#FFFDF7] border border-[#EEDCBA] text-[#2C1810] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#2C1810] border border-[#EEDCBA] flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-md active:scale-90"
              title="Close"
            >
              <X size={15} />
            </button>

            {/* Product Image Banner */}
            <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-[#FEF8E3] shrink-0 border-b border-[#EEDCBA]">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

              {/* Top Floating Badges with Icons */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-neutral-950 text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles size={11} className="stroke-[2.5]" />
                  <span>{selectedProduct.stage}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                  <Gift size={11} className="stroke-[2.5]" />
                  <span>{selectedProduct.discountedPrice === 'FREE' ? 'FREE DISH' : selectedProduct.discountedPrice}</span>
                </span>
              </div>
            </div>

            {/* Product Information Body */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2C1810] tracking-tight">
                  {selectedProduct.title}
                </h3>
              </div>

              {/* 3-Column Compact Metric Grid with Icons */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#FEF8E3] border border-[#EEDCBA] text-center">
                {/* Col 1: Value */}
                <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white border border-[#EEDCBA]/60 shadow-2xs">
                  <div className="flex items-center gap-1 text-[10px] text-[#7A685D] font-bold uppercase tracking-wider">
                    <Tag size={10} className="text-emerald-600" />
                    <span>Value</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="line-through text-[#9E8E84] text-[11px]">{selectedProduct.originalPrice}</span>
                    <span className="text-emerald-600 font-black text-xs sm:text-sm">{selectedProduct.discountedPrice}</span>
                  </div>
                </div>

                {/* Col 2: Goal / Need */}
                <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white border border-[#EEDCBA]/60 shadow-2xs">
                  <div className="flex items-center gap-1 text-[10px] text-[#7A685D] font-bold uppercase tracking-wider">
                    <Target size={10} className="text-amber-500" />
                    <span>Target</span>
                  </div>
                  <div className="mt-1 font-black text-xs sm:text-sm">
                    {totalOrders >= selectedProduct.requiredOrders ? (
                      <span className="text-emerald-600 flex items-center gap-0.5 text-[11px]">
                        <CheckCircle2 size={12} /> Ready
                      </span>
                    ) : (
                      <span className="text-[#C85A32]">
                        {selectedProduct.requiredOrders - totalOrders} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Col 3: Coupon Code */}
                <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white border border-[#EEDCBA]/60 shadow-2xs">
                  <div className="flex items-center gap-1 text-[10px] text-[#7A685D] font-bold uppercase tracking-wider">
                    <Ticket size={10} className="text-[#C85A32]" />
                    <span>Code</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-black text-[#2C1810] truncate max-w-full px-1">
                    {totalOrders >= selectedProduct.requiredOrders ? (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(selectedProduct.couponCode)}
                        className="hover:underline flex items-center gap-1 text-emerald-600 cursor-pointer"
                        title="Click to copy code"
                      >
                        <span>{selectedProduct.couponCode}</span>
                        {copiedCode === selectedProduct.couponCode ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                    ) : (
                      <span className="text-[#9E8E84] flex items-center gap-1">
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
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 font-black text-xs sm:text-sm text-center shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Gift size={14} className="stroke-[2.5]" />
                    <span>Claim Now</span>
                  </button>
                ) : (
                  <Link
                    to="/order"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#C85A32] hover:bg-[#B34D28] text-white font-black text-xs sm:text-sm text-center shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} className="stroke-[2.5]" />
                    <span>Order Now to Unlock</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="py-2.5 px-4 rounded-xl bg-[#FEF8E3] hover:bg-[#EEDCBA] text-[#4A2C18] border border-[#EEDCBA] font-bold text-xs transition cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#FFFDF7] border border-[#EEDCBA] text-[#2C1810] rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EEDCBA] px-5 sm:px-6 py-4 bg-[#FEF8E3] shrink-0">
              <div className="flex items-center gap-2.5 text-[#2C1810] font-black text-base sm:text-lg">
                <Gift size={22} className="text-[#C85A32] shrink-0" />
                <span>Visit Rewards Roadmap • 5 Exciting Milestones</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#EEDCBA] hover:bg-[#FEF8E3] text-[#7A685D] hover:text-[#2C1810] flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#FEF8E3] border border-[#EEDCBA] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7A685D] block font-bold">Your Live Progress</span>
                  <p className="text-sm font-black text-[#2C1810] mt-0.5">
                    {Math.min(totalOrders, 5)} of 5 Visits Completed
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
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
                          ? 'bg-[#FFFDF7] border-2 border-amber-400 shadow-md ring-1 ring-amber-300/40'
                          : isClaimed
                          ? 'bg-[#FEF8E3] border border-emerald-400/60'
                          : 'bg-white border border-[#EEDCBA] opacity-85'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={stage.image}
                          alt={stage.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#EEDCBA]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#C85A32] uppercase">
                              {stage.stage}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FEF8E3] border border-[#EEDCBA] text-[#7A685D]">
                              {stage.originalPrice} → {stage.discountedPrice}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-sm text-[#2C1810] mt-0.5">
                            {stage.title}
                          </h5>
                          <p className="text-xs text-[#7A685D] line-clamp-1">{stage.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isClaimed ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-2xs">
                            <Check size={13} className="stroke-[3]" /> Claimed
                          </span>
                        ) : isAvailable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              handleClaimStage(e, stage);
                              setIsModalOpen(false);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#D45427] hover:bg-[#B9441D] text-white text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
                          >
                            Claim Now
                          </button>
                        ) : (
                          <span className="text-xs text-[#7A685D] font-semibold px-3 py-1.5 bg-[#FEF8E3] rounded-xl border border-[#EEDCBA]">
                            Complete {stage.requiredOrders - totalOrders} more order{stage.requiredOrders - totalOrders > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#EEDCBA] p-4 bg-[#FEF8E3] flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white hover:bg-[#FEF8E3] border border-[#EEDCBA] text-[#2C1810] text-xs font-bold transition cursor-pointer shadow-xs"
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
