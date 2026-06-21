let deferredPrompt = null;
const listeners = new Set();

function notify() {
  listeners.forEach(listener => listener());
}

export function initPwaInstall() {
  if (typeof window === 'undefined' || window.__peaksporPwaInit) return;
  window.__peaksporPwaInit = true;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function subscribePwaInstall(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDeferredPwaPrompt() {
  return deferredPrompt;
}

export function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export async function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
    if (choice.outcome === 'accepted') {
      deferredPrompt = null;
      notify();
    }
    return true;
  }

  if (isIosDevice()) {
    window.alert('Safari menüsünden Paylaş > Ana Ekrana Ekle seçeneğini kullanın.');
    return true;
  }

  window.alert('Tarayıcı menüsünden "Uygulamayı yükle" veya "Ana ekrana ekle" seçeneğini kullanın.');
  return false;
}
