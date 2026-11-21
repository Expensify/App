/**
 * Open the saved app immediately on ordinary visits, and fetch fresh HTML for required upgrades.
 * Keep the installed shell and assets available offline without unregistering the worker.
 *
 * On the host that serves both New Expensify and Expensify Classic, paths that New Expensify alone serves open the saved app.
 * Paths both products serve go to the network, and offline only a New Expensify user gets the saved app.
 * Every other path is left to the browser, so Classic works as if the worker didn't exist.
 */
import {APP_UPDATE_QUERY_PARAM} from '@libs/AppUpdateURL';
import EXPERIENCE_COOKIE from '@libs/ExperienceCookie/EXPERIENCE_COOKIE';
import {APP_ONLY_NAVIGATION_PATHS, SHARED_NAVIGATION_PATHS, SIGN_OUT_NAVIGATION_PATHS} from '@libs/NavigationPaths';
import {blockAndClearUserMedia, isUserMediaBlocked, USER_MEDIA_CACHE_NAME} from '@libs/UserMediaCache';

import type {RouteHandlerCallbackOptions, WorkboxPlugin} from 'workbox-core/types';

import {clientsClaim} from 'workbox-core';
import {ExpirationPlugin} from 'workbox-expiration';
import {matchPrecache, precacheAndRoute} from 'workbox-precaching';
import {NavigationRoute, registerRoute} from 'workbox-routing';
import {NetworkOnly, StaleWhileRevalidate} from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Defined at build time by config/rsbuild/rsbuild.common.ts
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
declare const __SHARED_PRODUCT_HOST__: string;

const APP_SHELL_URL = '/index.html';
const USER_MEDIA_MAX_ENTRIES = 200;
const USER_MEDIA_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const UPGRADE_REDIRECT_MAX_AGE_MS = 60 * 1000;
const upgradeRedirects = new Map<string, ReturnType<typeof setTimeout>>();

// Files and internal tools never receive the app shell
const NON_PAGE_PATHS = [/^\/_/, /^\/\.well-known/, /^(?!\/index\.html(?:\?|$)).*\/[^/?]+\.[^/]+$/];

// Expensify Classic serves its pages' scripts and images under these paths, matched without case like the experience router does
const CLASSIC_ASSET_PATHS =
    // cspell:disable-next-line
    /^\/(?:api|apiassets|_support|_devportal|_tests|_tools|authentication|partners|mcp|oauth|openid|mobile|concierge|expensiworks|\.well-known|newjs|site|homepage|build|js|font|cdn|errors|m)(?:\/|$)/i;

const isSharedProductHost = self.location.hostname === __SHARED_PRODUCT_HOST__;

self.skipWaiting();
clientsClaim();

/**
 * Only the experience cookie tells a New Expensify user from an Expensify Classic user. Browsers that can't read cookies in a worker
 * keep opening the saved app, and a failed read counts as Classic, because the worker can't tell which product the user chose.
 */
async function isNewExpensifyUser(): Promise<boolean> {
    const {cookieStore} = self as Partial<Pick<ServiceWorkerGlobalScope, 'cookieStore'>>;
    if (!cookieStore) {
        return true;
    }
    try {
        const cookie = await cookieStore.get(EXPERIENCE_COOKIE.NAME);
        return cookie?.value === EXPERIENCE_COOKIE.VALUES.NEW;
    } catch (error) {
        console.error('Failed to read the experience cookie; leaving the offline error to the browser.', error);
        return false;
    }
}

/**
 * Upgrades fetch fresh HTML from the network. Offline, the saved app opens only when the caller allows it;
 * otherwise Workbox rethrows the network error and the browser shows its own error page.
 */
function createUpgradeNavigationStrategy(mayOpenSavedApp: () => Promise<boolean>) {
    return new NetworkOnly({
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
                handlerDidError: async () => ((await mayOpenSavedApp()) ? matchPrecache(APP_SHELL_URL) : undefined),
            },
        ],
    });
}

const upgradeNavigationStrategy = createUpgradeNavigationStrategy(async () => true);

// Upgrades of paths both products serve open the saved app offline only for a New Expensify user.
const sharedUpgradeNavigationStrategy = createUpgradeNavigationStrategy(isNewExpensifyUser);

// Both products serve these paths, so an ordinary navigation shows every server response, including Expensify Classic's redirects and error pages, as it is.
// Offline, only a New Expensify user gets the saved app, for upgrades too. Without a response, Workbox rethrows the network error and the browser shows its own offline page.
const sharedNavigationStrategy = new NetworkOnly({
    plugins: [
        {
            handlerDidError: async () => ((await isNewExpensifyUser()) ? matchPrecache(APP_SHELL_URL) : undefined),
        },
    ],
});

function getResultingClientID(options: RouteHandlerCallbackOptions): string | undefined {
    return options.event instanceof FetchEvent ? options.event.resultingClientId : undefined;
}

/**
 * Upgrades must reach the network even when the path has a precached response. Redirects may drop the query marker,
 * so a page opened by an upgrade redirect is an upgrade too, and that redirect is forgotten once it arrives.
 */
