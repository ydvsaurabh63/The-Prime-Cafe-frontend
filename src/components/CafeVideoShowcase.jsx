import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Film,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const REELS_DATA = [
  {
    id: 'prime-cafe',
    title: 'The Prime Café Experience',
    category: 'Signature Special',
    videoSrc: '/assets/reels/the_prime_cafe_1.mp4',
    poster: '/assets/reels/poster_prime_cafe.jpg'
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
  },
  {
    id: 'pasta',
    title: 'Creamy Italian Alfredo Toss',
    category: 'Pastas & Bowls',
    videoSrc: '/assets/reels/reel_pasta.mp4',
    poster: '/assets/reels/poster_pasta.jpg'
  }
];

const ReelCard = ({ reel }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const manualPauseRef = useRef(false);

  // Track touch drag so swiping doesn't trigger video pause
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // All reels muted by default
    video.muted = true;

    // Observe intersection so off-screen reels pause automatically
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !manualPauseRef.current) {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          } else if (!entry.isIntersecting) {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e) => {
    const diffX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
    const diffY = Math.abs(e.touches[0].clientY - touchStartYRef.current);
    if (diffX > 8 || diffY > 8) {
      isDraggingRef.current = true;
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      manualPauseRef.current = true;
    } else {
      manualPauseRef.current = false;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div
      onClick={togglePlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="group relative aspect-[9/16] w-[82vw] max-w-[285px] xs:max-w-[305px] sm:max-w-[325px] md:w-[270px] lg:w-[295px] xl:w-[320px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-[#E6DCD3] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end select-none"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={reel.poster}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      >
        <source src={reel.videoSrc} type="video/mp4" />
      </video>

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
        <p className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider mb-0.5 line-clamp-1">
          {reel.category}
        </p>
        <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight line-clamp-2 drop-shadow-sm">
          {reel.title}
        </h4>
      </div>
    </div>
  );
};

const CafeVideoShowcase = () => {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !container.children.length) return;

    const containerLeft = container.getBoundingClientRect().left;
    let closestIndex = 0;
    let minDiff = Infinity;

    Array.from(container.children).forEach((child, i) => {
      const childLeft = child.getBoundingClientRect().left;
      const diff = Math.abs(childLeft - containerLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex);
    }
  };

  const scrollToIndex = (index) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const targetChild = container.children[index];
    if (targetChild) {
      container.scrollTo({
        left: targetChild.offsetLeft,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, currentIndex - 1);
    scrollToIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(REELS_DATA.length - 1, currentIndex + 1);
    scrollToIndex(nextIdx);
  };

  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-[#C85A32] to-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Film size={18} />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#2C1810] tracking-tight leading-none">
              Menu in Motion • Live Cafe Reels
            </h3>
            <p className="text-[11px] text-[#7A685D] mt-0.5">
              Swipe across to explore our signature kitchen creations
            </p>
          </div>
        </div>

        {/* Navigation Controls: Reel Counter & Prev/Next Arrows */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] sm:text-xs font-bold text-[#7A685D] bg-[#F5EFEB] border border-[#E6DCD3] px-2.5 py-1 rounded-full whitespace-nowrap">
            {currentIndex + 1} / {REELS_DATA.length}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E6DCD3] flex items-center justify-center transition-all ${
              currentIndex === 0
                ? 'opacity-35 cursor-not-allowed bg-white/40 text-[#7A685D]'
                : 'bg-white text-[#2C1810] hover:bg-[#C85A32] hover:text-white hover:border-[#C85A32] shadow-sm cursor-pointer active:scale-95'
            }`}
            aria-label="Previous reel"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === REELS_DATA.length - 1}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E6DCD3] flex items-center justify-center transition-all ${
              currentIndex === REELS_DATA.length - 1
                ? 'opacity-35 cursor-not-allowed bg-white/40 text-[#7A685D]'
                : 'bg-white text-[#2C1810] hover:bg-[#C85A32] hover:text-white hover:border-[#C85A32] shadow-sm cursor-pointer active:scale-95'
            }`}
            aria-label="Next reel"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Reels Track: Single full slide on mobile, wide cards slider on desktop */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 pt-1 no-scrollbar touch-pan-x scroll-smooth -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 md:gap-5"
      >
        {REELS_DATA.map((reel) => (
          <div
            key={reel.id}
            className="w-full min-w-full shrink-0 snap-center flex justify-center md:w-auto md:min-w-0 md:shrink-0 md:snap-start"
          >
            <ReelCard reel={reel} />
          </div>
        ))}
      </div>

      {/* Mobile Swipe Pagination Dots */}
      <div className="flex justify-center items-center gap-1.5 pt-1 md:hidden">
        {REELS_DATA.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx
                ? 'w-6 bg-[#C85A32]'
                : 'w-1.5 bg-[#E6DCD3] hover:bg-[#7A685D]'
            }`}
            aria-label={`Go to reel ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default CafeVideoShowcase;
