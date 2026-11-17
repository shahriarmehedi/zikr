'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  ZikrItem,
  AppSettings,
  DailyLogHistory,
  BackupData,
} from '../types/zikr';
import { DEFAULT_AZKAR } from '../data/defaultAzkar';
import { playTapSound, playCelebrationSound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

export function getTodayDateString(): string {
  if (typeof window === 'undefined') {
    return '2026-01-01';
  }
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'bn',
  themeAccent: 'emerald',
  soundEnabled: true,
  soundType: 'wood',
  vibrationEnabled: true,
  numeralSystem: 'bn',
  autoResetTarget: true,
  zenMode: false,
  startDate: '2026-01-01',
  dailyGoal: 300,
};

const STORAGE_KEYS = {
  ZIKRS: 'tasbih_zikrs_v2',
  ACTIVE_ID: 'tasbih_active_id_v2',
  SETTINGS: 'tasbih_settings_v2',
  HISTORY: 'tasbih_history_v2',
};

interface ZikrContextType {
  zikrs: ZikrItem[];
  activeZikr: ZikrItem;
  settings: AppSettings;
  history: DailyLogHistory;
  todayCount: number;
  todayDateStr: string;
  isTargetJustReached: boolean;
  clearTargetCelebration: () => void;
  increment: () => void;
  decrement: () => void;
  resetCurrentCount: () => void;
  selectZikr: (id: string) => void;
  addCustomZikr: (newZikr: Omit<ZikrItem, 'id' | 'count' | 'totalCount' | 'completedLaps' | 'isCustom' | 'createdAt'>) => void;
  editZikr: (id: string, updates: Partial<ZikrItem>) => void;
  deleteZikr: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  stats: {
    lifetimeTotal: number;
    todayTotal: number;
    activeDaysCount: number;
    daysSinceStart: number;
    currentStreak: number;
    bestStreak: number;
    totalLaps: number;
    mostRecitedZikr: ZikrItem | null;
  };
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  clearAllData: () => void;
}

const ZikrContext = createContext<ZikrContextType | undefined>(undefined);

export const ZikrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zikrs, setZikrs] = useState<ZikrItem[]>(DEFAULT_AZKAR);
  const [activeZikrId, setActiveZikrId] = useState<string>(DEFAULT_AZKAR[0].id);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<DailyLogHistory>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTargetJustReached, setIsTargetJustReached] = useState(false);
  const [clientDateStr, setClientDateStr] = useState<string>('2026-01-01');

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const today = getTodayDateString();
      setClientDateStr(today);

      const storedZikrs = localStorage.getItem(STORAGE_KEYS.ZIKRS);
      const storedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);

      if (storedZikrs) {
        const parsed = JSON.parse(storedZikrs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setZikrs(parsed);
        }
      }

      if (storedActiveId) {
        setActiveZikrId(storedActiveId);
      }

      if (storedSettings) {
        setSettings((prev) => ({
          ...prev,
          ...JSON.parse(storedSettings),
        }));
      } else {
        const initialSettings = { ...DEFAULT_SETTINGS, startDate: today };
        setSettings(initialSettings);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
      }

      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage on updates (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ZIKRS, JSON.stringify(zikrs));
    } catch (e) {
      console.error(e);
    }
  }, [zikrs, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeZikrId);
    } catch (e) {
      console.error(e);
    }
  }, [activeZikrId, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history, isLoaded]);

  const activeZikr = useMemo(() => {
    return zikrs.find((z) => z.id === activeZikrId) || zikrs[0] || DEFAULT_AZKAR[0];
  }, [zikrs, activeZikrId]);

  const todayCount = history[clientDateStr]?.total || 0;

  const clearTargetCelebration = useCallback(() => {
    setIsTargetJustReached(false);
  }, []);

  // Increment counter with audio, haptic, and calendar log
  const increment = useCallback(() => {
    const today = getTodayDateString();

    // Sound & Haptic
    if (settings.soundEnabled) {
      playTapSound(settings.soundType);
    }
    if (settings.vibrationEnabled) {
      triggerHaptic('tap');
    }

    setZikrs((prevZikrs) => {
      return prevZikrs.map((item) => {
        if (item.id !== activeZikrId) return item;

        const newCount = item.count + 1;
        const newTotalCount = (item.totalCount || 0) + 1;
        const target = item.target;

        let completedLaps = item.completedLaps || 0;
        let finalCount = newCount;

        // Check target hit
        if (target > 0 && newCount >= target) {
          setIsTargetJustReached(true);
          playCelebrationSound();
          if (settings.vibrationEnabled) {
            triggerHaptic('target');
          }

          if (settings.autoResetTarget) {
            completedLaps += 1;
            finalCount = 0;
          }
        }

        return {
          ...item,
          count: finalCount,
          totalCount: newTotalCount,
          completedLaps,
        };
      });
    });

    // Update Daily Calendar History
    setHistory((prevHistory) => {
      const currentDay = prevHistory[today] || {
        date: today,
        total: 0,
        byZikr: {},
      };

      const prevZikrDayCount = currentDay.byZikr[activeZikrId] || 0;

      return {
        ...prevHistory,
        [today]: {
          date: today,
          total: currentDay.total + 1,
          byZikr: {
            ...currentDay.byZikr,
            [activeZikrId]: prevZikrDayCount + 1,
          },
        },
      };
    });
  }, [activeZikrId, settings]);

  // Decrement if mistapped
  const decrement = useCallback(() => {
    const today = getTodayDateString();

    setZikrs((prev) =>
      prev.map((item) => {
        if (item.id !== activeZikrId || item.count <= 0) return item;
        return {
          ...item,
          count: item.count - 1,
          totalCount: Math.max(0, (item.totalCount || 0) - 1),
        };
      })
    );

    setHistory((prev) => {
      const currentDay = prev[today];
      if (!currentDay || currentDay.total <= 0) return prev;

      const zikrCnt = currentDay.byZikr[activeZikrId] || 0;
      return {
        ...prev,
        [today]: {
          ...currentDay,
          total: Math.max(0, currentDay.total - 1),
          byZikr: {
            ...currentDay.byZikr,
            [activeZikrId]: Math.max(0, zikrCnt - 1),
          },
        },
      };
    });
  }, [activeZikrId]);

  // Reset count of current active zikr
  const resetCurrentCount = useCallback(() => {
    setZikrs((prev) =>
      prev.map((item) => (item.id === activeZikrId ? { ...item, count: 0 } : item))
    );
  }, [activeZikrId]);

  // Select zikr
  const selectZikr = useCallback((id: string) => {
    setActiveZikrId(id);
    setIsTargetJustReached(false);
  }, []);

  // Add custom zikr
  const addCustomZikr = useCallback(
    (newZikr: Omit<ZikrItem, 'id' | 'count' | 'totalCount' | 'completedLaps' | 'isCustom' | 'createdAt'>) => {
      const id = 'custom_' + Date.now();
      const zikrToAdd: ZikrItem = {
        ...newZikr,
        id,
        count: 0,
        totalCount: 0,
        completedLaps: 0,
        isCustom: true,
        createdAt: getTodayDateString(),
      };

      setZikrs((prev) => [...prev, zikrToAdd]);
      setActiveZikrId(id);
    },
    []
  );

  // Edit zikr
  const editZikr = useCallback((id: string, updates: Partial<ZikrItem>) => {
    setZikrs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Delete custom zikr
  const deleteZikr = useCallback(
    (id: string) => {
      setZikrs((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        if (activeZikrId === id) {
          setActiveZikrId(filtered[0]?.id || DEFAULT_AZKAR[0].id);
        }
        return filtered;
      });
    },
    [activeZikrId]
  );

  // Update Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Compute analytics & streaks
  const stats = useMemo(() => {
    const datesWithActivity = Object.keys(history).filter((d) => (history[d]?.total || 0) > 0);
    const activeDaysCount = datesWithActivity.length;

    let lifetimeTotal = 0;
    let totalLaps = 0;
    let mostRecitedZikr: ZikrItem | null = null;
    let maxRecitedCount = -1;

    zikrs.forEach((z) => {
      lifetimeTotal += z.totalCount || 0;
      totalLaps += z.completedLaps || 0;
      if ((z.totalCount || 0) > maxRecitedCount) {
        maxRecitedCount = z.totalCount || 0;
        mostRecitedZikr = z;
      }
    });

    if (!isLoaded || typeof window === 'undefined') {
      return {
        lifetimeTotal,
        todayTotal: 0,
        activeDaysCount,
        daysSinceStart: 1,
        currentStreak: 0,
        bestStreak: 0,
        totalLaps,
        mostRecitedZikr,
      };
    }

    // Days since start
    const start = new Date(settings.startDate || '2026-01-01');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const daysSinceStart = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Calculate Streak
    const sortedDates = [...datesWithActivity].sort();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkDate = new Date(today);
      const todayFormatted = clientDateStr;

      let hasZikrToday = (history[todayFormatted]?.total || 0) > 0;
      if (!hasZikrToday) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const y = checkDate.getFullYear();
        const m = String(checkDate.getMonth() + 1).padStart(2, '0');
        const d = String(checkDate.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;

        if ((history[dStr]?.total || 0) > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      let prevDateObj: Date | null = null;
      for (const dStr of sortedDates) {
        const parts = dStr.split('-').map(Number);
        const curDateObj = new Date(parts[0], parts[1] - 1, parts[2]);

        if (!prevDateObj) {
          tempStreak = 1;
        } else {
          const diffDays = Math.round(
            (curDateObj.getTime() - prevDateObj.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        prevDateObj = curDateObj;
      }
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    return {
      lifetimeTotal,
      todayTotal: todayCount,
      activeDaysCount,
      daysSinceStart,
      currentStreak,
      bestStreak,
      totalLaps,
      mostRecitedZikr,
    };
  }, [history, zikrs, settings.startDate, todayCount, isLoaded, clientDateStr]);

  // Export JSON Backup
  const exportData = useCallback((): string => {
    const backup: BackupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      zikrs,
      activeZikrId,
      history,
      settings,
    };
    return JSON.stringify(backup, null, 2);
  }, [zikrs, activeZikrId, history, settings]);

  // Import JSON Backup
  const importData = useCallback((jsonStr: string): boolean => {
    try {
      const data: BackupData = JSON.parse(jsonStr);
      if (data.zikrs && Array.isArray(data.zikrs)) {
        setZikrs(data.zikrs);
        if (data.activeZikrId) setActiveZikrId(data.activeZikrId);
        if (data.history) setHistory(data.history);
        if (data.settings) setSettings(data.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Erase all data
  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ZIKRS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);

    setZikrs(DEFAULT_AZKAR);
    setActiveZikrId(DEFAULT_AZKAR[0].id);
    const resetSettings = { ...DEFAULT_SETTINGS, startDate: getTodayDateString() };
    setSettings(resetSettings);
    setHistory({});
  }, []);

  return (
    <ZikrContext.Provider
      value={{
        zikrs,
        activeZikr,
        settings,
        history,
        todayCount,
        todayDateStr: clientDateStr,
        isTargetJustReached,
        clearTargetCelebration,
        increment,
        decrement,
        resetCurrentCount,
        selectZikr,
        addCustomZikr,
        editZikr,
        deleteZikr,
        updateSettings,
        stats,
        exportData,
        importData,
        clearAllData,
      }}
    >
      {children}
    </ZikrContext.Provider>
  );
};

export function useZikr() {
  const context = useContext(ZikrContext);
  if (!context) {
    throw new Error('useZikr must be used within a ZikrProvider');
  }
  return context;
}
