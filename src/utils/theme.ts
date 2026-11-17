import { ThemeAccent } from '../types/zikr';

export interface ThemeColors {
  primary: string;
  glow: string;
  bgLight: string;
  text: string;
  border: string;
  ring: string;
}

export const THEME_CONFIG: Record<ThemeAccent, ThemeColors> = {
  emerald: {
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    bgLight: 'rgba(16, 185, 129, 0.08)',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/40',
  },
  amber: {
    primary: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.25)',
    bgLight: 'rgba(251, 191, 36, 0.08)',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500/40',
  },
  silver: {
    primary: '#e4e4e7',
    glow: 'rgba(228, 228, 231, 0.22)',
    bgLight: 'rgba(228, 228, 231, 0.08)',
    text: 'text-zinc-200',
    border: 'border-zinc-500/30',
    ring: 'ring-zinc-400/40',
  },
  cyan: {
    primary: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.25)',
    bgLight: 'rgba(34, 211, 238, 0.08)',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    ring: 'ring-cyan-500/40',
  },
};
