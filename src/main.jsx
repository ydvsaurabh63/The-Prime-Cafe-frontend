import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Capture PWA beforeinstallprompt immediately at script execution so React components never miss it
window.pwaDeferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.pwaDeferredPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-ready'));
  console.log('[PWA] beforeinstallprompt captured');
});

// Safely register Service Worker for PWA support
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  const registerSW = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed (non-critical):', error);
      });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    registerSW();
  } else {
    window.addEventListener('DOMContentLoaded', registerSW);
    window.addEventListener('load', registerSW);
  }
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

