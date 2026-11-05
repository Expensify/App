/**
 * Open the saved app immediately on ordinary visits, and fetch fresh HTML for required upgrades.
 * Keep the installed shell and assets available offline without unregistering the worker.
 */
import {APP_UPDATE_QUERY_PARAM} from '@libs/AppUpdateURL';

import {clientsClaim} from 'workbox-core';
import {ExpirationPlugin} from 'workbox-expiration';
import {matchPrecache, precacheAndRoute} from 'workbox-precaching';
import {NavigationRoute, registerRoute} from 'workbox-routing';
import {NetworkOnly, StaleWhileRevalidate} from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

const USER_MEDIA_MAX_ENTRIES = 200;
const USER_MEDIA_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const UPGRADE_REDIRECT_MAX_AGE_MS = 60 * 1000;
const upgradeRedirects = new Map<string, ReturnType<typeof setTimeout>>();

self.skipWaiting();
clientsClaim();

const upgradeNavigationStrategy = new NetworkOnly({
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

// Upgrade requests must reach the network even when / or /index.html already has a precached response.
registerRoute(
    new NavigationRoute(
        async (options) => {
            const navigationEvent = options.event instanceof FetchEvent ? options.event : undefined;
            const clientID = navigationEvent?.resultingClientId;
            const redirectTimeout = clientID ? upgradeRedirects.get(clientID) : undefined;
            if (redirectTimeout !== undefined && clientID) {
                clearTimeout(redirectTimeout);
                upgradeRedirects.delete(clientID);
            }
            const isUpgrade = options.url.searchParams.has(APP_UPDATE_QUERY_PARAM) || redirectTimeout !== undefined;
            if (!isUpgrade) {
                const cachedResponse = await matchPrecache('/index.html').catch((error: unknown) => {
                    console.error('Failed to read the saved app; trying the network.', error);
                    return undefined;
                });
                if (cachedResponse) {
                    return cachedResponse;
                }
            }

            const response = await upgradeNavigationStrategy.handle(options);
            if (response.type === 'opaqueredirect' && clientID) {
                // Redirects may drop the query marker, but keep the ID of the page being opened.
                // Expire abandoned redirects, including those that leave this worker's scope entirely.
                upgradeRedirects.set(
                    clientID,
                    setTimeout(() => upgradeRedirects.delete(clientID), UPGRADE_REDIRECT_MAX_AGE_MS),
                );
            }
            return response;
        },
        {denylist: [/^\/_/, /^\/\.well-known/, /^(?!\/index\.html(?:\?|$)).*\/[^/?]+\.[^/]+$/]},
    ),
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
