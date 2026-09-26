const CACHE = 'maxtracer-brand-v6';
const SHELL = ['./', './index.html', './manifest.webmanifest', './max-trace-logo.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put('./index.html', res.clone()));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  if (u.origin === location.origin) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put(r, res.clone()));
      return res;
    })));
  }
});
