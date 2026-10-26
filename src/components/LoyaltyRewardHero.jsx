import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Coffee,
  Utensils,
  Pizza,
  Crown,
  Gift,
  Clock,
  MapPin,
  X,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Lock,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// 5 Check-In Order Milestones: Order 1 (10% OFF), Order 3 (Free Coffee), Order 5 (Free Fried Rice)
const CHECKIN_MILESTONES = [
  {
    visitNumber: 1,
    title: '10% OFF Welcome Feast',
    productName: '10% OFF All Cafe Favorites',
    subLabel: '10% OFF',
    discountBadge: '10% OFF',
    couponCode: 'PRIME10',
    image: '/assets/welcome_discount.jpg',
    description: 'Enjoy a flat 10% discount across our entire cafe menu on your 1st order!',
    perkHighlight: 'Instant 10% OFF on Pizza, Burgers, Fries & Drinks'
  },
  {
    visitNumber: 2,
    title: 'Stamp #2',
    productName: 'Loyalty Stamp #2',
    subLabel: 'Stamp',
    discountBadge: null,
    couponCode: null,
    image: null,
    description: 'Collect your 2nd visit stamp.'
  },
  {
    visitNumber: 3,
    title: 'Free Artisan Coffee',
    productName: 'Artisan Hot Brewed Cappuccino',
    subLabel: 'Free Coffee',
    discountBadge: 'Free Coffee',
    couponCode: 'FREECOFFEE',
    image: '/assets/cappuccino.jpg',
    description: 'Complimentary rich handcrafted espresso with steamed milk & frothy crema on your 3rd order!',
    perkHighlight: '100% Free Artisan Coffee with zero minimum order'
  },
  {
    visitNumber: 4,
    title: 'Stamp #4',
    productName: 'Loyalty Stamp #4',
    subLabel: 'Stamp',
    discountBadge: null,
    couponCode: null,
    image: null,
    description: 'Collect your 4th visit stamp.'
  },
  {
    visitNumber: 5,
    title: 'Free Gourmet Fried Rice',
    productName: 'Wok-Tossed Gourmet Fried Rice',
    subLabel: 'Free Fried Rice',
    discountBadge: 'Free Fried Rice',
    couponCode: 'FREEFRIEDRICE',
    image: '/assets/fried_rice.jpg',
    description: 'Complimentary sizzling wok-tossed fried rice with farm-fresh veggies & aromatic seasonings on your 5th order!',
    perkHighlight: '100% Free Fried Rice Plate with zero minimum order'
  }
];

const getMilestoneIcon = (visitNum) => {
  if (visitNum === 1) return Sparkles;
  if (visitNum === 3) return Coffee;
  if (visitNum === 5) return Utensils;
  if (visitNum === 7) return Pizza;
  if (visitNum === 10) return Crown;
  return null;
};

