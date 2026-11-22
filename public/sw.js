const CACHE_NAME = 'champions-quiz-offline-v3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/appcreator24.html',
  '/standalone-index.html',
];

const STATIC_EXT_RE = /\.(?:js|css|html|json|webmanifest|svg|png|jpg|jpeg|webp|ico|woff2?|ttf|mp3|wav|ogg|m4a)(?:\?.*)?$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(new Request(url, { cache: 'reload' }))
              .then((res) => {
                if (res && res.ok) {
                  return cache.put(url, res.clone());
                }
                return undefined;
              })
              .catch(() => undefined)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key.startsWith('champions-quiz-')) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!request || request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip browser extensions or non-http schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never cache live multiplayer, WebRTC signaling, TTS, or WebSocket routes
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/ws') ||
      url.pathname.startsWith('/download-index'))
  ) {
    return;
  }

  // Navigation requests (opening or refreshing the app):
  // Serve network-first when online (and update cache), instant Cache fallback when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy).catch(() => {});
              if (url.pathname === '/' || url.pathname === '/index.html') {
                cache.put('/index.html', networkResponse.clone()).catch(() => {});
              }
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const exactMatch = await cache.match(request, { ignoreSearch: true });
          if (exactMatch) return exactMatch;

          if (url.pathname.includes('appcreator24')) {
            const appCreatorMatch = await cache.match('/appcreator24.html');
            if (appCreatorMatch) return appCreatorMatch;
          }
          if (url.pathname.includes('standalone-index')) {
            const standaloneMatch = await cache.match('/standalone-index.html');
            if (standaloneMatch) return standaloneMatch;
          }

          return (
            (await cache.match('/index.html')) ||
            (await cache.match('/')) ||
            new Response('Offline cache unavailable', { status: 503, statusText: 'Offline' })
          );
        })
    );
    return;
  }

  // Static app assets (JS, CSS, Audio, Images, Fonts): Cache-first with background refresh
  const isSameOriginAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/src/') ||
      url.pathname.startsWith('/@vite/') ||
      STATIC_EXT_RE.test(url.pathname));

  const isFontCdn =
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (isSameOriginAsset || isFontCdn) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request, { ignoreSearch: false });
        if (cached) {
          // Stale-while-revalidate when online
          if (typeof navigator === 'undefined' || navigator.onLine !== false) {
            fetch(request)
              .then((fresh) => {
                if (fresh && (fresh.ok || fresh.type === 'opaque')) {
                  cache.put(request, fresh.clone()).catch(() => {});
                }
              })
              .catch(() => {});
          }
          return cached;
        }

        try {
          const networkRes = await fetch(request);
          if (networkRes && (networkRes.ok || networkRes.type === 'opaque')) {
            cache.put(request, networkRes.clone()).catch(() => {});
          }
          return networkRes;
        } catch {
          return (
            (await cache.match(request, { ignoreSearch: true })) ||
            new Response('', { status: 504, statusText: 'Offline Asset' })
          );
        }
      })
    );
  }
});
