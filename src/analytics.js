import { useEffect } from 'react';

let initialized = false;
let initPromise = null;
let measurementId = '';

function readEnvMeasurementId() {
  return import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.GA_MEASUREMENT_ID || '';
}

async function resolveMeasurementId() {
  const fromEnv = readEnvMeasurementId();
  if (fromEnv) return fromEnv;

  try {
    const response = await fetch('/api/public-config');
    if (!response.ok) return '';
    const data = await response.json();
    return data.gaMeasurementId || '';
  } catch {
    return '';
  }
}

export async function initGoogleAnalytics() {
  if (initialized) return measurementId;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    measurementId = await resolveMeasurementId();
    if (!measurementId || typeof window === 'undefined') return '';

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }).catch(() => undefined);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });
    initialized = true;
    return measurementId;
  })();

  return initPromise;
}

export function trackPageView(pathname) {
  if (!measurementId || typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: pathname,
    page_location: window.location.href,
    page_title: document.title
  });
}

export function useGoogleAnalytics(pathname) {
  useEffect(() => {
    let active = true;

    initGoogleAnalytics().then(() => {
      if (active) trackPageView(pathname);
    });

    return () => {
      active = false;
    };
  }, [pathname]);
}
