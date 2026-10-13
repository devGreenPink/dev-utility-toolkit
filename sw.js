const CACHE = 'esan-devtools-v2.0';
// CDN files: every URL pins an exact version, so this cache can outlive app releases (fonts' CSS is re-checked)
const CDN_CACHE = 'esan-devtools-cdn';
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
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
  './assets/js/tools/refdocs.js',
  './assets/js/tools/sql-ref.js',
  './assets/js/tools/db2-errors.js',
  './assets/js/tools/java-exceptions.js',
  './assets/js/tools/java-internals.js',
  './assets/js/tools/stacktrace.js',
  './assets/js/tools/json2type.js',
  './assets/js/tools/props-yaml.js',
  './assets/js/tools/thai-tools.js',
  './assets/js/tools/k8s-ref.js',
  './assets/js/tools/gateway.js',
  './assets/js/tools/jenkins.js',
  './assets/js/tools/qr.js',
  './assets/js/tools/ngrx.js',
  './assets/js/tools/home.js',
  './assets/js/init.js',
  './assets/tabs/mq-tab.html',
  './assets/tabs/storage-tab.html',
  './assets/tabs/rxjs-tab.html',
  './assets/tabs/esan-agent-tab.html',
  './assets/tabs/angular-tab.html',
  './assets/images/logo.png',
  './assets/images/icon-192.png',
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
      Promise.all(keys.filter(k => k !== CACHE && k !== CDN_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET' || !CDN_HOSTS.includes(url.hostname)) return; // anything else: straight to the network
    // pinned library versions: cache first; the Google Fonts stylesheet: network first. Only CORS responses are kept
    // (an opaque one counts as megabytes against the storage quota).
    e.respondWith(caches.open(CDN_CACHE).then(async c => {
      // ignoreVary: the CDNs send "Vary: Accept-Encoding", and a precached entry (stored with a bare URL) would never
      // match a <script> request's headers; the URL alone identifies the file
      const hit = await c.match(e.request, { ignoreVary: true });
      if (hit && url.hostname !== 'fonts.googleapis.com') return hit;
      try {
        const res = await fetch(e.request);
        if (res.ok && res.type === 'cors') c.put(e.request, res.clone());
        return res;
      } catch (err) {
        return hit || Response.error();
      }
    }));
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

// The page sends its lazily loaded library URLs (LIBS in core.js) once it is idle, so tools whose library
// was never opened online still work offline later.
self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'precache-cdn' || !Array.isArray(e.data.urls)) return;
  const urls = e.data.urls.filter(u => { try { return CDN_HOSTS.includes(new URL(u).hostname); } catch (err) { return false; } });
  e.waitUntil(caches.open(CDN_CACHE).then(c => Promise.all(urls.map(async u => {
    if (await c.match(u, { ignoreVary: true })) return;
    try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) await c.put(u, r); } catch (err) {}
  }))));
});
