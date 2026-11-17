'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings as SettingsIcon,
  Globe,
  Volume2,
  Vibrate,
  Palette,
  Hash,
  Download,
  Upload,
  AlertTriangle,
  Repeat,
  Check,
} from 'lucide-react';
import { useZikr } from '../context/ZikrContext';
import { translations } from '../utils/translations';
import { THEME_CONFIG } from '../utils/theme';
import { ThemeAccent, SoundType } from '../types/zikr';
import { playTapSound } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    clearAllData,
  } = useZikr();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const t = translations[settings.language];
  const currentTheme = THEME_CONFIG[settings.themeAccent];

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zikr-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importData(text);
        if (success) {
          setImportMessage('সফলভাবে ডাটা লোড হয়েছে! (Restored successfully)');
          setTimeout(() => setImportMessage(null), 3000);
        } else {
          setImportMessage('ভুল ফাইল ফরম্যাট (Invalid file)');
          setTimeout(() => setImportMessage(null), 3000);
        }
      } catch {
        setImportMessage('ডাটা লোড ব্যর্থ হয়েছে (Failed to read file)');
        setTimeout(() => setImportMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const accents: { id: ThemeAccent; labelBn: string; labelEn: string; color: string }[] = [
    { id: 'emerald', labelBn: 'মরু সবুজ', labelEn: 'Emerald', color: '#10b981' },
    { id: 'amber', labelBn: 'উষ্ণ আম্বার', labelEn: 'Amber', color: '#fbbf24' },
    { id: 'silver', labelBn: 'মার্জিত রূপালি', labelEn: 'Silver', color: '#e4e4e7' },
    { id: 'cyan', labelBn: 'শান্ত আকাশী', labelEn: 'Cyan', color: '#22d3ee' },
  ];

  const soundOptions: { id: SoundType; label: string }[] = [
    { id: 'wood', label: t.soundWood },
    { id: 'click', label: t.soundClick },
    { id: 'bell', label: t.soundBell },
    { id: 'water', label: t.soundWater },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] bg-[#0c0d13] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col text-zinc-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <SettingsIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
                <h2 className="text-base sm:text-lg font-medium">{t.settings}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Language Switch */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {t.language}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ language: 'bn' })}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      settings.language === 'bn'
                        ? 'border-white bg-zinc-800 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <span>বাংলা (Bengali)</span>
                    {settings.language === 'bn' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ language: 'en' })}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      settings.language === 'en'
                        ? 'border-white bg-zinc-800 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <span>English</span>
                    {settings.language === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Numeral System */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  {t.numeralStyle}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ numeralSystem: 'bn' })}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      settings.numeralSystem === 'bn'
                        ? 'border-white bg-zinc-800 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <span>{t.bengaliDigits}</span>
                    {settings.numeralSystem === 'bn' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ numeralSystem: 'en' })}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      settings.numeralSystem === 'en'
                        ? 'border-white bg-zinc-800 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <span>{t.englishDigits}</span>
                    {settings.numeralSystem === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Theme Accent Color */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  {t.themeAccent}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {accents.map((item) => {
                    const isSelected = settings.themeAccent === item.id;
                    const label = settings.language === 'bn' ? item.labelBn : item.labelEn;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateSettings({ themeAccent: item.id })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white bg-zinc-800 text-white'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800/40'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-medium truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound & Haptics */}
              <div className="space-y-4 pt-2 border-t border-zinc-800/80">
                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{t.sound}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-zinc-200 cursor-pointer"
                  />
                </div>

                {/* Sound Options if enabled */}
                {settings.soundEnabled && (
                  <div className="pl-6 space-y-1.5">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                      {t.soundType}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {soundOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            updateSettings({ soundType: opt.id });
                            playTapSound(opt.id);
                          }}
                          className={`py-1.5 px-3 rounded-lg border text-xs text-left transition-colors cursor-pointer flex items-center justify-between ${
                            settings.soundType === opt.id
                              ? 'bg-zinc-800 border-zinc-600 text-white'
                              : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {settings.soundType === opt.id && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vibration Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{t.vibration}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.vibrationEnabled}
                    onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-zinc-200 cursor-pointer"
                  />
                </div>

                {/* Auto Loop Round */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{t.autoLoop}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoResetTarget}
                    onChange={(e) => updateSettings({ autoResetTarget: e.target.checked })}
                    className="w-4 h-4 rounded accent-zinc-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Backup & Portability */}
              <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  ডাটা ব্যাকআপ ও রিস্টোর (Backup & Sync)
                </label>

                {importMessage && (
                  <div className="p-2.5 rounded-lg bg-zinc-800 text-xs text-emerald-400 border border-emerald-500/30">
                    {importMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="py-2.5 px-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{t.exportData}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{t.importData}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-2 pt-2 border-t border-red-950/40">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t.clearConfirm)) {
                      clearAllData();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-red-900/30 hover:border-red-800/60 bg-red-950/10 hover:bg-red-950/30 text-xs font-medium text-red-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t.clearAllData}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