const LoyaltyRewardHero = () => {
  const videoRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const { applyCouponCode, appliedCoupon } = useCart();

  const [loading, setLoading] = useState(false);
  const [checkInCount, setCheckInCount] = useState(0);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeReward, setActiveReward] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [claimToast, setClaimToast] = useState(null);

  // Auto-play video safely with muted setting
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Fetch real customer orders dynamically (per authenticated user or guest)
  const fetchCustomerData = useCallback(async () => {
    if (!isAuthenticated) {
      // For guest visitors, check session-stored guest orders or default to 0
      try {
        const guestOrders = JSON.parse(sessionStorage.getItem('akc_guest_orders') || '[]');
        setCheckInCount(Array.isArray(guestOrders) ? guestOrders.length : 0);
      } catch {
        setCheckInCount(0);
      }
      setCustomerOrders([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/orders/my');
      if (res.data?.success) {
        const orders = res.data.data || [];
        setCustomerOrders(orders);
        // Valid visits: placed/paid/served/preparing orders (excluding cancelled/rejected)
        const validOrders = orders.filter(
          (o) => !['Cancelled', 'Rejected'].includes(o.orderStatus)
        );
        setCheckInCount(validOrders.length);
      }
    } catch (err) {
      console.warn('Error fetching customer orders for check-in:', err);
      setCheckInCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  // Handle reward claiming / copying
  const handleRewardClick = (milestone) => {
    setActiveReward(milestone);
    setIsModalOpen(true);
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleApplyCoupon = async (code) => {
    if (!code) return;
    try {
      const res = await applyCouponCode(code);
      if (res.success) {
        setCouponApplied(true);
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#C85A32', '#10B981', '#FFFFFF']
          });
        } catch {
          // ignore confetti errors
        }
      }
    } catch (e) {
      console.warn('Coupon apply error:', e);
    }
  };

  // Direct Claim & Product Preview from timeline node or badge click
  const handleClaimOffer = async (e, milestone) => {
    if (e) e.stopPropagation();
    if (!milestone) return;

    // 1. Immediately open the interactive product image popup so customer can view dish
    if (milestone.image || milestone.couponCode) {
      setSelectedProduct(milestone);
    }

    // 2. Validate order completion: customer must complete required visit before claiming
    const isOrderCompleted = checkInCount >= milestone.visitNumber;

    if (!isOrderCompleted) {
      setClaimToast({
        isWarning: true,
        message: 'first complete your order then claim offer',
        showOrderLink: true
      });

      setTimeout(() => {
        setClaimToast(null);
      }, 4500);

      return;
    }

    if (!milestone?.couponCode) return;

    // 3. If order is completed, allow claiming & apply to cart
    navigator.clipboard?.writeText(milestone.couponCode);
    setCopiedCode(milestone.couponCode);

    try {
      await applyCouponCode(milestone.couponCode);
      setCouponApplied(true);
    } catch (err) {
      console.warn('Coupon apply error:', err);
    }

    try {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#FFFFFF', '#FCD34D']
      });
    } catch {}

    setClaimToast({
      isWarning: false,
      badge: milestone.discountBadge,
      code: milestone.couponCode,
      message: `🎉 ${milestone.discountBadge} Claimed! Code ${milestone.couponCode} applied to cart!`,
      showOrderLink: true
    });

    setTimeout(() => {
      setClaimToast(null);
    }, 4500);
  };

  // Fixed 5 Order Milestones (Orders 1 to 5 matching Image 2)
  const currentMilestones = CHECKIN_MILESTONES.slice(0, 5);

  // Get date for milestone (matching Image 2 date display e.g. "12 Oct", "18 Oct", "24 Oct")
  const getMilestoneDate = (visitNum) => {
    const order = customerOrders[visitNum - 1];
    if (order && order.createdAt) {
      const d = new Date(order.createdAt);
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }

    // Sequential realistic date display matching Image 2 timeline (spaced ~6 days apart)
    const baseDate = new Date();
    const diffDays = (visitNum - Math.max(1, Math.min(checkInCount, 10))) * 6;
    const calcDate = new Date(baseDate.getTime() + diffDays * 24 * 60 * 60 * 1000);
    return calcDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-black shadow-2xl border border-white/15 min-h-[360px] sm:min-h-[420px] md:min-h-[460px] flex flex-col justify-between">
      {/* 1. BACKGROUND VIDEO LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-90"
        >
          <source src="/assets/gemini_generated_video_caa8d77b.mp4" type="video/mp4" />
          <source src="/assets/burger-animation.mp4" type="video/mp4" />
        </video>
        {/* Transparent cinematic vignette with dark center protection so video and text are both clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/65 pointer-events-none" />
      </div>

      {/* 2. FOREGROUND CONTENT: Sleek Timeline Stepper Matching Image 2 */}
      <div className="relative z-10 p-2.5 sm:p-5 md:p-6 flex flex-col justify-between flex-1 gap-3 sm:gap-4">
        {/* Floating Claim Toast Notification */}
        {claimToast && (
          <div
            className={`absolute top-2 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-40 flex items-center justify-between sm:justify-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full border-2 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 max-w-full sm:max-w-md ${
              claimToast.isWarning
                ? 'bg-neutral-950/95 border-amber-400 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                : 'bg-neutral-950/95 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.6)]'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {claimToast.isWarning ? (
                <AlertTriangle size={15} className="text-amber-400 shrink-0 animate-bounce" />
              ) : (
                <Sparkles size={15} className="text-emerald-400 shrink-0 animate-spin-slow" />
              )}
              <div className="text-[11px] sm:text-xs truncate">
                {claimToast.isWarning ? (
                  <span className="font-extrabold text-amber-300">
                    ⚠️ {claimToast.message}
                  </span>
                ) : (
                  <>
                    <span className="font-extrabold text-emerald-400">🎉 {claimToast.badge} Claimed! </span>
                    <span className="text-neutral-200 hidden sm:inline">
                      Code <span className="font-mono font-black text-amber-300 bg-white/10 px-1.5 py-0.5 rounded">{claimToast.code}</span> applied!
                    </span>
                  </>
                )}
              </div>
            </div>
            {claimToast.showOrderLink && (
              <Link
                to="/order"
                className="ml-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 font-black text-[10px] whitespace-nowrap shadow-xs active:scale-95 transition shrink-0"
              >
                Order Now →
              </Link>
            )}
          </div>
        )}

        {/* THE CHECK-IN CARD (Transparent Background) */}
        <div className="bg-transparent space-y-3 sm:space-y-5 text-white">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-3 border-b border-white/10 pb-2.5 sm:pb-3.5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 shadow-inner">
                <Award size={18} className="sm:w-[22px] sm:h-[22px] stroke-[2.2]" />
              </span>
              <div>
                <h3 className="text-sm sm:text-lg md:text-xl font-extrabold text-amber-100 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  Customer Visit Check-In
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-end shrink-0">
              {/* SINGLE "CLAIM MORE REWARDS" BUTTON */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 text-[10px] sm:text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Gift size={12} className="sm:w-[14px] sm:h-[14px] text-neutral-950 stroke-[2.5]" />
                <span>Claim Rewards</span>
              </button>
            </div>
          </div>

          {/* Visit Roadmap Header & Status */}
          <div className="flex items-center justify-between pt-0.5">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-200/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              Visit Roadmap (Orders 1 to 5)
            </h4>

            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-extrabold text-amber-400 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                {Math.min(checkInCount, 5)} / 5 Completed
              </span>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={fetchCustomerData}
                  disabled={loading}
                  className="text-neutral-400 hover:text-white p-1 transition cursor-pointer"
                  title="Refresh status"
                >
                  <RefreshCw size={11} className={loading ? 'animate-spin text-amber-400' : ''} />
                </button>
              )}
            </div>
          </div>

          {/* CONNECTED HORIZONTAL STEPPER TIMELINE (Matching Image 2 Style) */}
          <div className="relative py-2 sm:py-4 px-0.5 sm:px-2">
            {/* Connecting lines between the 5 nodes */}
            <div className="absolute top-[34px] sm:top-[44px] md:top-[48px] left-[10%] right-[10%] -translate-y-1/2 flex pointer-events-none z-0">
              {currentMilestones.slice(0, 4).map((m, i) => {
                const nextM = currentMilestones[i + 1];
                const num1 = m.visitNumber;
                const num2 = nextM.visitNumber;
                const isSegmentDone = checkInCount >= num2;
                const isSegmentActive = checkInCount >= num1 && checkInCount < num2;

                return (
                  <div key={i} className="flex-1 flex items-center">
                    {isSegmentDone ? (
                      <div className="w-full h-[2.5px] sm:h-[3px] bg-[#00C888] shadow-[0_0_12px_rgba(0,200,136,0.9)] rounded-full" />
                    ) : isSegmentActive ? (
                      <div className="w-full h-[2.5px] sm:h-[3px] bg-gradient-to-r from-[#00C888] via-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)] rounded-full" />
                    ) : (
                      <div className="w-full border-t-2 border-dashed border-amber-300/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* The 5 Node Columns */}
            <div className="grid grid-cols-5 relative z-10 gap-0.5 sm:gap-1">
              {currentMilestones.map((m) => {
                const visitNum = m.visitNumber;
                const isDone = checkInCount >= visitNum;
                const isCurrentNext = checkInCount + 1 === visitNum;
                const dateStr = getMilestoneDate(visitNum);

                return (
                  <div
                    key={visitNum}
                    onClick={() => (m.couponCode || m.image ? handleClaimOffer(null, m) : null)}
                    className={`flex flex-col items-center text-center group min-w-0 ${
                      m.couponCode || m.image ? 'cursor-pointer' : ''
                    }`}
                    title={m.productName ? `Click to view ${m.productName} preview and claim` : undefined}
                  >
                    {/* Top Label: "Order 1", "Order 2", etc. (Image 2 style) - light amber for clear visibility */}
                    <span className="text-[10px] sm:text-xs md:text-sm font-extrabold text-amber-200 mb-1.5 sm:mb-2.5 tracking-tight group-hover:text-amber-100 transition truncate max-w-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      Order {visitNum}
                    </span>

                    {/* Stepper Node Circle */}
                    <div className="relative">
                      {isDone ? (
                        // Completed: Vibrant Emerald circle with white checkmark
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#00C888] text-white flex items-center justify-center shadow-[0_0_15px_rgba(0,200,136,0.75)] transition-transform duration-200 group-hover:scale-110">
                          <Check size={16} className="sm:w-5 sm:h-5 stroke-[3] text-white" />
                        </div>
                      ) : isCurrentNext ? (
                        // Active / Next Reward: Golden Amber circle with Gift box icon
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.9)] ring-2 sm:ring-4 ring-amber-500/30 transition-transform duration-200 group-hover:scale-110 animate-pulse">
                          <Gift size={16} className="sm:w-5 sm:h-5 stroke-[2.2] text-neutral-950" />
                        </div>
                      ) : (
                        // Future / Locked: Dark circle with Lock icon and light golden-amber border
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-black/75 border-2 border-amber-200/80 text-amber-200 flex items-center justify-center backdrop-blur-xs transition-colors duration-200 group-hover:border-amber-300 shadow-[0_0_12px_rgba(253,230,138,0.25)]">
                          <Lock size={12} className="sm:w-4 sm:h-4 text-amber-200" />
                        </div>
                      )}
                    </div>

                    {/* Bottom Label: Date (Image 2 style) + Interactive Click-to-Claim Pill */}
                    <div className="mt-1.5 sm:mt-2.5 flex flex-col items-center w-full max-w-[66px] sm:max-w-none">
                      <span className="text-[9px] sm:text-[11px] md:text-xs font-semibold text-neutral-300 group-hover:text-amber-200 transition drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                        {dateStr}
                      </span>
                      {m.discountBadge && (
                        <button
                          type="button"
                          onClick={(e) => handleClaimOffer(e, m)}
                          className={`mt-1 sm:mt-1.5 px-1 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-tight transition-all duration-200 cursor-pointer flex items-center justify-center gap-0.5 sm:gap-1 shadow-sm w-full max-w-[62px] sm:max-w-none ${
                            appliedCoupon?.code === m.couponCode
                              ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.8)] scale-105 ring-1 sm:ring-2 ring-emerald-400/50'
                              : isDone || isCurrentNext
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 shadow-[0_0_14px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 animate-pulse'
                              : 'bg-white/10 hover:bg-white/20 text-neutral-300 border border-white/15 hover:border-amber-400/40'
                          }`}
                          title={`Click to view image and claim ${m.discountBadge} (${m.couponCode})`}
                        >
                          <span className="truncate">
                            {m.visitNumber === 1 ? (
                              '10% OFF'
                            ) : m.visitNumber === 3 ? (
                              <>
                                <span className="sm:hidden">Coffee ☕</span>
                                <span className="hidden sm:inline">Free Coffee</span>
                              </>
                            ) : m.visitNumber === 5 ? (
                              <>
                                <span className="sm:hidden">Rice 🍚</span>
                                <span className="hidden sm:inline">Free Fried Rice</span>
                              </>
                            ) : (
                              m.discountBadge
                            )}
                          </span>
                          <span className="text-[7px] sm:text-[8px] font-black opacity-95 shrink-0">
                            {appliedCoupon?.code === m.couponCode ? '✓' : '✨'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM INFO BAR */}
        <div className="pt-2 grid grid-cols-3 gap-1 sm:flex sm:items-center sm:justify-between text-[10px] sm:text-xs text-amber-100/90 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)] text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2">
            <Clock size={13} className="sm:w-[15px] sm:h-[15px] text-amber-400 shrink-0" />
            <span className="truncate max-w-full">10 AM – 11:30 PM</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2">
            <MapPin size={13} className="sm:w-[15px] sm:h-[15px] text-amber-400 shrink-0" />
            <span className="truncate max-w-full">Dine-In & Takeaway</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2">
            <ShieldCheck size={13} className="sm:w-[15px] sm:h-[15px] text-amber-400 shrink-0" />
            <span className="truncate max-w-full">Fresh & Hygienic</span>
          </div>
        </div>
      </div>

      {/* REWARD MODAL (When clicking "Claim More Rewards" or a completed card) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#1C120B] border border-[#3D2314] text-[#FAF7F2] rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-[#23150D] shrink-0">
              <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-base sm:text-lg">
                <Gift size={22} className="text-amber-400 shrink-0" />
                <span>Customer Visit Rewards • Claim Promo Codes</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#2A180E] border border-amber-400/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-200 block font-bold">Your Live Progress</span>
                  <p className="text-sm font-extrabold text-white mt-0.5">
                    {Math.min(checkInCount, 5)} of 5 Visits Completed
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {checkInCount >= 5 ? 'All Rewards Unlocked 🎉' : `${5 - Math.min(checkInCount, 5)} More to Unlock`}
                </span>
              </div>

              {/* List of Milestone Rewards (Orders 1 to 5) */}
              <div className="space-y-3">
                {currentMilestones.filter((m) => m.couponCode).map((milestone) => {
                  const isUnlocked = checkInCount >= milestone.visitNumber;
                  const Icon = getMilestoneIcon(milestone.visitNumber);

                  return (
                    <div
                      key={milestone.visitNumber}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isUnlocked
                          ? 'bg-[#25150C] border-emerald-500/50 shadow-md'
                          : 'bg-[#150D08] border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {milestone.image ? (
                          <div
                            onClick={() => setSelectedProduct(milestone)}
                            className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-amber-500/40 shadow-md cursor-pointer group/img"
                            title="Click to view product image"
                          >
                            <img
                              src={milestone.image}
                              alt={milestone.productName || milestone.title}
                              className="w-full h-full object-cover transition duration-300 group-hover/img:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition" />
                          </div>
                        ) : (
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              isUnlocked
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/10 text-stone-400'
                            }`}
                          >
                            {Icon ? <Icon size={20} /> : <Gift size={20} />}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                              Visit #{milestone.visitNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isUnlocked
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-stone-800 text-stone-400'
                              }`}
                            >
                              {milestone.discountBadge}
                            </span>
                          </div>
                          <h5
                            onClick={() => setSelectedProduct(milestone)}
                            className="font-extrabold text-sm text-white mt-0.5 hover:text-amber-300 transition cursor-pointer"
                          >
                            {milestone.productName || milestone.title}
                          </h5>
                          <p className="text-xs text-[#D8CBC1] mt-0.5 line-clamp-2">{milestone.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        {milestone.image && (
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(milestone)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-bold transition cursor-pointer"
                            title="View product image"
                          >
                            View Dish 🔍
                          </button>
                        )}
                        {isUnlocked ? (
                          <>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold">
                              <span>{milestone.couponCode}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(milestone.couponCode)}
                                className="p-0.5 hover:text-white"
                                title="Copy Coupon Code"
                              >
                                {copiedCode === milestone.couponCode ? (
                                  <Check size={13} className="text-emerald-400" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(milestone.couponCode)}
                              className="px-3 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                            >
                              Apply to Cart
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-stone-400 font-semibold px-3 py-1 bg-white/5 rounded-xl border border-white/5">
                            Requires {milestone.visitNumber - checkInCount} more visit
                            {milestone.visitNumber - checkInCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
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

      {/* 5. DEDICATED PRODUCT PREVIEW & CLAIM MODAL (Triggered on click of node / badge / dish) */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-md max-h-[92dvh] flex flex-col bg-gradient-to-b from-[#23150D] via-[#1A0E08] to-[#100905] border-2 border-amber-500/50 text-[#FAF7F2] rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/95 text-white/80 hover:text-white border border-white/20 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-90"
              title="Close Preview"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Product Image Banner with Overlays */}
            {selectedProduct.image && (
              <div className="relative w-full h-40 sm:h-52 md:h-60 overflow-hidden bg-black/60 shrink-0">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.productName || selectedProduct.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                {/* Gradient vignette so image blends seamlessly into card */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#23150D] via-transparent to-black/40 pointer-events-none" />

                {/* Floating Highlight Badges */}
                <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500 text-neutral-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.9)] flex items-center gap-1">
                    <Sparkles size={11} className="sm:w-[13px] sm:h-[13px] fill-neutral-950" />
                    <span>Order #{selectedProduct.visitNumber} Reward</span>
                  </span>
                  {selectedProduct.discountBadge && (
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500 text-white text-[10px] sm:text-xs font-black shadow-md">
                      {selectedProduct.discountBadge}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Product Information Body (Scrollable for mobile screens) */}
            <div className="p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-amber-400 uppercase tracking-widest">
                  <Award size={13} className="sm:w-[15px] sm:h-[15px]" />
                  <span>Customer Visit #{selectedProduct.visitNumber} Milestone</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-white mt-0.5 sm:mt-1 tracking-tight">
                  {selectedProduct.productName || selectedProduct.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  {selectedProduct.description}
                </p>
                {selectedProduct.perkHighlight && (
                  <p className="text-[11px] sm:text-xs font-bold text-amber-300/90 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="sm:w-[15px] sm:h-[15px] text-emerald-400 shrink-0" />
                    <span>{selectedProduct.perkHighlight}</span>
                  </p>
                )}
              </div>

              {/* Promo Code Box: Unlocked vs Locked */}
              {selectedProduct.couponCode && (
                checkInCount >= selectedProduct.visitNumber ? (
                  /* UNLOCKED: Customer has completed required order */
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/50 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-inner">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">
                        Promo Coupon Code
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-sm sm:text-base md:text-lg font-black text-amber-300 tracking-wider">
                          {selectedProduct.couponCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(selectedProduct.couponCode)}
                          className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                          title="Copy code"
                        >
                          {copiedCode === selectedProduct.couponCode ? (
                            <Check size={14} className="sm:w-4 sm:h-4 text-emerald-400" />
                          ) : (
                            <Copy size={14} className="sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(selectedProduct.couponCode)}
                        className={`w-full sm:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                          appliedCoupon?.code === selectedProduct.couponCode || couponApplied
                            ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] ring-2 ring-emerald-400/50'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                        }`}
                      >
                        {appliedCoupon?.code === selectedProduct.couponCode || couponApplied ? (
                          <>
                            <Check size={13} className="sm:w-[14px] sm:h-[14px] stroke-[3]" />
                            <span>Applied to Cart</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} className="sm:w-[14px] sm:h-[14px] stroke-[2.5]" />
                            <span>Claim & Apply</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* LOCKED: Customer has not completed the required order yet */
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-950/70 border border-amber-500/50 space-y-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-amber-300 font-extrabold text-xs sm:text-sm">
                      <AlertTriangle size={15} className="sm:w-[17px] sm:h-[17px] text-amber-400 shrink-0 animate-pulse" />
                      <span>first complete your order then claim offer</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed">
                      Yeh reward claim karne ke liye pehle Order #{selectedProduct.visitNumber} complete karein. Aapka live progress: {Math.min(checkInCount, 5)}/5 orders.
                    </p>
                    <div className="pt-0.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <span className="font-mono text-[11px] sm:text-xs text-neutral-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-center sm:text-left">
                        Code: ••••••••• (Locked)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setClaimToast({
                            isWarning: true,
                            message: 'first complete your order then claim offer',
                            showOrderLink: true
                          });
                          setTimeout(() => setClaimToast(null), 4500);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Click to check requirement"
                      >
                        <Lock size={12} className="text-amber-400" />
                        <span>Claim Offer</span>
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Action Buttons: Order Now & Close */}
              <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Link
                  to="/order"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-xs sm:text-sm text-center shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span>
                    {checkInCount >= selectedProduct.visitNumber
                      ? 'Order Now & Enjoy'
                      : 'Complete Order to Unlock →'}
                  </span>
                  <ArrowRight size={14} className="sm:w-4 sm:h-4 stroke-[3]" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white font-bold text-xs transition cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LoyaltyRewardHero;
