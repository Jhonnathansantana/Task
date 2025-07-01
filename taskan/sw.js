const CACHE_NAME = 'taskan-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js', // Adjusted from app.js to main.js
    '/img/icon-192x192.png',
    '/img/icon-512x512.png',
    // Consider adding other assets like fonts or other images if you have them
];

// Evento 'install': se dispara cuando el SW se instala.
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache abierta, añadiendo archivos principales a la caché');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Todos los archivos principales cacheados.');
                return self.skipWaiting(); // Forzar la activación del SW
            })
            .catch(error => {
                console.error('Service Worker: Falló el cacheo de archivos principales durante la instalación:', error);
            })
    );
});

// Evento 'activate': se dispara cuando el SW se activa.
// Es un buen lugar para limpiar cachés antiguas.
self.addEventListener('activate', event => {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Borrando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Cachés antiguas limpiadas.');
            return self.clients.claim(); // Tomar control inmediato de las páginas abiertas
        })
    );
});

// Evento 'fetch': se dispara con cada petición de red.
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetch interceptado para:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('Service Worker: Devolviendo respuesta desde caché:', event.request.url);
                    return cachedResponse;
                }
                console.log('Service Worker: No hay respuesta en caché, haciendo fetch a la red para:', event.request.url);
                return fetch(event.request).then(
                    networkResponse => {
                        // Opcional: Cachear dinámicamente nuevas peticiones si es necesario
                        // Por ejemplo, para peticiones GET exitosas
                        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                            // Es importante clonar la respuesta. Una respuesta es un stream y
                            // solo puede ser consumida una vez. Necesitamos una copia para el navegador
                            // y otra para la caché.
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    console.log('Service Worker: Cacheando nueva petición:', event.request.url);
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    }
                ).catch(error => {
                    console.error('Service Worker: Error en fetch y no hay nada en caché:', error);
                    // Podrías devolver una página offline personalizada aquí
                    // return caches.match('/offline.html');
                });
            })
    );
});
