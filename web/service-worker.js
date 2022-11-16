/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */

self.addEventListener('install', () => {
    console.log('[Service Worker] Install called');
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode !== 'navigate') { return; }

    console.log('[Service Worker] Intercepting page navigation...');

    event.respondWith(
        fetch(event.request) // Try the page navigation
            .catch(() => new Response('Hello, Offline Fallback Page!')), // Page navigation failed so return our offline page
    );
});

self.addEventListener('push', event => console.log('Push received!', event));
