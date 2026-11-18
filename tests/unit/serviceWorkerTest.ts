/** Regression coverage for navigation freshness and the worker's coherent offline fallback. */
import {APP_UPDATE_QUERY_PARAM} from '@libs/AppUpdateURL';

import createMock from '../utils/createMock';

type NavigationOptions = {
    networkTimeoutSeconds?: number;
    plugins: Array<{
        requestWillFetch?: (options: {request: Request}) => Promise<Request>;
        fetchDidSucceed: (options: {response: Response}) => Promise<Response>;
        handlerDidError: () => Promise<Response | undefined>;
    }>;
};

class MockFetchEvent {
    resultingClientId: string;

    constructor(resultingClientId: string) {
        this.resultingClientId = resultingClientId;
    }
}

type NavigationHandler = (options: {url: URL; event?: MockFetchEvent}) => Promise<Response>;

const mockUpgradeNavigation = jest.fn<Promise<Response>, [{url: URL; event?: MockFetchEvent}]>();
const mockNetworkOnly = jest.fn<{plugins: NavigationOptions['plugins']; handle: NavigationHandler}, [NavigationOptions]>();
const mockNavigationRoute = jest.fn<void, [NavigationHandler, {denylist: RegExp[]}]>();
const mockRegistrationOrder: string[] = [];
const mockMatchPrecache = jest.fn<Promise<Response | undefined>, [string]>();
const mockSkipWaiting = jest.fn();

jest.mock('workbox-core', () => ({clientsClaim: jest.fn()}));
jest.mock('workbox-expiration', () => ({ExpirationPlugin: jest.fn()}));
jest.mock('workbox-precaching', () => ({
    matchPrecache: (url: string) => mockMatchPrecache(url),
    precacheAndRoute: () => mockRegistrationOrder.push('precache'),
}));
jest.mock('workbox-routing', () => ({
    NavigationRoute: jest.fn((handler: NavigationHandler, options: {denylist: RegExp[]}) => mockNavigationRoute(handler, options)),
    registerRoute: () => mockRegistrationOrder.push('route'),
}));
jest.mock('workbox-strategies', () => ({
    NetworkOnly: jest.fn((options: NavigationOptions) => mockNetworkOnly(options)),
    StaleWhileRevalidate: jest.fn(),
}));

describe('service worker navigation', () => {
    beforeAll(() => {
        Object.defineProperty(globalThis, 'skipWaiting', {configurable: true, value: mockSkipWaiting});
        Object.defineProperty(globalThis, 'FetchEvent', {configurable: true, value: MockFetchEvent});
    });

    afterAll(() => {
        Reflect.deleteProperty(globalThis, 'skipWaiting');
        Reflect.deleteProperty(globalThis, 'FetchEvent');
    });

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockUpgradeNavigation.mockReset();
        mockUpgradeNavigation.mockResolvedValue(createMock<Response>({type: 'basic'}));
        mockRegistrationOrder.length = 0;
        mockNetworkOnly.mockImplementation((options) => ({
            plugins: options.plugins,
            handle: mockUpgradeNavigation,
        }));
        mockMatchPrecache.mockResolvedValue(createMock<Response>({}));
        jest.isolateModules(() => {
            jest.requireActual('../../web/service-worker');
        });
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('registers navigation before precache routes so upgrades can bypass cached HTML', () => {
        // Given the worker has both navigation and precache handlers
        // When it registers its routes
        // Then upgrades to / and /index.html reach the navigation handler before cache-first routes
        expect(mockRegistrationOrder).toEqual(['route', 'precache', 'route']);
        expect(mockNetworkOnly.mock.calls.at(0)?.[0].networkTimeoutSeconds).toBeUndefined();
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
});
