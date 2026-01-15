const CACHE_NAME = 'tananyag-v1';

// Files to cache
const STATIC_FILES = [
  '/tananyag/',
  '/tananyag/index.html',
  '/tananyag/manifest.json',
  '/tananyag/icon-192.png',
  '/tananyag/icon-512.png',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// Chapter folders to cache
const CHAPTERS = [
  '02-Vezeteselmellet_altalanos_ismeretek',
  '03-Harcaszat',
  '04-Torzsszolgalati_ismeretek',
  '05-Harci_tamogatas',
  '06-Harci_kiszolgalo_tamogatas',
  '07-Katonai_tereptan',
  '08-MH_haditechnikai_eszkozei'
];

// Install event - cache static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching static files');
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network, then cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the fetched response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // If both cache and network fail, return a fallback for HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/tananyag/index.html');
        }
      });
    })
  );
});
