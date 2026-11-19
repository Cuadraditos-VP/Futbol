// Service worker: permite instalar la app y abrirla aunque no haya señal.
// Cambiá la versión cuando subas archivos nuevos para forzar la actualización.
const VERSION = "futbol-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./favicon.svg",
  "./icon-192.png", "./icon-512.png", "./icon-maskable.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Firebase y todo lo externo va directo a internet (no se guarda)
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Primero intenta internet (así siempre ves la última versión); si no hay, usa lo guardado
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
