/** Regression coverage for navigation freshness and the worker's coherent offline fallback. */
import createMock from '../utils/createMock';

type NavigationOptions = {
    networkTimeoutSeconds: number;
    plugins: Array<{
        requestWillFetch: (options: {request: Request}) => Promise<Request>;
        fetchDidSucceed: (options: {response: Response}) => Promise<Response>;
        handlerDidError: () => Promise<Response | undefined>;
    }>;
};

const mockNetworkOnly = jest.fn<void, [NavigationOptions]>();
const mockNavigationRoute = jest.fn<void, [unknown, {denylist: RegExp[]}]>();
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
    NavigationRoute: jest.fn((handler: unknown, options: {denylist: RegExp[]}) => mockNavigationRoute(handler, options)),
    registerRoute: () => mockRegistrationOrder.push('route'),
}));
jest.mock('workbox-strategies', () => ({
    NetworkOnly: jest.fn((options: NavigationOptions) => mockNetworkOnly(options)),
    StaleWhileRevalidate: jest.fn(),
}));

describe('service worker navigation', () => {
    beforeAll(() => {
        Object.defineProperty(globalThis, 'skipWaiting', {configurable: true, value: mockSkipWaiting});
    });

    afterAll(() => {
        Reflect.deleteProperty(globalThis, 'skipWaiting');
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockRegistrationOrder.length = 0;
        jest.isolateModules(() => {
            jest.requireActual('../../web/service-worker');
        });
    });

    it('handles navigation before precache routes can return stale HTML', () => {
        // Given the worker has both navigation and precache handlers
        // When it registers its routes
        // Then / and /index.html reach the network handler before the precache handler
        expect(mockRegistrationOrder).toEqual(['route', 'precache', 'route']);
        expect(mockNetworkOnly.mock.calls.at(0)?.[0].networkTimeoutSeconds).toBe(3);
    });

    it.each(['/index.html', '/index.html?test=1', '/', '/r/123', '/settings/profile'])("checks the network for '%s'", (pathname) => {
        // Given a navigation to the app shell or a deep link
        const denylist = mockNavigationRoute.mock.calls.at(0)?.[1].denylist;

        // When the navigation is matched
        const isDenied = denylist?.some((pattern) => pattern.test(pathname));

        // Then it is not allowed to fall through to cache-first precaching
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

    it('falls back to the installed shell on network failure or timeout', async () => {
        // Given the installed worker has a shell with matching precached assets
        const response = createMock<Response>({});
        mockMatchPrecache.mockResolvedValue(response);
        const plugin = mockNetworkOnly.mock.calls.at(0)?.[0].plugins.at(0);

        // When the bounded network strategy cannot provide HTML
        const fallback = await plugin?.handlerDidError();

        // Then the worker uses its installed shell instead of a partially downloaded release
        expect(fallback).toBe(response);
        expect(mockMatchPrecache).toHaveBeenCalledWith('/index.html');
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
