const CACHE_NAME = 'shopping-list-cache-v2';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './css/styles.css',
  './js/app.js',
  './js/idb.js',
  './manifest.json'
];


// Adres API pogodowego
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

self.addEventListener('install', evt => {
  console.log('[ServiceWorker] Install');
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  console.log('[ServiceWorker] Activate');
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const requestUrl = new URL(evt.request.url);

  // Obsługa zapytań do OpenWeather API
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

  // Obsługa nawigacji (np. wpisywanie URL w pasku adresu)
  if (evt.request.mode === 'navigate') {
    evt.respondWith(
      fetch(evt.request).catch(() => caches.match('/Shopping_list/offline.html'))
    );
    return;
  }

  // Obsługa pozostałych zasobów (CSS, JS, HTML, manifest)
  evt.respondWith(
    caches.match(evt.request).then(response => {
      return response || fetch(evt.request);
    })
  );
});
