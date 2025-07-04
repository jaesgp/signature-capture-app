const CACHE_NAME = 'signature-app-v2'; // Increment cache version if you make changes
const urlsToCache = [
  '/', // Caches the root (which often redirects to index.html)
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png', // Ensure these match your actual icon filenames
  '/icon-512x512.png', // Ensure these match your actual icon filenames
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

// Install event: caches all necessary assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache URLs:', error);
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    })
  );
  // Ensure the service worker takes control of clients immediately
  return self.clients.claim();
});

// Fetch event: serves cached assets when offline
self.addEventListener('fetch', (event) => {
  // Respond with cached asset if available, otherwise fetch from network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request);
      })
      .catch(error => {
        console.error('[Service Worker] Fetch failed:', error);
        // Optionally, return an offline fallback page if the request fails
        // return caches.match('/offline.html');
      })
  );
});
