import { ALL_REGIONAL_PATHS } from './local-areas.js';

export const SITE_URL = 'https://peaksportcenter.online';

export const MAIN_SITEMAP_PATHS = [
  '/',
  '/hizmetler',
  '/paketler',
  '/galeri',
  '/hocalarimiz',
  '/hakkimizda',
  '/iletisim'
];

export const APP_ROUTE_PATHS = [
  '/services',
  '/packages',
  '/gallery',
  '/trainers',
  '/about',
  '/contact',
  '/explore'
];

export const REGIONAL_SITEMAP_PATHS = ALL_REGIONAL_PATHS;

export const ALL_SITEMAP_PATHS = [
  ...new Set([...MAIN_SITEMAP_PATHS, ...APP_ROUTE_PATHS, ...REGIONAL_SITEMAP_PATHS])
];

export function getSitemapPriority(path) {
  if (path === '/') return '1.0';
  if (MAIN_SITEMAP_PATHS.includes(path)) return '0.9';
  if (REGIONAL_SITEMAP_PATHS.includes(path)) return '0.8';
  return '0.7';
}

export function getSitemapChangeFreq(path) {
  if (path === '/') return 'weekly';
  if (REGIONAL_SITEMAP_PATHS.includes(path)) return 'monthly';
  if (path === '/iletisim' || path === '/contact') return 'monthly';
  return 'weekly';
}
