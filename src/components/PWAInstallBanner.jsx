import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Sparkles, Smartphone, CheckCircle2, Loader2 } from 'lucide-react';

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(window.pwaDeferredPrompt || null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleInstallClick = useCallback(async () => {
    const promptEvent = deferredPrompt || window.pwaDeferredPrompt;

    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        setIsInstalling(true);
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        console.log('[PWA] User choice:', choice);

        if (choice && choice.outcome === 'accepted') {
          setTimeout(() => {
            setIsInstalling(false);
            setShowBanner(false);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 5000);
          }, 2500);
        } else {
          setIsInstalling(false);
        }
        return;
      } catch (err) {
        console.warn('[PWA] Prompt error:', err);
        setIsInstalling(false);
      }
    }

    // If browser prompt is not ready or unsupported (e.g. iOS Safari), show manual guide
    setShowHelpModal(true);
  }, [deferredPrompt]);

  useEffect(() => {
    // Check if already running in standalone (installed) mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
    }

    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');

    if (!isStandaloneMode && !isDismissed && window.pwaDeferredPrompt) {
      setDeferredPrompt(window.pwaDeferredPrompt);
      setShowBanner(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.pwaDeferredPrompt = e;
      if (!isStandaloneMode && !sessionStorage.getItem('pwa_banner_dismissed')) {
        setShowBanner(true);
      }
    };

    const handlePwaReady = () => {
      if (window.pwaDeferredPrompt) {
        setDeferredPrompt(window.pwaDeferredPrompt);
        if (!isStandaloneMode && !sessionStorage.getItem('pwa_banner_dismissed')) {
          setShowBanner(true);
        }
      }
    };

    // Listen for manual trigger from Header, HomePage, ProfilePage etc.
    const handleOpenPwaInstall = () => {
      const isStandaloneNow =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

      if (isStandaloneNow) {
        setShowSuccessToast(true);
        return;
      }

      handleInstallClick();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-ready', handlePwaReady);
    window.addEventListener('open-pwa-install', handleOpenPwaInstall);

    // On mobile devices, show banner after brief delay
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    let timer = null;
    if (isMobile && !isStandaloneMode && !isDismissed) {
      timer = setTimeout(() => {
        if (!sessionStorage.getItem('pwa_banner_dismissed')) {
          setShowBanner(true);
        }
      }, 1500);
    }

    // App installed event listener
    const handleAppInstalled = () => {
      setIsInstalling(false);
      setShowBanner(false);
      setDeferredPrompt(null);
      window.pwaDeferredPrompt = null;
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 6000);
      console.log('[PWA] The Prime Cafe App was successfully installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-ready', handlePwaReady);
      window.removeEventListener('open-pwa-install', handleOpenPwaInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [handleInstallClick]);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Success Notification after Installation */}
      {showSuccessToast && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-emerald-800 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-600 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-emerald-200" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold leading-tight">
                {isStandalone ? 'App is Already Active!' : 'App Installed Successfully!'}
              </h4>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                {isStandalone
                  ? 'You are currently using The Prime Cafe mobile app.'
                  : 'The Prime Cafe is now added to your home screen.'}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-emerald-300 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Install Bottom Banner (only if not standalone and not dismissed) */}
      {!isStandalone && showBanner && (
        <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="bg-[#4A2C18] text-[#FAF7F2] rounded-2xl p-3 shadow-2xl border border-[#FAF7F2]/15 flex items-center justify-between gap-3">
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
                {isInstalling ? 'Installing to home screen...' : 'Fast ordering & home screen access'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={isInstalling}
                onClick={handleInstallClick}
                className="bg-[#C85A32] hover:bg-[#B24E2A] active:scale-95 disabled:opacity-80 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {isInstalling ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>Install</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[#FAF7F2]/60 hover:text-white p-1 rounded-lg transition cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Installation Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E6DCD3] relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F5EFEB] text-[#7A685D] hover:text-[#2C1810] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A2C18] text-white flex items-center justify-center shrink-0 shadow-md">
                <Smartphone size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#2C1810]">Install Mobile App</h3>
                <p className="text-xs text-[#7A685D]">Follow these 2 quick steps:</p>
              </div>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#E6DCD3] text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#4A2C18] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-[#4A2C18]">
                  Open your browser menu (tap the <strong>3 dots ⋮</strong> in Chrome / Brave).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#C85A32] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-[#4A2C18]">
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-[#7A685D] text-center mt-4">
              iPhone / Safari users: Tap the <strong>Share</strong> button (⎋) and select <strong>"Add to Home Screen"</strong>.
            </p>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full bg-[#4A2C18] hover:bg-[#382012] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallBanner;
