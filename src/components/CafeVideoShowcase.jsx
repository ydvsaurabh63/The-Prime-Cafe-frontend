import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles } from 'lucide-react';
import InstagramReelsModal from './InstagramReelsModal';

const REELS_DATA = [
  {
    id: 'prime-cafe',
    title: 'The Prime Café Experience',
    category: 'Signature Special',
    subtitle: 'Artisan Roasts & Cozy Ambience',
    videoSrc: '/assets/reels/the_prime_cafe_1.mp4',
    poster: '/assets/reels/poster_prime_cafe.jpg',
    product: {
      _id: 'default-coffee',
      name: 'The Prime Experience Roast',
      price: 120,
      description: 'Handcrafted signature roast with rich crema & cozy vibes.',
      image: '/assets/reels/poster_prime_cafe.jpg'
    }
  },
  {
    id: 'coffee',
    title: 'Double Shot Espresso & Crema',
    category: 'Coffee & Brews',
    subtitle: '100% Arabica Golden Crema',
    videoSrc: '/assets/reels/reel_coffee.mp4',
    poster: '/assets/reels/poster_coffee.jpg',
    product: {
      _id: 'default-coffee',
      name: 'Double Shot Espresso & Crema',
      price: 120,
      description: '100% Arabica single-origin beans, precision extracted with rich crema.',
      image: '/assets/reels/poster_coffee.jpg'
    }
  },
  {
    id: 'burger',
    title: 'Sizzling Smash Patty Burger',
    category: 'Burgers & Grills',
    subtitle: 'Crispy Brioche & Smoked Melt',
    videoSrc: '/assets/reels/reel_burger.mp4',
    poster: '/assets/reels/poster_burger.jpg',
    product: {
      _id: 'default-burger',
      name: 'Artisan Smash Burger',
      price: 60,
      description: 'Crisp brioche bun, house-special smoky sauce, and flame-seared patty.',
      image: '/assets/reels/poster_burger.jpg'
    }
  },
  {
    id: 'pizza',
    title: 'Wood-Fired Margherita Basil',
    category: 'Gourmet Pizzas',
    subtitle: 'San Marzano & Fresh Bocconcini',
    videoSrc: '/assets/reels/reel_pizza.mp4',
    poster: '/assets/reels/poster_pizza.jpg',
    product: {
      _id: 'default-pizza',
      name: 'Wood-Fired Margherita Pizza',
      price: 210,
      description: 'Crushed San Marzano tomatoes, fresh basil, and bubbly mozzarella.',
      image: '/assets/reels/poster_pizza.jpg'
    }
  },
  {
    id: 'pasta',
    title: 'Creamy Italian Alfredo Toss',
    category: 'Pastas & Bowls',
    subtitle: 'Parmesan Garlic Al Dente',
    videoSrc: '/assets/reels/reel_pasta.mp4',
    poster: '/assets/reels/poster_pasta.jpg',
    product: {
      _id: 'default-pasta',
      name: 'Creamy Italian Alfredo Pasta',
      price: 210,
      description: 'Al dente pasta tossed in parmesan garlic cream and aromatic herbs.',
      image: '/assets/reels/poster_pasta.jpg'
    }
  }
];

const ReelCard = ({ reel, isActive, onSelectReel }) => {
  const videoRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    // Observe intersection so off-screen reels pause automatically
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.3 }
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
    if (diffX > 10 || diffY > 10) {
      isDraggingRef.current = true;
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    onSelectReel();
  };

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className={`group relative aspect-[9/16] w-full rounded-[26px] sm:rounded-[30px] overflow-hidden bg-black border border-white/10 shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-end select-none ${
        isActive
          ? 'scale-100 opacity-100 ring-2 ring-[#C85A32]/50 shadow-xl'
          : 'scale-[0.96] opacity-85 md:scale-100 md:opacity-100'
      }`}
    >
      {/* Background Video (Muted Preview) */}
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

      {/* Center Reel Play Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-15 bg-black/20 group-hover:bg-black/35 transition duration-300">
        <div className="w-12 h-12 rounded-full bg-[#C85A32]/90 group-hover:bg-[#C85A32] text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 active:scale-95 transition">
          <Play size={22} className="ml-0.5 fill-white" />
        </div>
      </div>

      {/* Top Reel Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
        <Sparkles size={11} className="text-[#C85A32]" />
        <span className="text-[10px] font-bold text-white tracking-wide">Watch Reel</span>
      </div>

      {/* Bottom Content Overlay */}
      <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-12">
        <span className="bg-[#C85A32] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-1.5 shadow-xs">
          {reel.category}
        </span>
        <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-sm mb-0.5 line-clamp-1">
          {reel.title}
        </h4>
        <p className="text-[10px] sm:text-[11px] text-white/80 font-medium tracking-wide line-clamp-1">
          {reel.subtitle}
        </p>
      </div>
    </div>
  );
};

const CafeVideoShowcase = () => {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReelIndex, setSelectedReelIndex] = useState(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !container.children.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDiff = Infinity;

    Array.from(container.children).forEach((child, i) => {
      const childRect = child.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;
      const diff = Math.abs(childCenter - containerCenter);
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
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      const targetScroll = isDesktop
        ? targetChild.offsetLeft
        : targetChild.offsetLeft - (container.clientWidth - targetChild.offsetWidth) / 2;

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="px-1 flex items-end justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#2C1810] tracking-tight flex items-center gap-2">
            <span>Menu in Motion</span>
            <span className="bg-[#C85A32]/10 text-[#C85A32] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#C85A32]/20">
              Reels
            </span>
          </h3>
          <p className="text-[11px] sm:text-xs text-[#7A685D] mt-0.5">
            Tap any reel to watch full-screen & swipe up like Instagram
          </p>
        </div>
      </div>

      {/* Reels Track: Center card with peek side cards on mobile, wide cards slider on desktop */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 md:gap-5 pb-3 pt-1 no-scrollbar touch-pan-x scroll-smooth px-[12vw] sm:px-[14vw] scroll-px-[12vw] sm:scroll-px-[14vw] md:px-0 md:scroll-px-0"
      >
        {REELS_DATA.map((reel, index) => (
          <div
            key={reel.id}
            className="w-[74vw] max-w-[265px] shrink-0 snap-center md:w-[265px] lg:w-[270px] md:snap-start flex justify-center"
          >
            <ReelCard
              reel={reel}
              isActive={currentIndex === index}
              onSelectReel={() => setSelectedReelIndex(index)}
            />
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

      {/* Fullscreen Instagram Reels Modal with Vertical Swipe, Like, Share, Order & Add to Cart */}
      {selectedReelIndex !== null && (
        <InstagramReelsModal
          isOpen={selectedReelIndex !== null}
          initialIndex={selectedReelIndex}
          reels={REELS_DATA}
          onClose={() => setSelectedReelIndex(null)}
        />
      )}
    </section>
  );
};

export default CafeVideoShowcase;
