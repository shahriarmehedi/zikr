'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import { ZikrProvider, useZikr } from '../context/ZikrContext';
import { Header } from '../components/Header';
import { CounterButton } from '../components/CounterButton';
import { ZikrDrawer } from '../components/ZikrDrawer';
import { StatsModal } from '../components/StatsModal';
import { SettingsModal } from '../components/SettingsModal';
import { ZenModeOverlay } from '../components/ZenModeOverlay';
import { PwaRegister } from '../components/PwaRegister';
import { translations, formatDisplayNumber } from '../utils/translations';
import { THEME_CONFIG } from '../utils/theme';

function MainZikrApp() {
  const { activeZikr, settings, stats } = useZikr();
  const [isZikrDrawerOpen, setIsZikrDrawerOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = translations[settings.language];
  const theme = THEME_CONFIG[settings.themeAccent];

  const zikrMeaning =
    settings.language === 'bn' ? activeZikr.meaningBn : activeZikr.meaningEn;
  const transliteration =
    settings.language === 'bn'
      ? activeZikr.transliterationBn
      : activeZikr.transliterationEn;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-zinc-100 selection:bg-zinc-800"
      style={{
        backgroundColor: '#08090d',
        backgroundImage: `radial-gradient(ellipse at 50% -10%, ${theme.glow}, transparent 55%), radial-gradient(circle at 50% 110%, rgba(15, 23, 42, 0.4), transparent 60%)`,
      }}
    >
      {/* Top Header */}
      <Header
        onOpenZikrDrawer={() => setIsZikrDrawerOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 w-full max-w-lg mx-auto">
        {/* Active Zikr Title & Meaning */}
        <motion.div
          key={activeZikr.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6 sm:mb-8 select-none"
        >
          {/* Arabic Typography */}
          {activeZikr.arabic && (
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-100 tracking-wide mb-2 dir-rtl drop-shadow-sm font-normal">
              {activeZikr.arabic}
            </h1>
          )}

          {/* Transliteration */}
          {transliteration && (
            <p className="text-sm sm:text-base font-light text-zinc-300">
              {transliteration}
            </p>
          )}

          {/* Meaning */}
          {zikrMeaning && (
            <p className="text-xs text-zinc-500 font-light max-w-xs sm:max-w-sm mx-auto mt-1 leading-relaxed">
              &ldquo;{zikrMeaning}&rdquo;
            </p>
          )}
        </motion.div>

        {/* Centerpiece Counter Button */}
        <CounterButton />

        {/* Bottom Quick Glance Info Bar */}
        <div className="w-full mt-8 sm:mt-10 grid grid-cols-3 gap-2 text-center">
          {/* Today's Count */}
          <div
            onClick={() => setIsStatsOpen(true)}
            className="p-2.5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-850/60 border border-zinc-800/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 group-hover:text-zinc-400 mb-0.5">
              <Clock className="w-3 h-3" />
              <span>{t.today}</span>
            </div>
            <div
              className="text-sm sm:text-base font-bold"
              style={{ color: theme.primary }}
            >
              {formatDisplayNumber(stats.todayTotal, settings.numeralSystem)}
            </div>
          </div>

          {/* Current Streak */}
          <div
            onClick={() => setIsStatsOpen(true)}
            className="p-2.5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-850/60 border border-zinc-800/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 group-hover:text-zinc-400 mb-0.5">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>{t.streak}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-zinc-200">
              {formatDisplayNumber(stats.currentStreak, settings.numeralSystem)}{' '}
              <span className="text-[10px] text-zinc-500 font-normal">{t.days}</span>
            </div>
          </div>

          {/* Lifetime Total */}
          <div
            onClick={() => setIsStatsOpen(true)}
            className="p-2.5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-850/60 border border-zinc-800/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 group-hover:text-zinc-400 mb-0.5">
              <TrendingUp className="w-3 h-3 text-zinc-400" />
              <span>{t.lifetime}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-zinc-200">
              {formatDisplayNumber(stats.lifetimeTotal, settings.numeralSystem)}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimalist Branding */}
      <footer className="w-full text-center py-4 text-[11px] text-zinc-600 select-none">
        <span>{t.streakMotivation}</span>
      </footer>

      {/* Modals & Drawers */}
      <ZikrDrawer
        isOpen={isZikrDrawerOpen}
        onClose={() => setIsZikrDrawerOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Fullscreen Zen Mode Overlay */}
      <ZenModeOverlay />

      {/* PWA Offline Install Banner */}
      <PwaRegister />
    </div>
  );
}

export default function Home() {
  return (
    <ZikrProvider>
      <MainZikrApp />
    </ZikrProvider>
  );
}
