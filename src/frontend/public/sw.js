/**
 * Service Worker - TEMPORARY DISABLE MODE
 * 
 * This service worker is configured to self-unregister and clean up caches
 * to ensure the app always loads fresh content from the network.
 * 
 * This is a temporary measure for debugging blank page issues.
 */

const CACHE_NAME = 'bhetghat-v3';
const LEGACY_CACHE_PATTERN = /^bhetghat-/;

// Install event - skip caching, just activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW Disable Mode] Install event - skipping to activation');
  self.skipWaiting();
});

// Activate event - clean up ALL caches and self-unregister
self.addEventListener('activate', (event) => {
  console.log('[SW Disable Mode] Activate event - cleaning up and self-unregistering');
  
  event.waitUntil(
    (async () => {
      try {
        // Delete all caches (current and legacy)
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames.map((cacheName) => {
          console.log('[SW Disable Mode] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        });
        await Promise.all(deletePromises);
        
        console.log('[SW Disable Mode] All caches deleted');
        
        // Self-unregister this service worker
        const registration = await self.registration;
        if (registration) {
          await registration.unregister();
          console.log('[SW Disable Mode] Service worker unregistered');
        }
      } catch (error) {
        console.error('[SW Disable Mode] Error during cleanup:', error);
      }
    })()
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - DO NOT INTERCEPT, let all requests go to network
self.addEventListener('fetch', (event) => {
  // In disable mode, we do NOT intercept fetch events
  // All requests go directly to the network
  // This ensures fresh content is always loaded
  return;
});