function isUpgradeNavigation(url: URL, clientID: string | undefined): boolean {
    const redirectTimeout = clientID ? upgradeRedirects.get(clientID) : undefined;
    if (redirectTimeout !== undefined && clientID) {
        clearTimeout(redirectTimeout);
        upgradeRedirects.delete(clientID);
    }
    return url.searchParams.has(APP_UPDATE_QUERY_PARAM) || redirectTimeout !== undefined;
}

async function openUpgradedApp(options: RouteHandlerCallbackOptions, clientID: string | undefined, strategy: typeof upgradeNavigationStrategy): Promise<Response> {
    const response = await strategy.handle(options);
    if (response.type === 'opaqueredirect' && clientID) {
        // Expire abandoned redirects, including those that leave this worker's scope entirely.
        upgradeRedirects.set(
            clientID,
            setTimeout(() => upgradeRedirects.delete(clientID), UPGRADE_REDIRECT_MAX_AGE_MS),
        );
    }
    return response;
}

async function openSavedApp(options: RouteHandlerCallbackOptions): Promise<Response> {
    const clientID = getResultingClientID(options);
    if (isUpgradeNavigation(options.url, clientID)) {
        return openUpgradedApp(options, clientID, upgradeNavigationStrategy);
    }

    const cachedResponse = await matchPrecache(APP_SHELL_URL).catch((error: unknown) => {
        console.error('Failed to read the saved app; trying the network.', error);
        return undefined;
    });
    return cachedResponse ?? openUpgradedApp(options, clientID, upgradeNavigationStrategy);
}

async function openSharedPage(options: RouteHandlerCallbackOptions): Promise<Response> {
    const clientID = getResultingClientID(options);
    if (isUpgradeNavigation(options.url, clientID)) {
        return openUpgradedApp(options, clientID, sharedUpgradeNavigationStrategy);
    }
    return sharedNavigationStrategy.handle(options);
}

/**
 * Signing out of Expensify Classic doesn't run New Expensify's sign-out, so saved receipts would outlive the session.
 * The sign-out request reaches the server even if Cache Storage fails, so the session always ends.
 */
async function signOutOfClassic(options: RouteHandlerCallbackOptions): Promise<Response> {
    try {
        await blockAndClearUserMedia();
    } catch (error) {
        console.error('Failed to clear saved media on sign-out.', error);
    }
    return fetch(options.request);
}

if (isSharedProductHost) {
    // Sign-out pages have a .php variant, so file paths are not excluded here.
    registerRoute(new NavigationRoute(signOutOfClassic, {allowlist: SIGN_OUT_NAVIGATION_PATHS}));
    registerRoute(new NavigationRoute(openSavedApp, {allowlist: APP_ONLY_NAVIGATION_PATHS, denylist: NON_PAGE_PATHS}));
    registerRoute(new NavigationRoute(openSharedPage, {allowlist: SHARED_NAVIGATION_PATHS, denylist: NON_PAGE_PATHS}));
} else {
    registerRoute(new NavigationRoute(openSavedApp, {denylist: NON_PAGE_PATHS}));
}

// Navigation routes are registered first, so upgrades to / and /index.html bypass the precached HTML.
// On the shared host clean URLs and the directory index are off, so Expensify Classic's /index and non-navigation requests for / stay with the server
// instead of receiving /index.html. An empty directory index disables it, while undefined keeps Workbox's default.
// Workbox replaces this exact property with the build's precache manifest.
// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST, isSharedProductHost ? {cleanURLs: false, directoryIndex: ''} : undefined);

const userMediaPlugin: WorkboxPlugin = {
    // A custom cacheWillUpdate replaces Workbox's default filter, so it saves only successful and opaque responses as that filter does.
    cacheWillUpdate: async ({response}) => {
        if (await isUserMediaBlocked()) {
            return null;
        }
        return response.status === 200 || response.status === 0 ? response : null;
    },
    // A save that started before the block was set can finish after the cache was deleted, so it is deleted again.
    // This plugin comes after ExpirationPlugin, whose own update would otherwise reopen the deleted cache.
    cacheDidUpdate: async () => {
        if (!(await isUserMediaBlocked())) {
            return;
        }
        await caches.delete(USER_MEDIA_CACHE_NAME);
    },
};

registerRoute(
    ({sameOrigin, url, request}) =>
        sameOrigin && !(isSharedProductHost && CLASSIC_ASSET_PATHS.test(url.pathname)) && (request.destination === 'image' || /\/(receipts|chat-attachments)\//.test(url.pathname)),
    new StaleWhileRevalidate({
        cacheName: USER_MEDIA_CACHE_NAME,
        // Only the shared host blocks saving media, so other hosts keep Workbox's default filter
        plugins: [new ExpirationPlugin({maxEntries: USER_MEDIA_MAX_ENTRIES, maxAgeSeconds: USER_MEDIA_MAX_AGE_SECONDS}), ...(isSharedProductHost ? [userMediaPlugin] : [])],
    }),
);
