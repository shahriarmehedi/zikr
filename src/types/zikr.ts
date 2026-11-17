export interface ZikrItem {
  id: string;
  nameBn: string;
  nameEn: string;
  arabic?: string;
  transliterationBn?: string;
  transliterationEn?: string;
  meaningBn?: string;
  meaningEn?: string;
  target: number; // e.g. 33, 100, or 0 for unlimited / free count
  count: number;
  totalCount: number; // lifetime count for this specific zikr
  completedLaps: number; // how many times target has been achieved
  isCustom: boolean;
  createdAt: string;
}

export interface DayZikrRecord {
  date: string; // YYYY-MM-DD
  total: number;
  byZikr: Record<string, number>; // zikrId -> count
}

export type ThemeAccent = 'emerald' | 'amber' | 'silver' | 'cyan';
export type SoundType = 'wood' | 'click' | 'bell' | 'water';
export type NumeralSystem = 'bn' | 'en';

export interface AppSettings {
  language: 'bn' | 'en';
  themeAccent: ThemeAccent;
  soundEnabled: boolean;
  soundType: SoundType;
  vibrationEnabled: boolean;
  numeralSystem: NumeralSystem;
  autoResetTarget: boolean; // whether to loop back to 0 and +1 lap when target is reached
  zenMode: boolean;
  startDate: string; // YYYY-MM-DD
  dailyGoal: number; // e.g. 300
}

export interface DailyLogHistory {
  [date: string]: DayZikrRecord;
}

export interface BackupData {
  version: number;
  exportDate: string;
  zikrs: ZikrItem[];
  activeZikrId: string;
  history: DailyLogHistory;
  settings: AppSettings;
}
