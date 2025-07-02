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

const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  if (evt.request.url.startsWith(API_URL)) {
    // Strategia stale-while-revalidate dla API
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

  if (evt.request.mode === 'navigate') {
    evt.respondWith(
      fetch(evt.request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then(cachedResponse => {
      return cachedResponse || fetch(evt.request);
    })
  );
});
