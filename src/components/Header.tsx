'use client';

import React from 'react';
import {
  ChevronDown,
  BarChart2,
  Settings as SettingsIcon,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useZikr } from '../context/ZikrContext';
import { translations } from '../utils/translations';
import { THEME_CONFIG } from '../utils/theme';

interface HeaderProps {
  onOpenZikrDrawer: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenZikrDrawer,
  onOpenStats,
  onOpenSettings,
}) => {
  const { activeZikr, settings, updateSettings } = useZikr();
  const t = translations[settings.language];
  const theme = THEME_CONFIG[settings.themeAccent];

  const zikrTitle = settings.language === 'bn' ? activeZikr.nameBn : activeZikr.nameEn;

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <header className="w-full max-w-lg mx-auto flex items-center justify-between px-4 py-4 sm:py-6 select-none z-20">
      {/* Active Zikr Selector Button */}
      <button
        type="button"
        onClick={onOpenZikrDrawer}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800/80 transition-all cursor-pointer group shadow-sm text-left max-w-[200px] sm:max-w-[240px]"
        style={{
          boxShadow: `0 0 12px -2px ${theme.glow}`,
        }}
        title={t.selectZikr}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0 animate-pulse"
          style={{ backgroundColor: theme.primary }}
        />
        <span className="text-xs sm:text-sm font-medium text-zinc-100 truncate">
          {zikrTitle}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white shrink-0 ml-0.5 transition-transform group-hover:translate-y-0.5" />
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Sound Toggle Button */}
        <button
          type="button"
          onClick={toggleSound}
          className={`p-2 sm:p-2.5 rounded-full border transition-all cursor-pointer ${
            settings.soundEnabled
              ? 'text-zinc-200 bg-zinc-900/80 border-zinc-700/80 hover:bg-zinc-800'
              : 'text-zinc-500 bg-zinc-950/60 border-zinc-850 hover:text-zinc-400'
          }`}
          title={settings.soundEnabled ? 'ট্যাপ সাউন্ড চালু (Mute)' : 'ট্যাপ সাউন্ড বন্ধ (Unmute)'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4" style={{ color: theme.primary }} />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Zen Mode Button */}
        <button
          type="button"
          onClick={() => updateSettings({ zenMode: true })}
          className="p-2 sm:p-2.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 transition-all cursor-pointer"
          title={t.zenMode}
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Stats Button */}
        <button
          type="button"
          onClick={onOpenStats}
          className="p-2 sm:p-2.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 transition-all cursor-pointer"
          title={t.stats}
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 sm:p-2.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 transition-all cursor-pointer"
          title={t.settings}
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
