// Basic service worker for offline caching (Tailwind PWA)
const CACHE = 'job-tracker-tailwind-v2';
const FILES = [
  '.',
  'index.html',
  'app.js',
  'manifest.json',
  'default_jobs.json',
  'assets/icons/app-icon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if(k !== CACHE) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  if(evt.request.method !== 'GET') return;
  evt.respondWith(
    caches.match(evt.request).then(resp => {
      return resp || fetch(evt.request).then(fetchResp=>{
        return caches.open(CACHE).then(cache=>{
          try{ cache.put(evt.request, fetchResp.clone()); }catch(e){}
          return fetchResp;
        });
      }).catch(()=> caches.match('index.html'));
    })
  );
});
