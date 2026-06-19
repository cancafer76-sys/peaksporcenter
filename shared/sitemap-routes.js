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

export const REGIONAL_SITEMAP_PATHS = [
  '/kocaeli-spor-salonu',
  '/gebze-spor-salonu',
  '/cayirova-spor-salonu',
  '/darica-spor-salonu',
  '/dilovasi-spor-salonu',
  '/izmit-spor-salonu',
  '/pendik-spor-salonu',
  '/tuzla-spor-salonu',
  '/kartal-spor-salonu'
];

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
