export const ROUTE_CHANGE_EVENT = 'peakspor:routechange';

export function navigateToPath(pathname) {
  const nextPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, '', nextPath);
  }
  window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}
