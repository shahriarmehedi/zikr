'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useZikr } from '../context/ZikrContext';
import { THEME_CONFIG } from '../utils/theme';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaRegister = () => {
  const { settings } = useZikr();
  const theme = THEME_CONFIG[settings.themeAccent];
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('SW registered:', reg.scope);
          })
          .catch((err) => {
            console.error('SW registration failed:', err);
          });
      });
    }

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user previously dismissed banner
      const dismissed = localStorage.getItem('zikr_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('zikr_pwa_dismissed', 'true');
  };

  if (!showInstallBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-sm mx-auto z-40 p-3 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 shadow-2xl flex items-center justify-between gap-3 text-zinc-100 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
          style={{ backgroundColor: theme.primary }}
        >
          <Download className="w-5 h-5 text-black" />
        </div>
        <div className="text-left">
          <p className="text-xs font-medium text-white">
            {settings.language === 'bn' ? 'অ্যাপ হিসেবে ইন্সটল করুন' : 'Install Zikr App'}
          </p>
          <p className="text-[10px] text-zinc-400">
            {settings.language === 'bn' ? 'অফলাইনে ব্যবহারের সুবিধা সহ' : 'Works completely offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-black transition-all cursor-pointer shadow-md"
          style={{ backgroundColor: theme.primary }}
        >
          {settings.language === 'bn' ? 'ইন্সটল' : 'Install'}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
