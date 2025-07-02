const CACHE_NAME = 'shopping-list-cache-v2';

const FILES_TO_CACHE = [
  '/Shopping_list/',
  '/Shopping_list/index.html',
  '/Shopping_list/offline.html',
  '/Shopping_list/css/styles.css',
  '/Shopping_list/js/app.js',
  '/Shopping_list/js/idb.js',
  '/Shopping_list/manifest.json'
];

// Poprawna domena API
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  // Obsługa API (strategia stale-while-revalidate)
  if (evt.request.url.startsWith(API_URL)) {
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        fetch(evt.request)
          .then(response => {
            cache.put(evt.request, response.clone());
            return response;
          })
          .catch(() => cache.match(evt.request))
      )
    );
    return;
  }

  // Obsługa nawigacji (fallback do offline.html)
  if (evt.request.mode === 'navigate') {
    evt.respondWith(
      fetch(evt.request).catch(() =>
        caches.match('/Shopping_list/offline.html')
      )
    );
    return;
  }

  // Cache static assets
  evt.respondWith(
    caches.match(evt.request).then(cachedResponse => {
      return cachedResponse || fetch(evt.request);
    })
  );
});

console.log('Service Worker instalowany...');
self.addEventListener('install', evt => {
  console.log('Caching:', FILES_TO_CACHE);
  ...
});

self.addEventListener('fetch', evt => {
  console.log('Fetch request:', evt.request.url);
});
