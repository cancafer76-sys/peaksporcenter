import { defaultContent } from './defaults.js';

function normalizeHex(hex, fallback = '#FFFFFF') {
  if (!hex) return fallback;
  const value = String(hex).trim();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return fallback;
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

export const MONOCHROME_DARK = {
  monochrome: true,
  primary: '#FFFFFF',
  secondary: '#E5E5E5',
  accentLight: '#FFFFFF',
  background: '#000000',
  surface: '#0A0A0A',
  panel: '#141414',
  text: '#FFFFFF',
  muted: '#B3B3B3'
};

export const MONOCHROME_LIGHT = {
  monochrome: true,
  primary: '#000000',
  secondary: '#262626',
  accentLight: '#404040',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  panel: '#FFFFFF',
  text: '#000000',
  muted: '#525252'
};

export const themePresets = {
  monochrome: {
    label: 'Siyah Beyaz (Varsayılan)',
    theme: { ...MONOCHROME_DARK }
  },
  green: {
    label: 'Yeşil Tema',
    theme: {
      monochrome: false,
      primary: '#7CFF4F',
      secondary: '#22C55E',
      accentLight: '#d7ff8a',
      background: '#050505',
      surface: '#0D1117',
      panel: '#111827',
      text: '#FFFFFF',
      muted: '#9CA3AF'
    }
  },
  red: {
    label: 'Kırmızı Tema',
    theme: {
      monochrome: false,
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
      monochrome: false,
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
      monochrome: false,
      primary: '#ef4444',
      secondary: '#b91c1c',
      accentLight: '#f87171',
      background: '#000000',
      surface: '#0a0a0a',
      panel: '#111111',
      text: '#f5f5f5',
      muted: '#737373'
    }
  }
};

export function mergeTheme(theme = {}) {
  return {
    ...defaultContent.theme,
    ...(theme || {})
  };
}

function resolveThemePalette(theme, darkMode) {
  const merged = mergeTheme(theme);
  const useMono = merged.monochrome !== false;

  if (useMono) {
    return darkMode ? { ...MONOCHROME_DARK } : { ...MONOCHROME_LIGHT };
  }

  if (darkMode) {
    return merged;
  }

  return {
    ...merged,
    background: '#FFFFFF',
    surface: '#F5F5F5',
    panel: '#FFFFFF',
    text: '#000000',
    muted: '#525252'
  };
}

export function applySiteTheme(themeInput = {}, options = {}) {
  const { darkMode = true } = options;
  const palette = resolveThemePalette(themeInput, darkMode);
  const root = document.documentElement;
  const body = document.body;

  const primary = normalizeHex(palette.primary, darkMode ? '#FFFFFF' : '#000000');
  const secondary = normalizeHex(palette.secondary || palette.primary, darkMode ? '#E5E5E5' : '#262626');
  const accentLight = normalizeHex(palette.accentLight || primary);
  const background = palette.background;
  const surface = palette.surface;
  const panel = palette.panel;
  const text = palette.text;
  const muted = palette.muted;
  const line = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';

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
  root.style.setProperty('--line', line);
  root.style.setProperty('--animation-accent', primary);
  root.style.setProperty('--animation-accent-light', accentLight);
  root.style.setProperty('--shadow', darkMode ? '0 20px 60px rgba(0, 0, 0, 0.45)' : '0 20px 40px rgba(0, 0, 0, 0.08)');

  root.style.background = background;
  body.style.background = background;
  body.style.color = text;

  root.classList.toggle('theme-light', !darkMode);
  document.querySelector('.app-shell')?.classList.toggle('light', !darkMode);
}
