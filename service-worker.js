// A simple service worker to allow "Add to Home Screen"
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch handler
  event.respondWith(fetch(event.request));
});