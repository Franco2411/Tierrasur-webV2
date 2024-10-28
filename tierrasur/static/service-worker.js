const CACHE_NAME = "v1";
const urlsToCache = [
    "/",
    "/static/style.css",
    "/static/style_home.css",
    "/static/scripts.js",
    "/static/scripts_auth.js",
    "/static/script_getRegistros.js",
    "/static/script_actualizarHaciaAbajo.js",
    "/static/images/fondo.jpg",
    "/static/images/ic_launcher.png",
    "/static/images/tierrasur.png",
    "/static/images/no_data.png"
];

// Instalación del Service Worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Archivos en caché");
                return cache.addAll(urlsToCache);
            })
    );
});

// Activación del Service Worker
self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Intercepta las peticiones de la aplicación
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        }).catch(() => {
          return cache.match(event.request);
        });
      })
    );
  });
  
