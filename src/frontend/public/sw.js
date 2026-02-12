const CACHE_NAME = 'bhetghat-v1';
const OFFLINE_URL = '/offline.html';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
  '/assets/generated/pwa-icon.dim_192x192.png',
  '/assets/generated/pwa-icon.dim_512x512.png',
  '/assets/generated/pwa-icon-maskable.dim_512x512.png',
  '/assets/generated/favicon.dim_48x48.png',
  '/assets/generated/apple-touch-icon.dim_180x180.png'
];

// Install event - cache core assets individually to tolerate missing files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache assets individually so one failure doesn't break the whole install
      const cachePromises = CORE_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn(`Failed to cache ${url}:`, err);
        }
      });
      await Promise.allSettled(cachePromises);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache, then offline page
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // Try to return cached page
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Try to return offline page
        const offlineResponse = await caches.match(OFFLINE_URL);
        if (offlineResponse) {
          return offlineResponse;
        }
        
        // Fallback to inline offline HTML
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - Bhetghat</title>
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0; 
                background: linear-gradient(135deg, #fce7f3 0%, #fff 100%);
                padding: 1rem;
              }
              .offline { 
                text-align: center; 
                padding: 2rem; 
                background: white;
                border-radius: 1rem;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              h1 { 
                color: #d91e5a; 
                margin: 0 0 1rem 0;
                font-size: 2rem;
              }
              p { 
                color: #666; 
                margin: 0.5rem 0;
                line-height: 1.6;
              }
              .emoji {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="offline">
              <div class="emoji">📵</div>
              <h1>Offline</h1>
              <p>You are currently offline. Please check your connection.</p>
              <p>तपाईं अहिले अफलाइन हुनुहुन्छ। कृपया आफ्नो जडान जाँच गर्नुहोस्।</p>
            </div>
          </body>
          </html>`,
          {
            headers: { 'Content-Type': 'text/html' }
          }
        );
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || new Response('Network error', { status: 408 });
      })
    );
  }
});
