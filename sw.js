var V = 'fin-v1';
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(['./', 'index.html', 'manifest.webmanifest']); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || /script\.google/.test(r.url)) return; // a API nunca passa pelo cache
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (hit) {
    var rede = fetch(r).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
      return res;
    }).catch(function () { return hit || caches.match('index.html'); });
    return hit || rede; // abre do cache e atualiza em segundo plano
  }));
});
// Service worker mínimo: só existe para o Chrome aceitar a instalação. Não guarda nada em cache.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () {});
