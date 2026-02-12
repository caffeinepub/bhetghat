/**
 * Pre-boot script for service worker cleanup and global error handling
 * TEMPORARY SW DISABLE MODE: Unregisters service workers and clears caches
 * This runs BEFORE the React app loads to ensure clean startup
 */

(async () => {
  try {
    // STEP 1: Unregister all service workers and clear caches BEFORE loading React
    if ('serviceWorker' in navigator) {
      try {
        console.log('[SW Disable] Unregistering all service workers...');
        
        // Unregister all service worker registrations
        const registrations = await navigator.serviceWorker.getRegistrations();
        const unregisterPromises = registrations.map(reg => {
          console.log('[SW Disable] Unregistering:', reg.scope);
          return reg.unregister();
        });
        await Promise.all(unregisterPromises);
        
        console.log('[SW Disable] All service workers unregistered');
        
        // Delete all caches (especially bhetghat-v3 and any legacy bhetghat-* caches)
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const deletePromises = cacheNames.map(cacheName => {
            console.log('[SW Disable] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          });
          await Promise.all(deletePromises);
          console.log('[SW Disable] All caches cleared');
        }
      } catch (swError) {
        console.warn('[SW Disable] Error during SW cleanup (non-fatal):', swError);
      }
      
      // STEP 2: Block any future service worker registration attempts
      const originalRegister = navigator.serviceWorker.register;
      navigator.serviceWorker.register = function(...args) {
        console.warn('[SW Disable] Service worker registration blocked (temporary disable mode)');
        // Return a resolved promise to avoid breaking code that expects a registration
        return Promise.resolve({
          installing: null,
          waiting: null,
          active: null,
          scope: '/',
          updateViaCache: 'imports',
          unregister: () => Promise.resolve(true),
          update: () => Promise.resolve(),
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        });
      };
    }
  } catch (error) {
    console.error('[SW Disable] Critical error during pre-boot:', error);
  }
  
  // STEP 3: Install global error handler/watchdog
  // If the React app fails to mount within 10 seconds, show error screen
  let appMounted = false;
  
  // Mark app as mounted when React renders
  const observer = new MutationObserver(() => {
    const root = document.getElementById('root');
    if (root && root.children.length > 0) {
      appMounted = true;
      observer.disconnect();
    }
  });
  
  const root = document.getElementById('root');
  if (root) {
    observer.observe(root, { childList: true, subtree: true });
  }
  
  // Watchdog: Check if app mounted after 10 seconds
  setTimeout(() => {
    if (!appMounted && root && root.children.length === 0) {
      console.error('[Boot Watchdog] App failed to mount within 10 seconds');
      showBootError('The application failed to start. Please reload the page.');
    }
  }, 10000);
  
  // Global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    console.error('[Global Error Handler]', event.error);
    if (!appMounted) {
      showBootError('An error occurred while loading the application.');
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Rejection]', event.reason);
    if (!appMounted) {
      showBootError('An error occurred while loading the application.');
    }
  });
  
  function showBootError(message) {
    const root = document.getElementById('root');
    if (root && root.children.length === 0) {
      root.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #fce7f3 0%, #fff 100%);
          padding: 1rem;
        ">
          <div style="
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 400px;
          ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h1 style="color: #d91e5a; margin: 0 0 1rem 0; font-size: 2rem;">Loading Error</h1>
            <p style="color: #666; margin: 0.5rem 0; line-height: 1.6;">
              ${message}
            </p>
            <p style="color: #666; margin: 0.5rem 0; line-height: 1.6;">
              एप्लिकेसन लोड गर्न असफल भयो। कृपया पृष्ठ रिफ्रेस गर्नुहोस्।
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                margin-top: 1.5rem;
                padding: 0.75rem 1.5rem;
                background: #d91e5a;
                color: white;
                border: none;
                border-radius: 0.5rem;
                font-size: 1rem;
                cursor: pointer;
                font-weight: 500;
              "
            >
              Reload / पुन: लोड गर्नुहोस्
            </button>
          </div>
        </div>
      `;
    }
  }
})();
