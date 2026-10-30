import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for 1000ms, then begin smooth fade out
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1000);

    // Unmount completely after fade-out transition finishes (450ms)
    const removeTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-[#FAF7F2] flex flex-col items-center justify-center transition-opacity duration-400 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="The Prime Cafe Splash Screen"
    >
      <div className="relative flex items-center justify-center mb-5">
        {/* Subtle Ambient Pulse Ring */}
        <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#C85A32]/15 animate-ping opacity-60 pointer-events-none" />

        {/* Official The Prime Cafe Round Emblem Logo */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-2xl ring-2 ring-[#C85A32]/40 bg-black flex items-center justify-center relative z-10">
          <img
            src="/logo.png"
            alt="The Prime Cafe"
            className="w-full h-full object-cover animate-pulse"
          />
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-black text-[#2C1810] tracking-tight mb-1 text-center">
        The Prime Cafe
      </h1>
      <p className="text-[11px] sm:text-xs font-bold text-[#C85A32] tracking-widest uppercase text-center">
        Artisanal Roastery & Eatery
      </p>

      {/* Sleek Spinner & Status */}
      <div className="mt-7 flex items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-[#E6DCD3] border-t-[#C85A32] rounded-full animate-spin" />
        <span className="text-[11px] font-semibold text-[#7A685D] tracking-wide">
          Brewing Experience...
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;

