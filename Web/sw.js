// Service Worker for Architecture Decoded PWA
// Strategy: Network First - Always fetch latest content, no caching

// Install event - skip waiting immediately
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Activate event - clean up any existing caches and take control immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            // Delete ALL caches
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Network First, NO CACHING
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Network First strategy - always fetch from network, no cache fallback
    event.respondWith(
        fetch(request, {
            cache: 'no-store' // Force fresh fetch, bypass browser cache
        }).then((networkResponse) => {
            // Return fresh response directly, no caching
            return networkResponse;
        }).catch(() => {
            // Network request failed - handle offline state
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
                return new Response(
                    `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Offline - Architecture Decoded</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                min-height: 100vh;
                                margin: 0;
                                background: #f5f5f5;
                                color: #333;
                            }
                            .offline-container {
                                text-align: center;
                                padding: 2rem;
                                max-width: 500px;
                            }
                            h1 { color: #C08670; margin-bottom: 1rem; }
                            p { line-height: 1.6; margin-bottom: 1.5rem; }
                            button {
                                background: #C08670;
                                color: white;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 6px;
                                font-size: 1rem;
                                cursor: pointer;
                            }
                            button:hover { background: #AB7864; }
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
                    </html>`,
                    { 
                        headers: { 
                            'Content-Type': 'text/html',
                            'Cache-Control': 'no-store'
                        } 
                    }
                );
            }
            
            // For other requests, return error
            return new Response('Network error', {
                status: 408,
                statusText: 'Network request failed',
                headers: { 'Cache-Control': 'no-store' }
            });
        })
    );
});

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
