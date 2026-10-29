import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  ArrowRight,
  Flame
} from 'lucide-react';

const REELS_DATA = [
  {
    id: 'coffee',
    title: 'Double Shot Espresso & Crema',
    category: 'Coffee & Brews',
    tag: 'Barista Special',
    videoSrc: '/assets/reels/reel_coffee.mp4',
    poster: '/assets/reels/poster_coffee.jpg'
  },
  {
    id: 'burger',
    title: 'Sizzling Smash Patty Burger',
    category: 'Burgers & Grills',
    tag: 'Trending Now',
    videoSrc: '/assets/reels/reel_burger.mp4',
    poster: '/assets/reels/poster_burger.jpg'
  },
  {
    id: 'pizza',
    title: 'Wood-Fired Margherita Basil',
    category: 'Gourmet Pizzas',
    tag: 'Chef Choice',
    videoSrc: '/assets/reels/reel_pizza.mp4',
    poster: '/assets/reels/poster_pizza.jpg'
  },
  {
    id: 'pasta',
    title: 'Creamy Italian Alfredo Toss',
    category: 'Pastas & Bowls',
    tag: 'Best Seller',
    videoSrc: '/assets/reels/reel_pasta.mp4',
    poster: '/assets/reels/poster_pasta.jpg'
  }
];

const ReelCard = ({ reel }) => {
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
      onClick={togglePlay}
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
          title={isMuted ? 'Click to Unmute' : 'Click to Mute'}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
      </div>

      {/* Center Play Indicator when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-15 bg-black/35 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full bg-[#C85A32]/95 text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition">
            <Play size={20} className="ml-0.5 fill-white" />
          </div>
        </div>
      )}

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
        {REELS_DATA.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </section>
  );
};

export default CafeVideoShowcase;
