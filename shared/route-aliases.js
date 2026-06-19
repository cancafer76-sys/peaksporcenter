export const ROUTE_ALIASES = {
  '/hizmetler': '/services',
  '/paketler': '/packages',
  '/galeri': '/gallery',
  '/hocalarimiz': '/trainers',
  '/hakkimizda': '/about',
  '/iletisim': '/contact'
};

export function normalizePathname(pathname = '/') {
  return ROUTE_ALIASES[pathname] || pathname;
}
