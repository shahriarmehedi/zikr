'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar as CalendarIcon,
  Flame,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useZikr } from '../context/ZikrContext';
import { translations, formatDisplayNumber } from '../utils/translations';
import { THEME_CONFIG } from '../utils/theme';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { history, zikrs, settings, stats } = useZikr();
  const t = translations[settings.language];
  const theme = THEME_CONFIG[settings.themeAccent];

  // Calendar state: Selected month & selected date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 0, 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-01-01');

  // Sync client dates on mount or when opened
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const now = new Date();
      setCurrentDate(now);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      setSelectedDateStr(`${y}-${m}-${d}`);
    }
  }, [isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthName =
    settings.language === 'bn' ? monthNamesBn[month] : monthNamesEn[month];

  // Calendar days calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNumber: number; count: number; isCurrentMonth: boolean }[] = [];

    // Blank padding for days of previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateStr: '',
        dayNumber: 0,
        count: 0,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = history[dStr]?.total || 0;
      days.push({
        dateStr: dStr,
        dayNumber: d,
        count,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [year, month, history]);

  // Breakdown for the currently selected date
  const selectedDayRecord = history[selectedDateStr];
  const selectedDayTotal = selectedDayRecord?.total || 0;

  // Format date display for selected date
  const formatSelectedDateHuman = (dStr: string) => {
    if (!dStr) return '';
    const [y, m, d] = dStr.split('-').map(Number);
    const mName = settings.language === 'bn' ? monthNamesBn[m - 1] : monthNamesEn[m - 1];
    return `${formatDisplayNumber(d, settings.numeralSystem)} ${mName}, ${formatDisplayNumber(y, settings.numeralSystem)}`;
  };

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
            className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-[#0c0d13] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col text-zinc-100 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5" style={{ color: theme.primary }} />
                <h2 className="text-base sm:text-lg font-medium">{t.stats}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Primary Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Lifetime Total */}
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                    {t.lifetime}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {formatDisplayNumber(stats.lifetimeTotal, settings.numeralSystem)}
                  </span>
                </div>

                {/* Today Total */}
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {t.today}
                  </span>
                  <span
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: theme.primary }}
                  >
                    {formatDisplayNumber(stats.todayTotal, settings.numeralSystem)}
                  </span>
                </div>

                {/* Current Streak */}
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    {t.streak}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {formatDisplayNumber(stats.currentStreak, settings.numeralSystem)}{' '}
                    <span className="text-xs text-zinc-500 font-normal">{t.days}</span>
                  </span>
                </div>

                {/* Best Streak */}
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    {t.bestStreak}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {formatDisplayNumber(stats.bestStreak, settings.numeralSystem)}{' '}
                    <span className="text-xs text-zinc-500 font-normal">{t.days}</span>
                  </span>
                </div>
              </div>

              {/* Journey Started Info Banner */}
              <div className="px-4 py-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-wrap items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-zinc-500" />
                  <span>
                    {t.startedOn}:{' '}
                    <span className="text-zinc-200 font-semibold">
                      {formatSelectedDateHuman(settings.startDate)}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400">
                    {t.daysAgo}:{' '}
                    <span className="text-zinc-200 font-bold">
                      {formatDisplayNumber(stats.daysSinceStart, settings.numeralSystem)} {t.days}
                    </span>
                  </span>
                </div>
              </div>

              {/* Interactive Calendar View */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/90">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" style={{ color: theme.primary }} />
                    <h3 className="text-sm font-medium text-zinc-200">
                      {currentMonthName} {formatDisplayNumber(year, settings.numeralSystem)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day of Week Header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-zinc-500 mb-2">
                  {settings.language === 'bn' ? (
                    <>
                      <span>রবি</span>
                      <span>সোম</span>
                      <span>মঙ্গল</span>
                      <span>বুধ</span>
                      <span>বৃহ</span>
                      <span>শুক্র</span>
                      <span>শনি</span>
                    </>
                  ) : (
                    <>
                      <span>Sun</span>
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                    </>
                  )}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarDays.map((day, idx) => {
                    if (!day.isCurrentMonth) {
                      return <div key={`empty-${idx}`} className="h-9 sm:h-11" />;
                    }

                    const isSelected = day.dateStr === selectedDateStr;
                    const hasCount = day.count > 0;

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => setSelectedDateStr(day.dateStr)}
                        className={`h-9 sm:h-11 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer text-xs font-bold border ${
                          isSelected
                            ? 'border-white bg-zinc-800 text-white shadow-lg'
                            : hasCount
                            ? 'border-zinc-700/60 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800'
                            : 'border-zinc-800/40 bg-zinc-950/40 text-zinc-500 hover:bg-zinc-900/40 font-medium'
                        }`}
                        style={
                          hasCount && !isSelected
                            ? {
                                borderColor: theme.border.replace('border-', ''),
                              }
                            : undefined
                        }
                      >
                        <span>{formatDisplayNumber(day.dayNumber, settings.numeralSystem)}</span>

                        {/* Activity Dot */}
                        {hasCount && (
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-0.5"
                            style={{ backgroundColor: theme.primary }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Detailed Breakdown */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                      {t.dailyBreakdown}
                    </h4>
                    <p className="text-sm font-medium text-zinc-200 mt-0.5">
                      {formatSelectedDateHuman(selectedDateStr)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 block">{t.total}</span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: selectedDayTotal > 0 ? theme.primary : '#71717a' }}
                    >
                      {formatDisplayNumber(selectedDayTotal, settings.numeralSystem)} {t.timesRecited}
                    </span>
                  </div>
                </div>

                {/* Per-Zikr list for selected date */}
                {selectedDayTotal > 0 && selectedDayRecord?.byZikr ? (
                  <div className="space-y-2 mt-3">
                    {Object.entries(selectedDayRecord.byZikr)
                      .filter(([, count]) => count > 0)
                      .map(([zikrId, count]) => {
                        const matchedZikr = zikrs.find((z) => z.id === zikrId);
                        const zikrName = matchedZikr
                          ? settings.language === 'bn'
                            ? matchedZikr.nameBn
                            : matchedZikr.nameEn
                          : zikrId;
                        const pct = Math.round((count / selectedDayTotal) * 100);

                        return (
                          <div
                            key={zikrId}
                            className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                className="w-4 h-4 opacity-75"
                                style={{ color: theme.primary }}
                              />
                              <span className="text-xs sm:text-sm text-zinc-200 font-medium">
                                {zikrName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-zinc-200 font-bold">
                                {formatDisplayNumber(count, settings.numeralSystem)} {t.timesRecited}
                              </span>
                              <span className="text-zinc-500 font-semibold">({formatDisplayNumber(pct, settings.numeralSystem)}%)</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-zinc-500">
                    {t.noActivityOnDay}
                  </div>
                )}
              </div>

              {/* All-Time Zikr Distribution */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3">
                  সবচেয়ে বেশি পঠিত জিকির (All-Time Breakdown)
                </h4>
                <div className="space-y-2.5">
                  {zikrs
                    .filter((z) => (z.totalCount || 0) > 0)
                    .sort((a, b) => (b.totalCount || 0) - (a.totalCount || 0))
                    .slice(0, 5)
                    .map((z) => {
                      const totalLifetime = stats.lifetimeTotal || 1;
                      const pct = Math.min(100, Math.round(((z.totalCount || 0) / totalLifetime) * 100));
                      const name = settings.language === 'bn' ? z.nameBn : z.nameEn;

                      return (
                        <div key={z.id} className="text-xs">
                          <div className="flex justify-between text-zinc-300 mb-1">
                            <span>{name}</span>
                            <span className="font-bold text-zinc-200">
                              {formatDisplayNumber(z.totalCount || 0, settings.numeralSystem)}{' '}
                              <span className="text-zinc-500 font-semibold">
                                ({formatDisplayNumber(pct, settings.numeralSystem)}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: theme.primary,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                  {stats.lifetimeTotal === 0 && (
                    <div className="text-xs text-zinc-500 text-center py-2">
                      এখনো কোনো জিকির সম্পন্ন করা হয়নি
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
