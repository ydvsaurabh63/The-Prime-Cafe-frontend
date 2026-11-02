import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  Share2,
  ShoppingBag,
  X,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Play,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const INITIAL_LIKES = {
  'prime-cafe': { count: 1842, isLiked: false },
  'coffee': { count: 2194, isLiked: false },
  'burger': { count: 3410, isLiked: false },
  'pizza': { count: 2875, isLiked: false },
  'pasta': { count: 1963, isLiked: false }
};

const InstagramReelsModal = ({ isOpen, initialIndex = 0, reels = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [likesState, setLikesState] = useState(() => {
    try {
      const saved = localStorage.getItem('prime_reels_likes');
      return saved ? JSON.parse(saved) : INITIAL_LIKES;
    } catch {
      return INITIAL_LIKES;
    }
  });
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addedSuccessId, setAddedSuccessId] = useState(null);

  const videoRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const lastTapRef = useRef(0);
  const wheelLockRef = useRef(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Keep index synced when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(true);
      setProgress(0);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // Save likes state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('prime_reels_likes', JSON.stringify(likesState));
    } catch (e) {
      console.warn(e);
    }
  }, [likesState]);

  // Handle current active reel video play / audio
  useEffect(() => {
    if (!isOpen) return;
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = isMuted;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser blocks unmuted autoplay
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }
  }, [currentIndex, isOpen, isMuted]);

  // Progress update listener
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(pct);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2400);
  };

  // Next / Prev Reel navigation
  const goToNextReel = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop back to first reel
      setCurrentIndex(0);
    }
  }, [currentIndex, reels.length]);

  const goToPrevReel = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      // Loop to last reel
      setCurrentIndex(reels.length - 1);
    }
  }, [currentIndex, reels.length]);

  // Single Tap = Play/Pause, Double Tap = Like
  const handleVideoTap = (e) => {
    e.stopPropagation();
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      // Double Tap -> Like!
      handleLikeToggle(true);
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);
    } else {
      // Single Tap -> Play / Pause
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
    lastTapRef.current = now;
  };

  // Like Toggle
  const currentReel = reels[currentIndex];
  const currentReelId = currentReel?.id || 'prime-cafe';
  const currentLikeInfo = likesState[currentReelId] || { count: 1200, isLiked: false };

  const handleLikeToggle = (forceLike = false) => {
    setLikesState((prev) => {
      const existing = prev[currentReelId] || { count: 1200, isLiked: false };
      const willBeLiked = forceLike ? true : !existing.isLiked;

      if (forceLike && existing.isLiked) {
        return prev; // already liked
      }

      return {
        ...prev,
        [currentReelId]: {
          isLiked: willBeLiked,
          count: willBeLiked ? existing.count + 1 : Math.max(0, existing.count - 1)
        }
      };
    });
  };

  // Share Reel
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#reels`;
    const shareTitle = `${currentReel?.title || 'The Prime Cafe'} on The Prime Cafe`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Check out ${currentReel?.title} at The Prime Cafe!`,
          url: shareUrl
        });
        showToast('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    showToast('Reel link copied to clipboard! 📋');
  };

  // Add to Cart ("Add Card")
  const handleAddToCart = (e) => {
    e?.stopPropagation();
    if (!currentReel?.product) return;

    addToCart(currentReel.product, 1);
    setAddedSuccessId(currentReel.id);
    showToast(`Added ${currentReel.product.name} to cart! 🛒`);

    setTimeout(() => {
      setAddedSuccessId(null);
    }, 2000);
  };

  // Direct Order Now
  const handleOrderNow = (e) => {
    e?.stopPropagation();
    if (currentReel?.product) {
      addToCart(currentReel.product, 1);
    }
    onClose();
    navigate('/order');
  };

  // Touch Swipe Handlers (Swipe Up / Down)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    if (diff > 50) {
      // Swipe Up -> Next Reel
      goToNextReel();
    } else if (diff < -50) {
      // Swipe Down -> Prev Reel
      goToPrevReel();
    }
  };

  // Mouse Wheel Navigation (Desktop)
  const handleWheel = (e) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaY) > 30) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        goToNextReel();
      } else {
        goToPrevReel();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    }
  };

  // Keyboard navigation (Arrow keys + Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevReel();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextReel();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        const video = videoRef.current;
        if (video) {
          if (video.paused) video.play().then(() => setIsPlaying(true)).catch(() => {});
          else { video.pause(); setIsPlaying(false); }
        }
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNextReel, goToPrevReel, onClose]);

  if (!isOpen || !currentReel) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200 select-none overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-60 bg-[#C85A32] text-white px-4 py-2 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <Sparkles size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Reels Viewport Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-full sm:h-[94vh] sm:max-h-[860px] sm:max-w-[420px] sm:rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between"
      >
        {/* Background Video */}
        <video
          key={currentReel.id}
          ref={videoRef}
          src={currentReel.videoSrc}
          poster={currentReel.poster}
          playsInline
          loop
          autoPlay
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onClick={handleVideoTap}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        />

        {/* Big Double-Tap Heart Animation */}
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-in zoom-in-50 fade-in duration-200">
            <Heart size={90} className="fill-rose-500 text-rose-500 drop-shadow-2xl animate-pulse" />
          </div>
        )}

        {/* Center Pause Indicator */}
        {!isPlaying && (
          <div
            onClick={handleVideoTap}
            className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 backdrop-blur-[1px] cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl">
              <Play size={28} className="ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Top Header Overlay */}
        <div className="relative z-30 flex items-center justify-between p-4 pt-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Logo & Cafe Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#C85A32] shadow-md bg-black shrink-0">
              <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white leading-tight flex items-center gap-1.5">
                <span>The Prime Café</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </h2>
              <p className="text-[10px] text-white/80 font-medium tracking-wide">
                Reel {currentIndex + 1} of {reels.length} • Swipe ↑
              </p>
            </div>
          </div>

          {/* Top Actions: Mute + Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted((prev) => !prev);
              }}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition active:scale-90 cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition active:scale-90 cursor-pointer"
              title="Close Reels"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Right Action Rail (Instagram Style) */}
        <div className="absolute right-3 bottom-24 sm:bottom-28 z-30 flex flex-col items-center gap-4.5">
          {/* 1. LIKE BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLikeToggle(false);
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-125 shadow-lg border ${
                currentLikeInfo.isLiked
                  ? 'bg-rose-600/90 text-white border-rose-400'
                  : 'bg-black/45 text-white border-white/20 group-hover:bg-black/70'
              }`}
            >
              <Heart
                size={22}
                className={currentLikeInfo.isLiked ? 'fill-white stroke-none' : ''}
              />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {currentLikeInfo.count.toLocaleString()}
            </span>
          </button>

          {/* 2. SHARE BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition active:scale-125 shadow-lg">
              <Share2 size={21} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">Share</span>
          </button>

          {/* 3. ADD TO CART ("ADD CARD") BUTTON */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-125 shadow-lg border ${
                addedSuccessId === currentReel.id
                  ? 'bg-emerald-600 text-white border-emerald-400 scale-110'
                  : 'bg-[#C85A32] text-white border-[#C85A32]/60 hover:bg-[#B24E2A]'
              }`}
            >
              {addedSuccessId === currentReel.id ? (
                <Check size={22} className="stroke-[3]" />
              ) : (
                <ShoppingBag size={21} />
              )}
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow-md">
              {addedSuccessId === currentReel.id ? 'Added!' : '+ Cart'}
            </span>
          </button>
        </div>

        {/* Bottom Content & Dish Order Card (Instagram Reels Style) */}
        <div className="relative z-30 p-4 pb-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12 space-y-3">
          {/* Category & Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C85A32] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                {currentReel.category}
              </span>
              <span className="text-[11px] text-white/70 font-medium">
                Tap video to pause • Double-tap to ❤️
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight drop-shadow-md">
              {currentReel.title}
            </h3>
            <p className="text-xs text-white/80 mt-0.5 line-clamp-2">
              {currentReel.subtitle}
            </p>
          </div>

          {/* Integrated Dish Action Bar (Add to Cart / Order Now) */}
          {currentReel.product && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 flex items-center justify-between gap-2.5 shadow-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black shrink-0 border border-white/20">
                  <img
                    src={currentReel.poster}
                    alt={currentReel.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">
                    {currentReel.product.name}
                  </h4>
                  <p className="text-xs font-black text-amber-300">
                    ₹{currentReel.product.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3 py-2 rounded-xl border border-white/25 transition active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <ShoppingBag size={13} />
                  <span>Add</span>
                </button>

                {/* Direct Order Now Button */}
                <button
                  type="button"
                  onClick={handleOrderNow}
                  className="bg-[#C85A32] hover:bg-[#B24E2A] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>Order</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Video Timeline Progress Bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C85A32] to-amber-400 transition-all duration-100 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Side Navigation Buttons (Next / Prev Arrows) */}
      <div className="hidden sm:flex flex-col gap-3 ml-4 z-40">
        <button
          type="button"
          onClick={goToPrevReel}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition active:scale-90 shadow-xl cursor-pointer"
          title="Previous Reel (Arrow Up)"
        >
          <ChevronUp size={24} />
        </button>

        <button
          type="button"
          onClick={goToNextReel}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition active:scale-90 shadow-xl cursor-pointer"
          title="Next Reel (Arrow Down)"
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  );
};

export default InstagramReelsModal;
