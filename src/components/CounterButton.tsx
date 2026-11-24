'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Minus, CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useZikr } from '../context/ZikrContext';
import { translations, formatDisplayNumber } from '../utils/translations';
import { THEME_CONFIG } from '../utils/theme';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const CounterButton: React.FC = () => {
  const {
    activeZikr,
    settings,
    increment,
    decrement,
    resetCurrentCount,
    isTargetJustReached,
    clearTargetCelebration,
  } = useZikr();

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const t = translations[settings.language];
  const theme = THEME_CONFIG[settings.themeAccent];

  // Confetti on target achieved
  useEffect(() => {
    if (isTargetJustReached) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: [theme.primary, '#ffffff', '#64748b'],
          disableForReducedMotion: true,
        });
      } catch {
        // ignore
      }
    }
  }, [isTargetJustReached, theme.primary]);

  // Keyboard shortcut (Space / Enter to count)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is inside an input or textarea or modal is open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        increment();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [increment]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev.slice(-3), newRipple]);
    increment();
  };

  // SVG Radial Progress Calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const target = activeZikr.target;
  const count = activeZikr.count;

  const progressPercentage = target > 0 ? Math.min(100, (count / target) * 100) : 0;
  const strokeDashoffset =
    target > 0 ? circumference - (progressPercentage / 100) * circumference : 0;

  return (
    <div className="flex flex-col items-center justify-center select-none w-full max-w-sm mx-auto">
      {/* Target celebration alert badge */}
      <AnimatePresence>
        {isTargetJustReached && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            onClick={clearTargetCelebration}
            className="mb-4 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 backdrop-blur-md border shadow-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: theme.bgLight,
              borderColor: theme.primary,
              color: theme.primary,
              boxShadow: `0 0 20px ${theme.glow}`,
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.targetReached}</span>
            <CheckCircle className="w-4 h-4 ml-1 opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Circular Counter Button */}
      <div className="relative flex items-center justify-center p-3">
        {/* SVG Progress Ring */}
        <svg
          className="absolute w-[290px] h-[290px] sm:w-[320px] sm:h-[320px] -rotate-90 pointer-events-none"
          viewBox="0 0 260 260"
        >
          {/* Background circle track */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="5"
            className="text-zinc-800/80"
          />

          {/* Foreground progress circle */}
          {target > 0 && (
            <motion.circle
              cx="130"
              cy="130"
              r={radius}
              fill="transparent"
              stroke={theme.primary}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                filter: `drop-shadow(0 0 8px ${theme.glow})`,
              }}
            />
          )}

          {/* Glowing subtle ring if unlimited */}
          {target === 0 && (
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="transparent"
              stroke={theme.primary}
              strokeWidth="3"
              strokeDasharray="4 8"
              className="opacity-40 animate-spin"
              style={{ animationDuration: '40s' }}
            />
          )}
        </svg>

        {/* The Clickable Round Core Button */}
        <motion.button
          type="button"
          onClick={handleButtonClick}
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="relative z-10 w-[240px] h-[240px] sm:w-[266px] sm:h-[266px] rounded-full overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #1c1d25, #0c0d12 85%)',
            boxShadow: `inset 0 1px 2px rgba(255,255,255,0.08), 0 15px 35px -10px rgba(0,0,0,0.8), 0 0 35px -5px ${theme.glow}`,
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
          aria-label="Tap to count zikr"
        >
          {/* Subtle inner gloss highlight */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white/[0.04] to-transparent rounded-t-full pointer-events-none" />

          {/* Water / Tap Ripples */}
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.4 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute rounded-full pointer-events-none"
              style={{
                top: ripple.y - 30,
                left: ripple.x - 30,
                width: 60,
                height: 60,
                backgroundColor: theme.primary,
              }}
            />
          ))}

          {/* Completed Laps Badge (if any) */}
          {(activeZikr.completedLaps || 0) > 0 && (
            <div className="mb-1 text-[11px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              {t.round}{' '}
              <span className="font-bold text-zinc-200">
                {formatDisplayNumber(activeZikr.completedLaps, settings.numeralSystem)}
              </span>
            </div>
          )}

          {/* Main Counter Digits (Bold in both Bengali & English) */}
          <motion.div
            key={count}
            initial={{ scale: 1.15, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="text-6xl sm:text-7xl font-bold tracking-tight text-white my-1 tabular-nums drop-shadow-sm"
          >
            {formatDisplayNumber(count, settings.numeralSystem)}
          </motion.div>

          {/* Target / Progress Info */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
            {target > 0 ? (
              <span>
                <span className="font-bold text-zinc-200">
                  {formatDisplayNumber(count, settings.numeralSystem)}
                </span>{' '}
                /{' '}
                <span className="font-bold text-zinc-300">
                  {formatDisplayNumber(target, settings.numeralSystem)}
                </span>{' '}
                <span className="text-zinc-500 font-semibold">
                  ({formatDisplayNumber(Math.round(progressPercentage), settings.numeralSystem)}%)
                </span>
              </span>
            ) : (
              <span className="text-zinc-500 tracking-wider font-light">
                {t.unlimited}
              </span>
            )}
          </div>
        </motion.button>
      </div>

      {/* Auxiliary quick action buttons (Reset & Decrement) */}
      <div className="flex items-center gap-4 mt-6">
        <button
          type="button"
          onClick={decrement}
          disabled={count <= 0}
          title="Decrease count by 1"
          className="p-2.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (count > 0 && window.confirm(t.resetConfirm)) {
              resetCurrentCount();
            }
          }}
          disabled={count <= 0}
          title={t.reset}
          className="px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 focus:outline-none"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.reset}</span>
        </button>
      </div>

      {/* Helpful keyboard hint for desktop users */}
      <div className="hidden sm:block text-[11px] text-zinc-600 mt-4 text-center">
        {t.keyboardHint}
      </div>
    </div>
  );
};
