// Passive Service Worker for PWA Installation criteria
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through standard network requests
  event.respondWith(fetch(event.request));
});
