/**
 * Fetch fresh navigation HTML without waiting for a service worker update to finish downloading.
 * The installed worker's precached shell and assets remain available for offline navigation.
 */
import {clientsClaim} from 'workbox-core';
import {ExpirationPlugin} from 'workbox-expiration';
import {matchPrecache, precacheAndRoute} from 'workbox-precaching';
import {NavigationRoute, registerRoute} from 'workbox-routing';
import {NetworkOnly, StaleWhileRevalidate} from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

const NAVIGATION_TIMEOUT_SECONDS = 3;
const USER_MEDIA_MAX_ENTRIES = 200;
const USER_MEDIA_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

self.skipWaiting();
clientsClaim();

const navigationStrategy = new NetworkOnly({
    networkTimeoutSeconds: NAVIGATION_TIMEOUT_SECONDS,
    plugins: [
        {
            fetchDidSucceed: async ({response}) => {
                // Navigation redirects are followed by the browser, not validated as HTML by the worker.
                if (response.type === 'opaqueredirect') {
                    return response;
                }
                if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
                    throw new Error('Navigation did not return a successful HTML response');
                }
                return response;
            },
            // Use the installed shell, rather than caching new HTML whose assets may not yet be available offline.
            handlerDidError: async () => matchPrecache('/index.html'),
        },
    ],
});

// Navigation must win over the precache routes for / and /index.html as well as deep links.
registerRoute(
    new NavigationRoute(navigationStrategy, {
        denylist: [/^\/_/, /^\/\.well-known/, /^(?!\/index\.html(?:\?|$)).*\/[^/?]+\.[^/]+$/],
    }),
);

// Workbox replaces this exact property with the build's precache manifest.
// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({sameOrigin, url, request}) => sameOrigin && (request.destination === 'image' || /\/(receipts|chat-attachments)\//.test(url.pathname)),
    new StaleWhileRevalidate({
        cacheName: 'user-media',
        plugins: [new ExpirationPlugin({maxEntries: USER_MEDIA_MAX_ENTRIES, maxAgeSeconds: USER_MEDIA_MAX_AGE_SECONDS})],
    }),
);
