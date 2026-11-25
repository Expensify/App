/** Regression coverage for navigation freshness and the worker's coherent offline fallback. */
import {APP_UPDATE_QUERY_PARAM} from '@libs/AppUpdateURL';
import {APP_ONLY_NAVIGATION_PATHS, SHARED_NAVIGATION_PATHS, SIGN_OUT_NAVIGATION_PATHS} from '@libs/NavigationPaths';

import CONST from '@src/CONST';

import createMock from '../utils/createMock';

type NavigationOptions = {
    networkTimeoutSeconds?: number;
    plugins: Array<{
        requestWillFetch?: (options: {request: Request}) => Promise<Request>;
        fetchDidSucceed: (options: {response: Response}) => Promise<Response>;
        handlerDidError: () => Promise<Response | undefined>;
    }>;
};

type UserMediaPlugin = {
    cacheWillUpdate?: (options: {response: Response}) => Promise<Response | null>;
    cacheDidUpdate?: () => Promise<void>;
};

type RouteMatcher = (options: {sameOrigin: boolean; url: URL; request: {destination: string}}) => boolean;

type NavigationRouteOptions = {allowlist?: RegExp[]; denylist?: RegExp[]};

class MockFetchEvent {
    resultingClientId: string;

    constructor(resultingClientId: string) {
        this.resultingClientId = resultingClientId;
    }
}

type NavigationHandler = (options: {url: URL; request?: Request; event?: MockFetchEvent}) => Promise<Response>;

type WorkerRequestEvent = {request: {mode: string}; waitUntil: jest.Mock<void, [Promise<void>]>; respondWith: jest.Mock};

const mockUpgradeNavigation = jest.fn<Promise<Response>, [{url: URL; event?: MockFetchEvent}]>();
const mockSharedUpgradeNavigation = jest.fn<Promise<Response>, [{url: URL; event?: MockFetchEvent}]>();
const mockSharedNavigation = jest.fn<Promise<Response>, [{url: URL; event?: MockFetchEvent}]>();
const mockFetch = jest.fn<Promise<Response>, [Request]>();
const mockNetworkOnly = jest.fn<{plugins: NavigationOptions['plugins']; handle: NavigationHandler}, [NavigationOptions]>();
const mockNavigationRoute = jest.fn<void, [NavigationHandler, NavigationRouteOptions]>();
const mockRegistrationOrder: string[] = [];
const mockRegisteredMatchers: Array<RouteMatcher | undefined> = [];
const mockMatchPrecache = jest.fn<Promise<Response | undefined>, [string]>();
const mockPrecacheAndRoute = jest.fn();
const mockStaleWhileRevalidate = jest.fn<void, [{cacheName: string; plugins: UserMediaPlugin[]}]>();
const mockSkipWaiting = jest.fn();
const mockAddEventListener = jest.fn<void, [string, (event: WorkerRequestEvent) => void]>();
const mockUnregister = jest.fn<Promise<boolean>, []>();

jest.mock('workbox-core', () => ({clientsClaim: jest.fn()}));
jest.mock('workbox-expiration', () => ({ExpirationPlugin: jest.fn()}));
jest.mock('workbox-precaching', () => ({
    matchPrecache: (url: string) => mockMatchPrecache(url),
    precacheAndRoute: (...args: unknown[]) => {
        mockPrecacheAndRoute(...args);
        mockRegistrationOrder.push('precache');
    },
}));
jest.mock('workbox-routing', () => ({
    NavigationRoute: jest.fn((handler: NavigationHandler, options: NavigationRouteOptions) => mockNavigationRoute(handler, options)),
    registerRoute: (matcher: RouteMatcher | undefined) => {
        mockRegisteredMatchers.push(matcher);
        mockRegistrationOrder.push('route');
    },
}));
jest.mock('workbox-strategies', () => ({
    NetworkOnly: jest.fn((options: NavigationOptions) => mockNetworkOnly(options)),
    StaleWhileRevalidate: jest.fn((options: {cacheName: string; plugins: UserMediaPlugin[]}) => mockStaleWhileRevalidate(options)),
}));

const SHARED_PRODUCT_HOST = 'expensify.com.dev';
const OTHER_HOST = 'new.expensify.com';

// The worker builds one network strategy for each kind of page navigation, in this order
const NETWORK_HANDLES = [mockUpgradeNavigation, mockSharedUpgradeNavigation, mockSharedNavigation];

let realLocation: Location;
let realFetch: typeof fetch;
let realAddEventListener: typeof globalThis.addEventListener;

/** Starts a fresh worker on the given host, the way a browser starts it after it was stopped */
function startWorker(hostname: string) {
    jest.clearAllMocks();
    mockRegistrationOrder.length = 0;
    mockRegisteredMatchers.length = 0;
    Object.defineProperty(window, 'location', {
        value: {hostname},
        writable: true,
        configurable: true,
    });
    jest.isolateModules(() => {
        jest.requireActual('../../web/service-worker');
    });
}

