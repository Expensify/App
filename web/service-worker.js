/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */

self.addEventListener('install', () => {
    console.log('[Service Worker] Install called');
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode !== 'navigate') { return; }

    console.log('[Service Worker] Intercepting page navigation...');

    event.respondWith(
        // Try the page navigation
        fetch(event.request)
            .catch(() => {
                // Page navigation failed, probably because we're ofline
                // Return our offline page
                new Response('Hello, Offline Fallback Page!')
            }),
    );
});

self.addEventListener('push', (event) => console.log('Push received!', event));
