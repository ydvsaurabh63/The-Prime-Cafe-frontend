import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Film } from 'lucide-react';

const CafeVideoShowcase = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt autoplay
    video.play().catch(() => {
      // Autoplay might fail without user interaction if unmuted
      setIsPlaying(false);
    });

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <section className="space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#C85A32] flex items-center justify-center">
            <Film size={16} />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#2C1810] tracking-tight">
              Live Cafe Experience
            </h3>
            <p className="text-[11px] text-[#7A685D] font-medium">
              Handcrafted coffee, sizzling kitchen & aesthetic cafe moments
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-[#FAF0E6] text-[#C85A32] border border-[#E6DCD3]">
          <Sparkles size={12} /> The Prime Roastery
        </span>
      </div>

      {/* Video Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-md bg-black aspect-video max-h-[480px] w-full group"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
          poster="/prime-cafe-banner.png"
        >
          {/* Priority 1: Custom user video */}
          <source src="/assets/cafe-video.mp4" type="video/mp4" />
          {/* Priority 2: Fallback video */}
          <source src="/assets/burger-animation.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Ambient Top Shadow with Badge */}
        <div className="absolute top-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Cafe Spotlight
          </span>
        </div>

        {/* Big Center Play Icon when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            type="button"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#C85A32]/90 hover:bg-[#C85A32] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
            aria-label="Play video"
          >
            <Play size={26} className="ml-1 fill-white" />
          </button>
        )}

        {/* Bottom Floating Control Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-300 z-10 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 sm:opacity-0 group-hover:opacity-100'
          }`}
        >
          {/* Scrubber Progress Bar */}
          <div className="relative mb-2.5">
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C85A32] transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent || 0}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition active:scale-90 cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5 fill-white" />}
              </button>

              {/* Mute / Unmute Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition active:scale-90 cursor-pointer"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <span className="text-[11px] font-medium text-white/80 hidden sm:inline">
                {isMuted ? 'Muted (Tap to hear sound)' : 'Audio On'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition active:scale-90 cursor-pointer"
                aria-label="Fullscreen"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CafeVideoShowcase;
