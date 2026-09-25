const CACHE = 'isaan-devtools-v18';
const STATIC_ASSETS = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/images/favicon.svg',
  './manifest.json',
];

self.addEventListener('install', e => {
  // cache: 'reload' skips the HTTP cache (GitHub Pages sends max-age=600), so a new CACHE never
  // gets filled with the previous deploy's files
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS.map(u => new Request(u, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Let CDN/external requests (fonts, jsdiff) fall through to network
  if (!e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Network-first for the page itself, so a new deploy shows on the first reload; cached copy when offline.
  // A navigate-mode Request can't take init options, hence fetching by URL.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() =>
        caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))
      )
    );
    return;
  }
  // Cache-first for same-origin assets (refreshed by bumping CACHE on each release)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
