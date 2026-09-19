/* Micelio Catalunya — service worker (PWA, offline)
   Xarxa primer (el parte canvia cada dia); si no hi ha xarxa, l'última
   còpia guardada. Només cau la pàgina: les tessel·les i les dades ja van
   incrustades dins l'HTML. */
const CACHE = 'micelio-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // OSM, satèl·lit: passa de llarg
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      const net = await fetch(req, { signal: ctrl.signal });
      clearTimeout(t);
      if (net && net.ok) c.put(req, net.clone());
      return net;
    } catch (err) {
      const cached = await c.match(req, { ignoreSearch: true });
      if (cached) return cached;
      throw err;
    }
  })());
});
