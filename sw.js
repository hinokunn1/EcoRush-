const CACHE_NAME = 'ecorush-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons-web/icon-192.png',
  './icons-web/icon-512.png',
  './background-ui/home.png',
  './background-ui/map.png',
  './background-ui/title.png',
  './background-ui/game-easy.png',
  './background-ui/game-normal.png',
  './background-ui/game-hard.png',
  './background-ui/game-extreme.png',
  './ui-icons/heart.png',
  './ui-icons/coin.png',
  './ui-icons/play.png',
  './sounds/bgm.mp3',
  './sounds/click.mp3',
  './sounds/correct.mp3',
  './sounds/wrong.mp3',
  './sounds/win.mp3',
  './sounds/lose.mp3',
  './sounds/buy.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate';

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          if (isNavigation) return caches.match('./index.html');
          return new Response('', { status: 504, statusText: 'Offline' });
        });
    })
  );
});
