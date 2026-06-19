import { useEffect } from 'react';

let initialized = false;

function getMeasurementId() {
  return import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.GA_MEASUREMENT_ID || '';
}

export function initGoogleAnalytics() {
  const measurementId = getMeasurementId();
  if (!measurementId || initialized || typeof window === 'undefined') return;

  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
}

export function trackPageView(pathname) {
  const measurementId = getMeasurementId();
  if (!measurementId || typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: pathname,
    page_location: window.location.href,
    page_title: document.title
  });
}

export function useGoogleAnalytics(pathname) {
  useEffect(() => {
    initGoogleAnalytics();
    trackPageView(pathname);
  }, [pathname]);
}
