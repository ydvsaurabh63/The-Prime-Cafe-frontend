import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Sparkles,
  Film,
  ArrowRight,
  Flame,
  ChevronLeft,
  ChevronRight,
  Utensils
} from 'lucide-react';

const REELS_DATA = [
  {
    id: 'coffee',
    title: 'Double Shot Espresso & Crema',
    category: 'Coffee & Brews',
    tag: 'Barista Special',
    price: '₹120',
    videoSrc: '/assets/reels/reel_coffee.mp4',
    poster: '/assets/reels/poster_coffee.jpg',
    description: 'Freshly ground arabica beans extracted with velvety crema and silky steamed milk foam.',
    link: '/menu'
  },
  {
    id: 'burger',
    title: 'Sizzling Smash Patty Burger',
    category: 'Burgers & Grills',
    tag: 'Trending Now',
    price: '₹180',
    videoSrc: '/assets/reels/reel_burger.mp4',
    poster: '/assets/reels/poster_burger.jpg',
    description: 'Crisp seared juicy patties with melted aged cheddar, secret relish & butter toasted brioche.',
    link: '/menu'
  },
  {
    id: 'pizza',
    title: 'Wood-Fired Margherita Basil',
    category: 'Gourmet Pizzas',
    tag: 'Chef Choice',
    price: '₹260',
    videoSrc: '/assets/reels/reel_pizza.mp4',
    poster: '/assets/reels/poster_pizza.jpg',
    description: 'Hand-tossed sourdough crust topped with San Marzano tomatoes, fresh mozzarella & sweet basil.',
    link: '/menu'
  },
  {
    id: 'pasta',
    title: 'Creamy Italian Alfredo Toss',
    category: 'Pastas & Bowls',
    tag: 'Best Seller',
    price: '₹210',
    videoSrc: '/assets/reels/reel_pasta.mp4',
    poster: '/assets/reels/poster_pasta.jpg',
    description: 'Al dente spaghetti tossed in parmesan rich garlic cream with aromatic herbs.',
    link: '/menu'
  }
];

const ReelCard = ({ reel, index, onOpenModal }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start playing muted automatically
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      onClick={() => onOpenModal(index)}
      className="group relative aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-[#E6DCD3] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        poster={reel.poster}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      >
        <source src={reel.videoSrc} type="video/mp4" />
      </video>

      {/* Top Overlay: Category / Tag & Mute Button */}
      <div className="relative z-10 p-2.5 sm:p-3.5 flex items-center justify-between bg-gradient-to-b from-black/75 via-black/30 to-transparent">
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-xs">
          <Flame size={11} className="text-amber-400 fill-amber-400" />
          {reel.tag}
        </span>

        <button
          type="button"
          onClick={toggleMute}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/10"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
      </div>

      {/* Center Play Indicator when paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-15 bg-black/30 backdrop-blur-[1px]"
        >
          <div className="w-12 h-12 rounded-full bg-[#C85A32]/95 text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition">
            <Play size={20} className="ml-0.5 fill-white" />
          </div>
        </div>
      )}

      {/* Reel Icon Pill in Center on Hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md transform -translate-y-2 group-hover:translate-y-0 transition-all">
          <Maximize2 size={13} /> Watch Reel
        </span>
      </div>

      {/* Bottom Content Overlay */}
      <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-10">
        <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-0.5">
          {reel.category}
        </p>
        <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight line-clamp-2 drop-shadow-sm">
          {reel.title}
        </h4>


      </div>
    </div>
  );
};

