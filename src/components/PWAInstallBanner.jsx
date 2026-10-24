import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed it in this session
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (isDismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent automatic mini-infobar on mobile Chrome
      e.preventDefault();
      // Store event for later trigger
      setDeferredPrompt(e);
      window.pwaDeferredPrompt = e;
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also listen for successful install
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      window.pwaDeferredPrompt = null;
      console.log('[PWA] Prime Cafe App was successfully installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.pwaDeferredPrompt;
    if (!promptEvent) {
      // Fallback instruction if browser doesn't support direct trigger
      alert('To install, tap the 3 dots (⋮) in your browser menu and choose "Install App" or "Add to Home screen".');
      return;
    }

    // Show the native browser install prompt
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);

    // Clear prompt state
    setDeferredPrompt(null);
    window.pwaDeferredPrompt = null;
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showBanner || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-[#4A2C18] text-[#FAF7F2] rounded-2xl p-3.5 shadow-2xl border border-[#FAF7F2]/10 flex items-center justify-between gap-3">
        {/* App Icon */}
        <div className="relative shrink-0">
          <img
            src="/pwa-192x192.png"
            alt="Prime Cafe"
            className="w-11 h-11 rounded-xl shadow-md border border-[#FAF7F2]/20 object-cover"
          />
          <span className="absolute -top-1 -right-1 bg-[#C85A32] text-white p-0.5 rounded-full">
            <Sparkles size={10} />
          </span>
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold leading-tight truncate text-[#FAF7F2]">
            Install Prime Cafe App
          </h4>
          <p className="text-[11px] text-[#FAF7F2]/75 leading-tight mt-0.5 truncate">
            Fast ordering & home screen access
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="bg-[#C85A32] hover:bg-[#B24E2A] active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[#FAF7F2]/60 hover:text-white p-1 rounded-lg transition"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