function getNavigationRoute(index: number) {
    const call = mockNavigationRoute.mock.calls.at(index);
    if (!call) {
        throw new Error(`No navigation route at ${index}`);
    }
    return {handler: call[0], options: call[1]};
}

function getUpgradeStrategyPlugin() {
    return mockNetworkOnly.mock.calls.at(0)?.[0].plugins.at(0);
}

function getSharedUpgradeStrategyPlugin() {
    return mockNetworkOnly.mock.calls.at(1)?.[0].plugins.at(0);
}

function getSharedStrategyPlugin() {
    return mockNetworkOnly.mock.calls.at(2)?.[0].plugins.at(0);
}

function getUserMediaPlugin(): UserMediaPlugin {
    const plugin = mockStaleWhileRevalidate.mock.calls.at(0)?.[0].plugins.at(-1);
    if (!plugin) {
        throw new Error('No user media plugin');
    }
    return plugin;
}

function getUserMediaMatcher(): RouteMatcher {
    const matcher = mockRegisteredMatchers.at(-1);
    if (!matcher) {
        throw new Error('No user media route');
    }
    return matcher;
}

/** Matches a path the way Workbox's NavigationRoute does */
function routeMatches({allowlist = [/./], denylist = []}: NavigationRouteOptions, url: string): boolean {
    return !denylist.some((pattern) => pattern.test(url)) && allowlist.some((pattern) => pattern.test(url));
}

/** Stands in for Cache Storage, which pages and the worker share */
function arrangeCacheStorage(cacheNames: string[] = []) {
    const names = new Set(cacheNames);
    const cacheStorage = {
        names,
        open: jest.fn(async (name: string) => {
            names.add(name);
            return {};
        }),
        delete: jest.fn(async (name: string) => names.delete(name)),
        has: jest.fn(async (name: string) => names.has(name)),
    };
    Object.defineProperty(globalThis, 'caches', {
        configurable: true,
        value: cacheStorage,
    });
    return cacheStorage;
}

function arrangeCookieStore(get?: () => Promise<{value: string} | null>) {
    if (!get) {
        Reflect.deleteProperty(globalThis, 'cookieStore');
        return undefined;
    }
    const getCookie = jest.fn(get);
    Object.defineProperty(globalThis, 'cookieStore', {configurable: true, value: {get: getCookie}});
    return getCookie;
}

/** Sends a request to the listener the worker added for every request, and waits for the work it started */
async function sendRequest(mode: string): Promise<WorkerRequestEvent> {
    const listener = mockAddEventListener.mock.calls.find(([type]) => type === 'fetch')?.[1];
    if (!listener) {
        throw new Error('No fetch listener');
    }
    const event: WorkerRequestEvent = {request: {mode}, waitUntil: jest.fn<void, [Promise<void>]>(), respondWith: jest.fn()};
    listener(event);
    await Promise.all(event.waitUntil.mock.calls.map(([work]) => work));
    return event;
}

