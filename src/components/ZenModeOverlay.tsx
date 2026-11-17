'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2 } from 'lucide-react';
import { useZikr } from '../context/ZikrContext';
import { CounterButton } from './CounterButton';
import { translations } from '../utils/translations';

export const ZenModeOverlay: React.FC = () => {
  const { settings, updateSettings, activeZikr } = useZikr();
  const t = translations[settings.language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settings.zenMode) {
        updateSettings({ zenMode: false });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.zenMode, updateSettings]);

  if (!settings.zenMode) return null;

  const zikrTitle = settings.language === 'bn' ? activeZikr.nameBn : activeZikr.nameEn;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#07070a] flex flex-col items-center justify-between p-6 select-none"
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between max-w-md">
          <div className="text-center flex-1">
            <h2 className="text-base font-light text-zinc-300 tracking-wide">
              {zikrTitle}
            </h2>
            {activeZikr.arabic && (
              <p className="text-sm text-zinc-500 font-serif dir-rtl mt-0.5">
                {activeZikr.arabic}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ zenMode: false })}
            className="p-2.5 rounded-full text-zinc-500 hover:text-white bg-zinc-900/40 hover:bg-zinc-850 border border-zinc-800/60 transition-colors cursor-pointer"
            title={t.exitZenMode}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Counter */}
        <div className="flex-1 flex items-center justify-center w-full">
          <CounterButton />
        </div>

        {/* Footer Hint */}
        <div className="text-[11px] text-zinc-600">
          ESC চেপে বের হন • {t.keyboardHint}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
