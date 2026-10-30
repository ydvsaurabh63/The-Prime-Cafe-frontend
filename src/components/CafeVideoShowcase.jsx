import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Film,
  Volume2,
  VolumeX
} from 'lucide-react';

const REELS_DATA = [
  {
    id: 'prime-cafe',
    title: 'The Prime Café Experience',
    category: 'Signature Special',
    videoSrc: '/assets/reels/the_prime_cafe_1.mp4',
    poster: '/assets/reels/poster_prime_cafe.jpg',
    hasVoice: true
  },
  {
    id: 'coffee',
    title: 'Double Shot Espresso & Crema',
    category: 'Coffee & Brews',
    videoSrc: '/assets/reels/reel_coffee.mp4',
    poster: '/assets/reels/poster_coffee.jpg'
  },
  {
    id: 'burger',
    title: 'Sizzling Smash Patty Burger',
    category: 'Burgers & Grills',
    videoSrc: '/assets/reels/reel_burger.mp4',
    poster: '/assets/reels/poster_burger.jpg'
  },
  {
    id: 'pizza',
    title: 'Wood-Fired Margherita Basil',
    category: 'Gourmet Pizzas',
    videoSrc: '/assets/reels/reel_pizza.mp4',
    poster: '/assets/reels/poster_pizza.jpg'
  }
];

const ReelCard = ({ reel }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  // If video has voice, attempt to start unmuted
  const [isMuted, setIsMuted] = useState(!reel.hasVoice);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;

    // Attempt autoplay (with sound if reel.hasVoice)
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If browser blocks unmuted autoplay, fallback to muted autoplay
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {
          setIsPlaying(false);
        });
      });
    }
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    // If reel has voice and is currently muted, unmute on card tap
    if (reel.hasVoice && isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (video.paused) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      return;
    }

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

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted && video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div
      onClick={togglePlay}
      className="group relative aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-[#E6DCD3] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end"
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

      {/* Voice / Audio Indicator for Voice Reel */}
      {reel.hasVoice && (
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={toggleMute}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md border ${
              !isMuted
                ? 'bg-[#C85A32] text-white border-orange-400/50 shadow-orange-950/40'
                : 'bg-black/65 text-white/95 border-white/20 hover:bg-black/80'
            }`}
            title={isMuted ? 'Click to play with voice' : 'Mute voice'}
          >
            {isMuted ? (
              <>
                <VolumeX size={13} className="text-white/80" />
                <span className="text-[10px] uppercase tracking-wider font-extrabold">Tap for Voice</span>
              </>
            ) : (
              <>
                <Volume2 size={13} className="text-white animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-extrabold">Voice ON</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Center Play Indicator when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-15 bg-black/35 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full bg-[#C85A32]/95 text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition">
            <Play size={20} className="ml-0.5 fill-white" />
          </div>
        </div>
      )}

      {/* Bottom Content Overlay */}
      <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-12">
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
      <div className="flex items-center gap-2.5 px-1">
        <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#C85A32] to-amber-500 text-white flex items-center justify-center shadow-sm">
          <Film size={18} />
        </span>
        <h3 className="text-base sm:text-lg font-black text-[#2C1810] tracking-tight">
          Menu in Motion • Live Cafe Reels
        </h3>
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