describe('service worker navigation', () => {
    beforeAll(() => {
        Object.defineProperty(globalThis, 'skipWaiting', {configurable: true, value: mockSkipWaiting});
        Object.defineProperty(globalThis, 'FetchEvent', {configurable: true, value: MockFetchEvent});
        realFetch = globalThis.fetch;
        Object.defineProperty(globalThis, 'fetch', {configurable: true, writable: true, value: mockFetch});
        realAddEventListener = globalThis.addEventListener;
        Object.defineProperty(globalThis, 'addEventListener', {configurable: true, writable: true, value: mockAddEventListener});
        Object.defineProperty(globalThis, 'registration', {configurable: true, value: {unregister: mockUnregister}});
    });

    afterAll(() => {
        Reflect.deleteProperty(globalThis, 'skipWaiting');
        Reflect.deleteProperty(globalThis, 'FetchEvent');
        Object.defineProperty(globalThis, 'fetch', {configurable: true, writable: true, value: realFetch});
        Object.defineProperty(globalThis, 'addEventListener', {configurable: true, writable: true, value: realAddEventListener});
        Reflect.deleteProperty(globalThis, 'registration');
    });

    beforeEach(() => {
        jest.useFakeTimers();
        realLocation = window.location;
        for (const handle of NETWORK_HANDLES) {
            handle.mockReset();
            handle.mockResolvedValue(createMock<Response>({type: 'basic'}));
        }
        mockNetworkOnly.mockImplementation((options) => ({
            plugins: options.plugins ?? [],
            handle: NETWORK_HANDLES.at(mockNetworkOnly.mock.calls.length - 1) ?? mockUpgradeNavigation,
        }));
        mockFetch.mockReset();
        mockUnregister.mockReset();
        mockUnregister.mockResolvedValue(true);
        mockMatchPrecache.mockResolvedValue(createMock<Response>({}));
        arrangeCacheStorage();
        arrangeCookieStore();
        startWorker(OTHER_HOST);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        Object.defineProperty(window, 'location', {
            value: realLocation,
            writable: true,
            configurable: true,
        });
        Reflect.deleteProperty(globalThis, 'caches');
        Reflect.deleteProperty(globalThis, 'cookieStore');
    });

    it('registers navigation before precache routes so upgrades can bypass cached HTML', () => {
        // Given the worker has both navigation and precache handlers
        // When it registers its routes
        // Then upgrades to / and /index.html reach the navigation handler before cache-first routes
        expect(mockRegistrationOrder).toEqual(['route', 'precache', 'route']);
        expect(mockNetworkOnly.mock.calls.at(0)?.[0].networkTimeoutSeconds).toBeUndefined();

        // And precache keeps Workbox's defaults on New Expensify's own host
        expect(mockPrecacheAndRoute).toHaveBeenCalledWith(undefined, undefined);
    });

    it('preserves the browser navigation request instead of reconstructing it', () => {
        // Given HTML freshness is controlled by the server's Cache-Control header
        // When the worker configures its network strategy
        const plugins = mockNetworkOnly.mock.calls.at(0)?.[0].plugins;

        // Then no plugin replaces the request and loses its navigation mode or redirect behavior
        expect(plugins?.every((plugin) => plugin.requestWillFetch === undefined)).toBe(true);
    });

    it.each([
        ['/r/123', false],
        [`/r/123?${APP_UPDATE_QUERY_PARAM}=true`, true],
        [`/index.html?${APP_UPDATE_QUERY_PARAM}=true`, true],
    ])('uses cached HTML for ordinary visits and the network for upgrades to %s', async (pathname, isUpgrade) => {
        // Given a saved shell is available and only upgrades require fresh HTML
        const response = createMock<Response>({});
        mockMatchPrecache.mockResolvedValue(response);
        mockUpgradeNavigation.mockResolvedValue(response);
        const handler = mockNavigationRoute.mock.calls.at(0)?.[0];
        const options = {url: new URL(pathname, 'https://new.expensify.com')};

        // When the worker handles a navigation
        const result = await handler?.(options);

        // Then ordinary visits do not start a network request and upgrades do not wait on a cache read
        expect(mockNetworkOnly.mock.calls.at(0)?.[0].networkTimeoutSeconds).toBeUndefined();
        expect(mockUpgradeNavigation).toHaveBeenCalledTimes(isUpgrade ? 1 : 0);
        expect(mockMatchPrecache).toHaveBeenCalledTimes(isUpgrade ? 0 : 1);
        expect(result).toBe(response);
    });

    it('tries the network when the installed shell is missing', async () => {
        // Given an ordinary visit has no cached HTML
        mockMatchPrecache.mockResolvedValueOnce(undefined);
        const response = createMock<Response>({});
        mockUpgradeNavigation.mockResolvedValueOnce(response);
        const handler = mockNavigationRoute.mock.calls.at(0)?.[0];
        const options = {url: new URL('https://new.expensify.com/r/123')};

        // When the app is opened
        const result = await handler?.(options);

        // Then it can still load from the network instead of returning an empty response
        expect(mockUpgradeNavigation).toHaveBeenCalledWith(options);
        expect(result).toBe(response);
    });

    it('tries the network when reading the installed shell fails', async () => {
        // Given cache access fails but the network can still load the app
        const error = new Error('Cache Storage unavailable');
        mockMatchPrecache.mockRejectedValueOnce(error);
        const response = createMock<Response>({});
        mockUpgradeNavigation.mockResolvedValueOnce(response);
        const logError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const handler = mockNavigationRoute.mock.calls.at(0)?.[0];

        // When an ordinary navigation attempts to read the saved shell
        const result = await handler?.({url: new URL('https://new.expensify.com')});

        // Then it reports the cache failure and uses the network response
        expect(logError).toHaveBeenCalledWith('Failed to read the saved app; trying the network.', error);
        expect(result).toBe(response);
        logError.mockRestore();
    });

    it('keeps upgrade redirects on the network even if the server drops the marker', async () => {
        // Given an upgrade redirect whose destination must not use the saved older app
        const response = createMock<Response>({type: 'basic'});
        const redirect = createMock<Response>({type: 'opaqueredirect'});
        mockUpgradeNavigation.mockResolvedValueOnce(redirect).mockResolvedValueOnce(response);
        const handler = mockNavigationRoute.mock.calls.at(0)?.[0];
        const event = new MockFetchEvent('upgrading-page');

        // When the browser follows the redirect to a URL without the upgrade marker
        await handler?.({url: new URL(`https://new.expensify.com/redirect?${APP_UPDATE_QUERY_PARAM}=true`), event});
        const result = await handler?.({url: new URL('https://new.expensify.com/destination'), event: new MockFetchEvent(event.resultingClientId)});

        // Then the destination still loads fresh HTML and cannot pick up the saved older shell
        expect(result).toBe(response);
        expect(mockMatchPrecache).not.toHaveBeenCalled();

        // When the redirect has been consumed and another ordinary visit is made
        await handler?.({url: new URL('https://new.expensify.com/ordinary'), event});

        // Then the temporary redirect state is gone, so the saved app can be used normally again
        expect(mockMatchPrecache).toHaveBeenCalledWith('/index.html');
    });

    it('keeps a redirect on the network when the installed shell is missing', async () => {
        // Given an ordinary visit without a saved shell, whose network response is a redirect
        mockMatchPrecache.mockResolvedValueOnce(undefined);
        const response = createMock<Response>({type: 'basic'});
        mockUpgradeNavigation.mockResolvedValueOnce(createMock<Response>({type: 'opaqueredirect'})).mockResolvedValueOnce(response);
        const handler = mockNavigationRoute.mock.calls.at(0)?.[0];
        const event = new MockFetchEvent('page-without-shell');

        // When the browser follows the redirect
        await handler?.({url: new URL('https://new.expensify.com/r/123'), event});
        const result = await handler?.({url: new URL('https://new.expensify.com/destination'), event: new MockFetchEvent(event.resultingClientId)});

        // Then the destination also loads from the network, as for an upgrade, instead of a shell that may still be missing
        expect(result).toBe(response);
        expect(mockMatchPrecache).toHaveBeenCalledTimes(1);
    });

    it('forgets an abandoned upgrade redirect', async () => {
        // Given an upgrade redirect that never comes back to this worker
        mockUpgradeNavigation.mockResolvedValueOnce(createMock<Response>({type: 'opaqueredirect'}));
        const handler = mockNavigationRoute.mock.calls.at(0)?.[0];
        const event = new MockFetchEvent('abandoned-upgrade');
        await handler?.({url: new URL(`https://new.expensify.com/redirect?${APP_UPDATE_QUERY_PARAM}=true`), event});

        // When the short-lived redirect state expires
        jest.advanceTimersByTime(60 * 1000);
        await handler?.({url: new URL('https://new.expensify.com/ordinary'), event});

        // Then no redirect state is retained and ordinary visits use the saved app
        expect(mockMatchPrecache).toHaveBeenCalledWith('/index.html');
    });

    it.each(['/index.html', '/index.html?test=1', '/', '/r/123', '/settings/profile'])("handles app navigation to '%s'", (pathname) => {
        // Given a navigation to the app shell or a deep link
        const denylist = mockNavigationRoute.mock.calls.at(0)?.[1].denylist;

        // When the navigation is matched
        const isDenied = denylist?.some((pattern) => pattern.test(pathname));

        // Then navigation handling can choose the saved shell or upgrade path
        expect(isDenied).toBe(false);
        expect(mockNavigationRoute.mock.calls.at(0)?.[1].allowlist).toBeUndefined();
    });

    it.each(['/_test', '/.well-known/assetlinks.json', '/asset.js', '/fonts/font.woff2'])("leaves '%s' outside app navigation", (pathname) => {
        // Given a request that must not receive the app shell
        const denylist = mockNavigationRoute.mock.calls.at(0)?.[1].denylist;

        // When it is matched against the navigation route
        const isDenied = denylist?.some((pattern) => pattern.test(pathname));

        // Then the request is left to its normal handler
        expect(isDenied).toBe(true);
    });

    it('falls back to the installed shell when an upgrade network request fails', async () => {
        // Given the installed worker has a shell with matching precached assets
        const response = createMock<Response>({});
        mockMatchPrecache.mockResolvedValue(response);
        const plugin = mockNetworkOnly.mock.calls.at(0)?.[0].plugins.at(0);

        // When the upgrade network strategy cannot provide HTML
        const fallback = await plugin?.handlerDidError();

        // Then the worker uses its installed shell instead of a partially downloaded release
        expect(fallback).toBe(response);
        expect(mockMatchPrecache).toHaveBeenCalledWith('/index.html');
    });

    it('lets the browser follow navigation redirects instead of replacing them with cached HTML', async () => {
        // Given a redirect whose headers and body are intentionally hidden from the service worker
        const response = createMock<Response>({ok: false, type: 'opaqueredirect'});
        const plugin = mockNetworkOnly.mock.calls.at(0)?.[0].plugins.at(0);

        // When the network returns that navigation redirect
        const result = await plugin?.fetchDidSucceed({response});

        // Then the redirect is handed back to the browser without entering the offline fallback
        expect(result).toBe(response);
        expect(mockMatchPrecache).not.toHaveBeenCalled();
    });

    it.each([
        [200, 'text/html', true],
        [200, 'text/html; charset=utf-8', true],
        [503, 'text/html', false],
        [404, 'text/html', false],
        [200, 'application/json', false],
    ])('validates status %s and content type %s before using a network response', async (status, contentType, shouldUseResponse) => {
        // Given a network response that may be an error page or a non-HTML response
        const response = createMock<Response>({ok: status === 200, headers: createMock<Headers>({get: () => contentType})});
        const plugin = mockNetworkOnly.mock.calls.at(0)?.[0].plugins.at(0);

        // When Workbox validates it
        const result = plugin?.fetchDidSucceed({response});

        // Then only successful HTML is rendered; other responses trigger the offline fallback
        if (shouldUseResponse) {
            await expect(result).resolves.toBe(response);
        } else {
            await expect(result).rejects.toThrow('Navigation did not return a successful HTML response');
        }
    });

    describe('on the host that serves both products', () => {
        beforeEach(() => {
            startWorker(SHARED_PRODUCT_HOST);
        });

        it('registers sign-out, app-only and shared navigation before precache routes', () => {
            // Given the worker runs on the shared host
            // When it registers its routes at startup, before each test
            // Then each kind of navigation has its own route, and all of them come before cache-first routes
            expect(mockRegistrationOrder).toEqual(['route', 'route', 'route', 'precache', 'route']);
            expect(getNavigationRoute(0).options.allowlist).toEqual(SIGN_OUT_NAVIGATION_PATHS);
            expect(getNavigationRoute(1).options.allowlist).toEqual(APP_ONLY_NAVIGATION_PATHS);
            expect(getNavigationRoute(2).options.allowlist).toEqual(SHARED_NAVIGATION_PATHS);

            // And precache does not answer /index with /index.html, so a Classic /index reaches the server
            expect(mockPrecacheAndRoute).toHaveBeenCalledWith(undefined, {cleanURLs: false, directoryIndex: ''});
        });

        it.each([
            ['/signout.php?clean=true', 0],
            ['/r/123', 1],
            ['/index.html?appUpdateRequired=true', 1],
            ['/', 2],
            ['/inbox?authToken=t&email=e', 2],
            ['/reports', undefined],
            ['/signin', undefined],
            ['/inbox.php', undefined],
            ['/r/123/receipt.pdf', undefined],
            ['/_support/x', undefined],
        ])("routes '%s' to navigation route %s", (url, expectedRoute) => {
            // Given a navigation on the shared host, which must reach at most one navigation route
            // When a navigation is matched against every registered navigation route
            const matchingRoutes = [0, 1, 2].filter((index) => routeMatches(getNavigationRoute(index).options, url));

            // Then at most one route handles it, and Classic pages are left to the browser
            expect(matchingRoutes).toEqual(expectedRoute === undefined ? [] : [expectedRoute]);
        });

        it('keeps the saved app for app-only paths', async () => {
            // Given a saved shell
            const shell = createMock<Response>({});
            mockMatchPrecache.mockResolvedValue(shell);

            // When an app-only path is opened
            const result = await getNavigationRoute(1).handler({
                url: new URL(`https://${SHARED_PRODUCT_HOST}/r/123`),
            });

            // Then the saved app opens without the network
            expect(result).toBe(shell);
            expect(mockUpgradeNavigation).not.toHaveBeenCalled();
        });

        it.each([
            ['a redirect', createMock<Response>({type: 'opaqueredirect', ok: false})],
            ['an error page', createMock<Response>({ok: false, status: 404})],
            ['a server error', createMock<Response>({ok: false, status: 500})],
            [
                'a non-HTML page',
                createMock<Response>({
                    ok: true,
                    headers: createMock<Headers>({get: () => 'application/json'}),
                }),
            ],
        ])('shows %s from the server for a shared path', async (_, response) => {
            // Given the server answers a shared path, for example with an Expensify Classic page
            mockSharedNavigation.mockResolvedValueOnce(response);
            const options = {
                url: new URL(`https://${SHARED_PRODUCT_HOST}/inbox`),
                event: new MockFetchEvent('page'),
            };

            // When the worker handles it
            const result = await getNavigationRoute(2).handler(options);

            // Then the response is shown as it is, without the saved app or HTML validation
            expect(result).toBe(response);
            expect(mockSharedNavigation).toHaveBeenCalledWith(options);
            expect(mockMatchPrecache).not.toHaveBeenCalled();
            expect(mockUpgradeNavigation).not.toHaveBeenCalled();
            expect(getSharedStrategyPlugin()?.fetchDidSucceed).toBeUndefined();
        });

        it('does not treat an ordinary redirect on a shared path as an upgrade', async () => {
            // Given Expensify Classic redirects / to /inbox
            mockSharedNavigation.mockResolvedValueOnce(createMock<Response>({type: 'opaqueredirect'}));
            const event = new MockFetchEvent('classic-page');
            await getNavigationRoute(2).handler({
                url: new URL(`https://${SHARED_PRODUCT_HOST}/`),
                event,
            });

            // When the browser follows the redirect to an app-only path in the same page
            const shell = createMock<Response>({});
            mockMatchPrecache.mockResolvedValue(shell);
            const result = await getNavigationRoute(1).handler({
                url: new URL(`https://${SHARED_PRODUCT_HOST}/r/123`),
                event,
            });

            // Then the saved app opens, because no upgrade is in progress
            expect(result).toBe(shell);
            expect(mockUpgradeNavigation).not.toHaveBeenCalled();
        });

        it('keeps an upgrade that starts on a shared path on the network after a redirect to an app-only path', async () => {
            // Given an upgrade of / that the server redirects to /transition, dropping the marker
            const response = createMock<Response>({type: 'basic'});
            mockSharedUpgradeNavigation.mockResolvedValueOnce(createMock<Response>({type: 'opaqueredirect'}));
            mockUpgradeNavigation.mockResolvedValueOnce(response);
            const event = new MockFetchEvent('upgrading-page');
            await getNavigationRoute(2).handler({
                url: new URL(`https://${SHARED_PRODUCT_HOST}/?${APP_UPDATE_QUERY_PARAM}=true`),
                event,
            });

            // When the browser follows the redirect
            const result = await getNavigationRoute(1).handler({
                url: new URL(`https://${SHARED_PRODUCT_HOST}/transition`),
                event,
            });

            // Then the upgrade loads validated fresh HTML instead of the saved older app
            expect(result).toBe(response);
            expect(mockSharedNavigation).not.toHaveBeenCalled();
            expect(mockMatchPrecache).not.toHaveBeenCalled();
        });

        it.each([
            ['without the Cookie Store API', undefined, true],
            ['for a New Expensify user', async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.NEW}), true],
            ['for an Expensify Classic user', async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC}), false],
            ['without the cookie', async () => null, false],
            ['with an unknown cookie value', async () => ({value: 'other'}), false],
            [
                'when reading the cookie fails',
                async () => {
                    throw new Error('Cookie read failed');
                },
                false,
            ],
        ])('opens the saved app for a shared path offline only %s when expected', async (_, getCookie, shouldOpenSavedApp) => {
            // Given the network is unavailable for a shared path
            const shell = createMock<Response>({});
            mockMatchPrecache.mockResolvedValue(shell);
            arrangeCookieStore(getCookie);
            const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

            // When the shared network strategy falls back
            const result = await getSharedStrategyPlugin()?.handlerDidError();

            // Then only a New Expensify user gets the saved app; others get the browser's own offline error, as without the worker
            expect(result).toBe(shouldOpenSavedApp ? shell : undefined);
            expect(mockMatchPrecache).toHaveBeenCalledTimes(shouldOpenSavedApp ? 1 : 0);
            logError.mockRestore();
        });

        it.each([
            ['without the Cookie Store API', undefined, true],
            ['for a New Expensify user', async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.NEW}), true],
            ['for an Expensify Classic user', async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC}), false],
            ['without the cookie', async () => null, false],
        ])('opens the saved app for a shared path upgrade offline only %s when expected', async (_, getCookie, shouldOpenSavedApp) => {
            // Given the network is unavailable for an upgrade of a shared path
            const shell = createMock<Response>({});
            mockMatchPrecache.mockResolvedValue(shell);
            arrangeCookieStore(getCookie);
            const options = {
                url: new URL(`https://${SHARED_PRODUCT_HOST}/inbox?${APP_UPDATE_QUERY_PARAM}=true`),
                event: new MockFetchEvent('page'),
            };

            // When the upgrade is handled and its strategy falls back
            await getNavigationRoute(2).handler(options);
            const result = await getSharedUpgradeStrategyPlugin()?.handlerDidError();

            // Then the shared upgrade strategy handles it, and only a New Expensify user gets the saved app
            expect(mockSharedUpgradeNavigation).toHaveBeenCalledWith(options);
            expect(mockUpgradeNavigation).not.toHaveBeenCalled();
            expect(result).toBe(shouldOpenSavedApp ? shell : undefined);
            expect(mockMatchPrecache).toHaveBeenCalledTimes(shouldOpenSavedApp ? 1 : 0);
        });

        it('validates HTML for a shared path upgrade', async () => {
            // Given a shared path upgrade strategy
            const plugin = getSharedUpgradeStrategyPlugin();

            // When the server answers with an error page
            const result = plugin?.fetchDidSucceed({response: createMock<Response>({ok: false, status: 404})});

            // Then the upgrade fails as it does for any other upgrade
            await expect(result).rejects.toThrow('Navigation did not return a successful HTML response');
        });

        it.each([
            ['an Expensify Classic user', async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC})],
            ['no cookie', async () => null],
            ['a New Expensify user', async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.NEW})],
        ])('opens the saved app for an app-only path upgrade offline for %s', async (_, getCookie) => {
            // Given the network is unavailable for an upgrade of an app-only path
            const shell = createMock<Response>({});
            mockMatchPrecache.mockResolvedValue(shell);
            arrangeCookieStore(getCookie);

            // When the upgrade strategy falls back
            const result = await getUpgradeStrategyPlugin()?.handlerDidError();

            // Then the saved app opens whatever the cookie
            expect(result).toBe(shell);
        });

        it('reads the experience cookie by its name', async () => {
            // Given a browser that can read cookies in the worker
            const getCookie = arrangeCookieStore(async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.NEW}));

            // When a shared path falls back offline
            await getSharedStrategyPlugin()?.handlerDidError();

            // Then the worker reads the cookie the server writes
            expect(getCookie).toHaveBeenCalledWith(CONST.EXPERIENCE_COOKIE.NAME);
        });

        it.each(['/signout', '/signout.php?clean=true', '/authentication/saml/logoutCallback.php?x=1', '/authentication/saml/logoutCallback?domain=a.com'])(
            'blocks and deletes saved media before signing out through %s',
            async (path) => {
                // Given receipts saved by the worker
                const cacheStorage = arrangeCacheStorage(['user-media']);
                const response = createMock<Response>({});
                mockFetch.mockResolvedValueOnce(response);

                // When the user signs out of Expensify Classic
                const request = createMock<Request>({});
                const result = await getNavigationRoute(0).handler({
                    url: new URL(`https://${SHARED_PRODUCT_HOST}${path}`),
                    request,
                });

                // Then later saves are blocked, saved media is gone, and the sign-out reaches the server
                expect([...cacheStorage.names]).toEqual(['user-media-blocked']);
                expect(cacheStorage.open.mock.invocationCallOrder.at(0)).toBeLessThan(cacheStorage.delete.mock.invocationCallOrder.at(0) ?? 0);
                expect(mockFetch).toHaveBeenCalledWith(request);
                expect(result).toBe(response);
            },
        );

        it('signs out even when Cache Storage fails', async () => {
            // Given Cache Storage that rejects every call
            const cacheStorage = arrangeCacheStorage();
            cacheStorage.open.mockRejectedValue(new Error('Cache Storage unavailable'));
            const response = createMock<Response>({});
            mockFetch.mockResolvedValueOnce(response);
            const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

            // When the user signs out of Expensify Classic
            const result = await getNavigationRoute(0).handler({
                url: new URL(`https://${SHARED_PRODUCT_HOST}/signout`),
                request: createMock<Request>({}),
            });

            // Then the sign-out still reaches the server, so the session ends
            expect(result).toBe(response);
            logError.mockRestore();
        });

        it('removes itself and its saved media once the cookie selects Expensify Classic', async () => {
            // Given a worker with saved media, in a browser whose cookie now selects Classic
            const cacheStorage = arrangeCacheStorage(['user-media']);
            arrangeCookieStore(async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC}));

            // When a page is opened
            const event = await sendRequest('navigate');

            // Then saving is blocked, saved media is gone, and the worker is unregistered last
            expect([...cacheStorage.names]).toEqual(['user-media-blocked']);
            expect(mockUnregister).toHaveBeenCalledTimes(1);
            expect(cacheStorage.delete.mock.invocationCallOrder.at(0)).toBeLessThan(mockUnregister.mock.invocationCallOrder.at(0) ?? 0);

            // And the page load itself is left to the worker's routes and the browser
            expect(event.respondWith).not.toHaveBeenCalled();
        });

        it.each([
            ['the New Expensify value', {value: CONST.EXPERIENCE_COOKIE.VALUES.NEW}],
            ['an unknown value', {value: 'other'}],
            ['no value', null],
        ])('stays registered when the cookie has %s', async (_description, cookie) => {
            // Given a worker with saved media, in a browser whose cookie doesn't select Classic
            const cacheStorage = arrangeCacheStorage(['user-media']);
            arrangeCookieStore(async () => cookie);

            // When a page is opened
            await sendRequest('navigate');

            // Then the worker and its media stay, because only a Classic choice removes them
            expect(mockUnregister).not.toHaveBeenCalled();
            expect([...cacheStorage.names]).toEqual(['user-media']);
        });

        it('stays registered in a browser whose workers cannot read cookies', async () => {
            // Given a browser without the Cookie Store API
            arrangeCookieStore();

            // When a page is opened
            await sendRequest('navigate');

            // Then the worker stays, because it can't tell which product the user chose
            expect(mockUnregister).not.toHaveBeenCalled();
        });

        it('stays registered when the cookie cannot be read', async () => {
            // Given a cookie read that fails
            arrangeCookieStore(async () => {
                throw new Error('Cookie read failed');
            });
            const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

            // When a page is opened
            await sendRequest('navigate');

            // Then the failure is logged and the worker stays, so a New Expensify user keeps working offline
            expect(logError).toHaveBeenCalled();
            expect(mockUnregister).not.toHaveBeenCalled();
            logError.mockRestore();
        });

        it('removes itself for a Classic user even when Cache Storage fails', async () => {
            // Given Cache Storage that rejects every call, in a browser whose cookie selects Classic
            const cacheStorage = arrangeCacheStorage();
            cacheStorage.open.mockRejectedValue(new Error('Cache Storage unavailable'));
            cacheStorage.delete.mockRejectedValue(new Error('Cache Storage unavailable'));
            arrangeCookieStore(async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC}));
            const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

            // When a page is opened
            await sendRequest('navigate');

            // Then the worker is still unregistered, and the failure is logged
            expect(mockUnregister).toHaveBeenCalledTimes(1);
            expect(logError).toHaveBeenCalled();
            logError.mockRestore();
        });

        it('reads the cookie only when a page is opened', async () => {
            // Given a browser whose cookie selects Classic
            const getCookie = arrangeCookieStore(async () => ({value: CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC}));

            // When a page the worker controls requests a file
            const event = await sendRequest('cors');

            // Then the cookie is not read, so ordinary requests cost nothing
            expect(getCookie).not.toHaveBeenCalled();
            expect(event.waitUntil).not.toHaveBeenCalled();
            expect(mockUnregister).not.toHaveBeenCalled();
        });

        it.each([
            ['/site/images/logo.png', 'image', false],
            // cspell:disable-next-line
            ['/newjs/x.png', 'image', false],
            ['/Site/x.png', 'image', false],
            ['/receipts/w_123.jpg', '', true],
            ['/chat-attachments/1/x.png', 'image', true],
            ['/logo-abc12345.png', 'image', true],
            ['/sitemap.png', 'image', true],
        ])("decides whether to save '%s' as user media", (path, destination, shouldSave) => {
            // Given a same-origin request, which can be New Expensify's media or a Classic page asset
            // When a same-origin request is matched against the user media route
            const matches = getUserMediaMatcher()({
                sameOrigin: true,
                url: new URL(`https://${SHARED_PRODUCT_HOST}${path}`),
                request: {destination},
            });

            // Then New Expensify's media is saved and Expensify Classic's page assets are not
            expect(matches).toBe(shouldSave);
        });
    });

    it('never checks the cookie on page loads on other hosts', () => {
        // Given the worker on New Expensify's own host, where every user is a New Expensify user
        // When it starts, before each test
        // Then it adds no listener of its own for requests, so it can't remove itself
        expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it('saves Expensify Classic paths as user media on other hosts as before', () => {
        // Given the worker on New Expensify's own host
        // When an image under a Classic asset path is requested
        const matches = getUserMediaMatcher()({
            sameOrigin: true,
            url: new URL(`https://${OTHER_HOST}/site/x.png`),
            request: {destination: 'image'},
        });

        // Then it is saved, as it was before the shared host existed
        expect(matches).toBe(true);
    });

    describe('user media', () => {
        beforeEach(() => {
            startWorker(SHARED_PRODUCT_HOST);
        });

        it('runs the cache deletion after the expiry update so the cache stays deleted', () => {
            // Given the worker on the shared host
            // When it builds the media strategy
            const plugins = mockStaleWhileRevalidate.mock.calls.at(0)?.[0].plugins;

            // Then the plugin that deletes the blocked cache runs last, because the expiry update reopens the cache
            expect(plugins).toHaveLength(2);
            expect(plugins?.at(0)?.cacheDidUpdate).toBeUndefined();
            expect(plugins?.at(1)?.cacheDidUpdate).toBeDefined();
        });

        it('keeps Workbox defaults for saved media on New Expensify’s own host', () => {
            // Given New Expensify on its own host, where saving media is never blocked
            // When the worker starts
            startWorker(OTHER_HOST);

            // Then the media cache only expires old entries, as before the shared host existed
            const plugins = mockStaleWhileRevalidate.mock.calls.at(0)?.[0].plugins;
            expect(plugins).toHaveLength(1);
            expect(plugins?.at(0)?.cacheWillUpdate).toBeUndefined();
        });

        it.each([
            [200, true],
            [0, true],
            [403, false],
            [404, false],
            [500, false],
        ])('saves a response with status %s only when it is usable', async (status, shouldSave) => {
            // Given saving is not blocked
            arrangeCacheStorage();
            const response = createMock<Response>({status});

            // When the worker is about to save a response
            const result = await getUserMediaPlugin().cacheWillUpdate?.({
                response,
            });

            // Then only successful and opaque responses are saved, as Workbox's default filter does
            expect(result).toBe(shouldSave ? response : null);
        });

        it('saves nothing while saving is blocked, even after the worker restarts', async () => {
            // Given the app blocked saving media
            arrangeCacheStorage(['user-media-blocked']);

            // When a stopped worker starts again and is about to save a receipt
            startWorker(SHARED_PRODUCT_HOST);
            const result = await getUserMediaPlugin().cacheWillUpdate?.({
                response: createMock<Response>({status: 200}),
            });

            // Then the receipt is not saved
            expect(result).toBeNull();
        });

        it('deletes media saved by a request that finished after the block', async () => {
            // Given a receipt request that passed the check before saving was blocked
            const cacheStorage = arrangeCacheStorage();
            await getUserMediaPlugin().cacheWillUpdate?.({
                response: createMock<Response>({status: 200}),
            });

            // When the block is set and the delayed save recreates the cache
            cacheStorage.names.add('user-media-blocked');
            cacheStorage.names.add('user-media');
            await getUserMediaPlugin().cacheDidUpdate?.();

            // Then the recreated cache is deleted again
            expect(cacheStorage.names.has('user-media')).toBe(false);
        });

        it('keeps saved media when saving is not blocked', async () => {
            // Given saving is not blocked
            const cacheStorage = arrangeCacheStorage(['user-media']);

            // When a receipt has been saved
            await getUserMediaPlugin().cacheDidUpdate?.();

            // Then it stays saved
            expect(cacheStorage.names.has('user-media')).toBe(true);
        });
    });
});
