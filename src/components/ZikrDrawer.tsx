'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Trash2, Edit2, Sparkles, BookOpen } from 'lucide-react';
import { useZikr } from '../context/ZikrContext';
import { translations, formatDisplayNumber } from '../utils/translations';
import { THEME_CONFIG } from '../utils/theme';
import { ZikrItem } from '../types/zikr';

interface ZikrDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZikrDrawer: React.FC<ZikrDrawerProps> = ({ isOpen, onClose }) => {
  const {
    zikrs,
    activeZikr,
    settings,
    selectZikr,
    addCustomZikr,
    editZikr,
    deleteZikr,
  } = useZikr();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingZikrId, setEditingZikrId] = useState<string | null>(null);

  // Form states
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [arabic, setArabic] = useState('');
  const [meaningBn, setMeaningBn] = useState('');
  const [target, setTarget] = useState<number>(33);

  const t = translations[settings.language];
  const theme = THEME_CONFIG[settings.themeAccent];

  const handleOpenAddForm = () => {
    setNameBn('');
    setNameEn('');
    setArabic('');
    setMeaningBn('');
    setTarget(33);
    setEditingZikrId(null);
    setIsAddingNew(true);
  };

  const handleSaveZikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() && !nameEn.trim()) return;

    if (editingZikrId) {
      editZikr(editingZikrId, {
        nameBn: nameBn.trim() || nameEn.trim(),
        nameEn: nameEn.trim() || nameBn.trim(),
        arabic: arabic.trim() || undefined,
        meaningBn: meaningBn.trim() || undefined,
        target: Number(target) || 0,
      });
      setEditingZikrId(null);
    } else {
      addCustomZikr({
        nameBn: nameBn.trim() || nameEn.trim(),
        nameEn: nameEn.trim() || nameBn.trim(),
        arabic: arabic.trim() || undefined,
        meaningBn: meaningBn.trim() || undefined,
        target: Number(target) || 0,
      });
      setIsAddingNew(false);
    }
  };

  const handleStartEdit = (zikr: ZikrItem) => {
    setEditingZikrId(zikr.id);
    setNameBn(zikr.nameBn);
    setNameEn(zikr.nameEn);
    setArabic(zikr.arabic || '');
    setMeaningBn(zikr.meaningBn || '');
    setTarget(zikr.target);
    setIsAddingNew(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-md h-full bg-[#0d0e14] border-l border-zinc-800 flex flex-col shadow-2xl text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5" style={{ color: theme.primary }} />
                <h2 className="text-lg font-medium">{t.selectZikr}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List or Add Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {!isAddingNew ? (
                <>
                  {/* Add Custom Button */}
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-800/50 text-sm font-medium flex items-center justify-center gap-2 text-zinc-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addCustomZikr}</span>
                  </button>

                  {/* List of Azkar */}
                  <div className="space-y-2.5">
                    {zikrs.map((zikr) => {
                      const isActive = zikr.id === activeZikr.id;
                      const title = settings.language === 'bn' ? zikr.nameBn : zikr.nameEn;
                      const meaning = settings.language === 'bn' ? zikr.meaningBn : zikr.meaningEn;

                      return (
                        <div
                          key={zikr.id}
                          onClick={() => {
                            selectZikr(zikr.id);
                            onClose();
                          }}
                          className={`relative p-3.5 rounded-xl border transition-all cursor-pointer group ${
                            isActive
                              ? 'bg-zinc-800/60 border-zinc-600 shadow-md'
                              : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800/40 hover:border-zinc-700'
                          }`}
                          style={
                            isActive
                              ? {
                                  borderColor: theme.primary,
                                  boxShadow: `0 0 15px -3px ${theme.glow}`,
                                }
                              : undefined
                          }
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-medium text-white truncate">
                                  {title}
                                </h3>
                                {zikr.isCustom && (
                                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    {t.customTag}
                                  </span>
                                )}
                              </div>

                              {/* Arabic */}
                              {zikr.arabic && (
                                <p className="text-sm text-zinc-400 font-serif my-0.5 dir-rtl tracking-wide">
                                  {zikr.arabic}
                                </p>
                              )}

                              {/* Meaning */}
                              {meaning && (
                                <p className="text-xs text-zinc-500 truncate mt-0.5">
                                  {meaning}
                                </p>
                              )}

                              {/* Target & Total Info */}
                              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
                                <span>
                                  {t.target}:{' '}
                                  <span className="font-bold text-zinc-200">
                                    {zikr.target > 0
                                      ? formatDisplayNumber(zikr.target, settings.numeralSystem)
                                      : t.unlimited}
                                  </span>
                                </span>
                                <span className="text-zinc-600">•</span>
                                <span>
                                  {t.total}:{' '}
                                  <span className="font-bold text-zinc-200">
                                    {formatDisplayNumber(zikr.totalCount || 0, settings.numeralSystem)}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {isActive && (
                                <span
                                  className="w-5 h-5 rounded-full flex items-center justify-center mr-1"
                                  style={{ backgroundColor: theme.primary }}
                                >
                                  <Check className="w-3 h-3 text-black stroke-[3]" />
                                </span>
                              )}

                              {zikr.isCustom && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(zikr)}
                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                                    title={t.editZikr}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('Delete this custom zikr?')) {
                                        deleteZikr(zikr.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                    title={t.deleteZikr}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Add / Edit Form */
                <form onSubmit={handleSaveZikr} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-300">
                      {editingZikrId ? t.editZikr : t.addCustomZikr}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {t.nameBn} *
                    </label>
                    <input
                      type="text"
                      required
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                      placeholder="যেমন: সুবহানাল্লাহ"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {t.nameEn}
                    </label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. SubhanAllah"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {t.arabicText}
                    </label>
                    <input
                      type="text"
                      value={arabic}
                      onChange={(e) => setArabic(e.target.value)}
                      placeholder="سُبْحَانَ اللَّهِ"
                      dir="rtl"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {t.meaning}
                    </label>
                    <input
                      type="text"
                      value={meaningBn}
                      onChange={(e) => setMeaningBn(e.target.value)}
                      placeholder="অর্থ বা তাৎপর্য লিখুন"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {t.targetCount}
                    </label>
                    <div className="flex gap-2 mb-2">
                      {[33, 100, 500, 1000, 0].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setTarget(val)}
                          className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                            target === val
                              ? 'bg-zinc-700 text-white border-zinc-500'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          {val === 0 ? t.unlimited : formatDisplayNumber(val, settings.numeralSystem)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={target}
                      onChange={(e) => setTarget(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-black transition-all cursor-pointer shadow-lg"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {t.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
