// Pocket ── Service Worker
// アプリの基本ファイルをキャッシュし、オフラインでも起動できるようにします。
 
const CACHE_NAME = "pocket-cache-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];
 
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});
 
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
// キャッシュ優先、なければネットワーク、失敗時はキャッシュのindex.htmlを返す(オフライン対応)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached || caches.match("./index.html"));
      return cached || networkFetch;
    })
  );
});
 
