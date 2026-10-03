const CACHE = 'esan-devtools-v25';
const STATIC_ASSETS = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/core.js',
  './assets/js/tools/mock-data.js',
  './assets/js/tools/sql.js',
  './assets/js/tools/diff.js',
  './assets/js/tools/json.js',
  './assets/js/tools/unix.js',
  './assets/js/tools/base64.js',
  './assets/js/tools/cron.js',
  './assets/js/tools/regex.js',
  './assets/js/tools/numbase.js',
  './assets/js/tools/hash.js',
  './assets/js/tools/jwt.js',
  './assets/js/tools/url.js',
  './assets/js/tools/color-picker.js',
  './assets/js/tools/cheatsheets.js',
  './assets/js/tools/http-status.js',
  './assets/js/tools/image-color-picker.js',
  './assets/js/tools/rxjs.js',
  './assets/js/tools/angular.js',
  './assets/js/tools/mq.js',
  './assets/js/tools/storage.js',
  './assets/js/tools/lov.js',
  './assets/js/tools/k8s-secret.js',
  './assets/js/init.js',
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
  // Network-first for same-origin assets too, revalidated against the server (an unchanged file costs a 304).
  // Cache-first used to serve the previous deploy's app.js/style.css under the new page on the first load
  // after a release; the cache is now only the offline fallback.
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
