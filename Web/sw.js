// Service Worker for Architecture Decoded PWA
// Version: 1.0.0
// Strategy: Network First with graceful fallback

const CACHE_VERSION = 'v1';
const CACHE_NAME = `architecture-decoded-${CACHE_VERSION}`;

// Install event - prepare for activation
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - Network First with intelligent caching
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Only cache successful responses
                if (response && response.status === 200) {
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    
                    // Cache static assets only (not markdown files)
                    if (!request.url.endsWith('.md')) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                }
                
                return response;
            })
            .catch((error) => {
                // Try to serve from cache on network failure
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    // Return offline page for navigation requests
                    if (request.mode === 'navigate') {
                        return new Response(
                            generateOfflinePage(),
                            { 
                                headers: { 
                                    'Content-Type': 'text/html',
                                    'Cache-Control': 'no-cache'
                                } 
                            }
                        );
                    }
                    
                    // For other requests, throw the error
                    throw error;
                });
            })
    );
});

// Generate offline page HTML
function generateOfflinePage() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Architecture Decoded</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f5f5f5;
            color: #333;
            padding: 1rem;
        }
        .offline-container {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #C08670; 
            margin-bottom: 1rem;
            font-size: 1.75rem;
        }
        p { 
            line-height: 1.6; 
            margin-bottom: 1rem;
            color: #666;
        }
        button {
            background: #C08670;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover { 
            background: #AB7864; 
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <h1>You're Offline</h1>
        <p>Architecture Decoded requires an internet connection to load the latest content.</p>
        <p>Please check your connection and try again.</p>
        <button onclick="window.location.reload()">Retry</button>
    </div>
</body>
</html>`;
}

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                return self.clients.matchAll();
            }).then((clients) => {
                clients.forEach(client => {
                    client.postMessage({ type: 'CACHE_CLEARED' });
                });
            })
        );
    }
});