const CafeVideoShowcase = () => {
  const [modalIndex, setModalIndex] = useState(null);
  const activeReel = modalIndex !== null ? REELS_DATA[modalIndex] : null;
  const modalVideoRef = useRef(null);
  const [modalMuted, setModalMuted] = useState(false);
  const [modalPlaying, setModalPlaying] = useState(true);

  // Keyboard navigation & modal lock
  useEffect(() => {
    if (modalIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalIndex(null);
      if (e.key === 'ArrowRight') {
        setModalIndex((prev) => (prev + 1) % REELS_DATA.length);
      }
      if (e.key === 'ArrowLeft') {
        setModalIndex((prev) => (prev - 1 + REELS_DATA.length) % REELS_DATA.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalIndex]);

  // Restart modal video when reel changes
  useEffect(() => {
    if (!activeReel || !modalVideoRef.current) return;
    modalVideoRef.current.currentTime = 0;
    modalVideoRef.current.play().then(() => setModalPlaying(true)).catch(() => {});
  }, [modalIndex]);

  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#C85A32] to-amber-500 text-white flex items-center justify-center shadow-sm">
            <Film size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#2C1810] tracking-tight">
                Menu in Motion • Live Cafe Reels
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#7A685D] font-medium">
              Handcrafted coffee brews, sizzling smash patties, and stone-baked pizzas live from our kitchen
            </p>
          </div>
        </div>

        <Link
          to="/menu"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A32] hover:text-[#9C3E1B] transition group"
        >
          <span>Explore All Dishes</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 4 Reels Grid: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {REELS_DATA.map((reel, index) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            index={index}
            onOpenModal={(idx) => setModalIndex(idx)}
          />
        ))}
      </div>

      {/* Instagram Stories Style Expanded Reel Modal */}
      {modalIndex !== null && activeReel && (
        <div
          onClick={() => setModalIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[92vh] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/20 flex flex-col justify-between"
          >
            {/* Modal Video Player */}
            <video
              ref={modalVideoRef}
              autoPlay
              loop
              muted={modalMuted}
              playsInline
              poster={activeReel.poster}
              className="absolute inset-0 w-full h-full object-cover"
              onClick={() => {
                const vid = modalVideoRef.current;
                if (!vid) return;
                if (modalPlaying) {
                  vid.pause();
                  setModalPlaying(false);
                } else {
                  vid.play().then(() => setModalPlaying(true)).catch(() => {});
                }
              }}
            >
              <source src={activeReel.videoSrc} type="video/mp4" />
            </video>

            {/* Modal Top Bar */}
            <div className="relative z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs font-black shadow-md">
                  ☕
                </span>
                <div>
                  <h5 className="font-extrabold text-xs sm:text-sm text-white leading-tight">
                    The Prime Cafe
                  </h5>
                  <p className="text-[10px] text-neutral-300 font-medium">
                    {activeReel.tag} • Reel {modalIndex + 1} of {REELS_DATA.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const vid = modalVideoRef.current;
                    if (vid) vid.muted = !modalMuted;
                    setModalMuted(!modalMuted);
                  }}
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95"
                  aria-label="Toggle mute"
                >
                  {modalMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {/* Close modal */}
                <button
                  type="button"
                  onClick={() => setModalIndex(null)}
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95"
                  aria-label="Close reel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Navigation Arrows */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalIndex((prev) => (prev - 1 + REELS_DATA.length) % REELS_DATA.length);
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 z-20 border border-white/10"
              aria-label="Previous reel"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalIndex((prev) => (prev + 1) % REELS_DATA.length);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 z-20 border border-white/10"
              aria-label="Next reel"
            >
              <ChevronRight size={20} />
            </button>

            {/* Modal Bottom Dish Details & Action */}
            <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                    {activeReel.category}
                  </span>
                  <span className="text-base sm:text-lg font-black text-white">
                    {activeReel.price}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                  {activeReel.title}
                </h4>
                <p className="text-xs text-neutral-200 mt-1 line-clamp-2 leading-relaxed">
                  {activeReel.description}
                </p>
              </div>

              <div className="pt-1 flex gap-2">
                <Link
                  to={activeReel.link}
                  onClick={() => setModalIndex(null)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#C85A32] hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm text-center shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Utensils size={15} />
                  <span>Order Now • {activeReel.price}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CafeVideoShowcase;
