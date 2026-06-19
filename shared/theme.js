import { defaultContent } from './defaults.js';

function normalizeHex(hex) {
  if (!hex) return '#7cff4f';
  const value = String(hex).trim();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return '#7cff4f';
}

export function hexToRgbString(hex) {
  const clean = normalizeHex(hex).slice(1);
  const num = parseInt(clean, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function mixHex(hex, target, ratio = 0.35) {
  const a = normalizeHex(hex).slice(1);
  const b = normalizeHex(target).slice(1);
  const ar = parseInt(a, 16);
  const br = parseInt(b, 16);
  const mix = channel =>
    Math.round(((ar >> channel) & 255) * (1 - ratio) + ((br >> channel) & 255) * ratio);
  const next = (mix(16) << 16) | (mix(8) << 8) | mix(0);
  return `#${next.toString(16).padStart(6, '0')}`;
}

export function lightenHex(hex, ratio = 0.28) {
  return mixHex(hex, '#ffffff', ratio);
}

export const themePresets = {
  green: {
    label: 'Yeşil (Varsayılan)',
    theme: { ...defaultContent.theme }
  },
  red: {
    label: 'Kırmızı Tema',
    theme: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accentLight: '#fca5a5',
      background: '#0a0a0a',
      surface: '#111111',
      panel: '#171717',
      text: '#ffffff',
      muted: '#a3a3a3'
    }
  },
  blue: {
    label: 'Mavi Tema',
    theme: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      accentLight: '#93c5fd',
      background: '#050505',
      surface: '#0d1117',
      panel: '#111827',
      text: '#ffffff',
      muted: '#9ca3af'
    }
  },
  black: {
    label: 'Siyah + Kırmızı',
    theme: {
      primary: '#ef4444',
      secondary: '#b91c1c',
      accentLight: '#f87171',
      background: '#000000',
      surface: '#0a0a0a',
      panel: '#111111',
      text: '#f5f5f5',
      muted: '#737373'
    }
  },
  gold: {
    label: 'Altın Tema',
    theme: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accentLight: '#fcd34d',
      background: '#0b0b0b',
      surface: '#141414',
      panel: '#1c1c1c',
      text: '#ffffff',
      muted: '#a3a3a3'
    }
  }
};

export function mergeTheme(theme = {}) {
  return {
    ...defaultContent.theme,
    ...(theme || {})
  };
}

export function applySiteTheme(themeInput = {}, options = {}) {
  const theme = mergeTheme(themeInput);
  const { darkMode = true } = options;
  const root = document.documentElement;
  const body = document.body;

  const primary = normalizeHex(theme.primary);
  const secondary = normalizeHex(theme.secondary || theme.primary);
  const accentLight = normalizeHex(theme.accentLight || lightenHex(primary));
  const background = theme.background || (darkMode ? '#050505' : '#f5f7fa');
  const surface = theme.surface || (darkMode ? '#0d1117' : '#ffffff');
  const panel = theme.panel || (darkMode ? '#111827' : '#ffffff');
  const text = theme.text || (darkMode ? '#ffffff' : '#0f172a');
  const muted = theme.muted || (darkMode ? '#9ca3af' : '#64748b');

  root.style.setProperty('--accent', primary);
  root.style.setProperty('--green', primary);
  root.style.setProperty('--accent-2', secondary);
  root.style.setProperty('--green-strong', secondary);
  root.style.setProperty('--accent-light', accentLight);
  root.style.setProperty('--accent-rgb', hexToRgbString(primary));
  root.style.setProperty('--bg', background);
  root.style.setProperty('--bg-2', surface);
  root.style.setProperty('--surface', surface);
  root.style.setProperty('--panel-solid', panel);
  root.style.setProperty('--panel', panel);
  root.style.setProperty('--panel-2', mixHex(panel, background, 0.35));
  root.style.setProperty('--text', text);
  root.style.setProperty('--muted', muted);
  root.style.setProperty('--line', darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)');
  root.style.setProperty('--animation-accent', primary);
  root.style.setProperty('--animation-accent-light', accentLight);

  root.style.background = background;
  body.style.background = background;
  body.style.color = text;

  root.classList.toggle('theme-light', !darkMode);
}
