import * as NativeLegacyHostHop from '@libs/LegacyHostHop/index.native';
import type * as WebLegacyHostHop from '@libs/LegacyHostHop/index.ts';

import CONST from '@src/CONST';
import type {Session} from '@src/types/onyx';

const LEGACY_ORIGIN = 'https://dev.new.expensify.com:8082';
const SHARED_ORIGIN = 'https://expensify.com.dev';

const mockGetShortLivedAuthToken = jest.fn<Promise<string | undefined>, []>();
const mockWaitForIdle = jest.fn<Promise<unknown>, unknown[]>();
let mockIsOffline = false;
let mockInMemoryRequests: unknown[] = [];
const mockWaitForPersistedRequests = jest.fn<Promise<void>, []>();

jest.mock('@src/CONFIG', () => {
    const actualConfig = jest.requireActual<{default: Record<string, unknown>}>('@src/CONFIG').default;
    return {__esModule: true, default: {...actualConfig, ENVIRONMENT: 'development'}};
});
jest.mock('@libs/Environment/Environment', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/Environment/Environment'),
    getCachedEnvironmentURL: () => 'https://dev.new.expensify.com:8082',
}));

// The React Native preset resolves index.native.ts first, so the web implementations are loaded by their file names
jest.mock('@libs/ExperienceCookie', () => jest.requireActual<Record<string, unknown>>('@libs/ExperienceCookie/index.ts'));
jest.mock('@userActions/Link', () => ({getShortLivedAuthToken: () => mockGetShortLivedAuthToken()}));
jest.mock('@libs/Network/SequentialQueue', () => ({waitForIdle: () => mockWaitForIdle()}));
jest.mock('@libs/NetworkState', () => ({getIsOffline: () => mockIsOffline}));
jest.mock('@userActions/PersistedRequests', () => ({getAllIncludingOngoing: () => mockInMemoryRequests, waitForInitialization: () => mockWaitForPersistedRequests()}));
jest.mock('@libs/Log', () => ({__esModule: true, default: {info: jest.fn(), hmmm: jest.fn()}}));

const {shouldHopToSharedHost, hopToSharedHost} = jest.requireActual<typeof WebLegacyHostHop>('@libs/LegacyHostHop/index.ts');

const SIGNED_IN_SESSION: Session = {authToken: 'authToken', email: 'user+beta@example.com', accountID: 1};

const mockReplace = jest.fn<void, [string]>();
let realLocation: Location;
let cookieGetter: jest.SpyInstance<string, []>;

/** Points jsdom at the given URL without triggering a real navigation */
function arrangeLocation(href: string) {
    const {origin, pathname, search, hash} = new URL(href);
    Object.defineProperty(window, 'location', {value: {origin, pathname, search, hash, replace: mockReplace}, writable: true, configurable: true});
}

function arrangeCookies(cookies: string) {
    cookieGetter.mockReturnValue(cookies);
}

beforeEach(() => {
    jest.clearAllMocks();
    realLocation = window.location;
    cookieGetter = jest.spyOn(Document.prototype, 'cookie', 'get');
    sessionStorage.clear();
    mockIsOffline = false;
    mockInMemoryRequests = [];
    mockWaitForPersistedRequests.mockResolvedValue(undefined);
    mockWaitForIdle.mockResolvedValue(undefined);
    mockGetShortLivedAuthToken.mockResolvedValue('short+lived/token');
    arrangeLocation(`${LEGACY_ORIGIN}/r/123?foo=bar#hash`);
    arrangeCookies('other=1; experience=new');
});

afterEach(() => {
    jest.useRealTimers();
    cookieGetter.mockRestore();
    jest.restoreAllMocks();
    Object.defineProperty(window, 'location', {value: realLocation, writable: true, configurable: true});
});

describe('LegacyHostHop', () => {
    describe('shouldHopToSharedHost', () => {
        it.each([CONST.EXPERIENCE_COOKIE.VALUES.NEW, CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC])('hops on the legacy host with experience=%s', (value) => {
            arrangeCookies(`experience=${value}`);

            expect(shouldHopToSharedHost()).toBe(true);
        });

        it.each([
            ['no experience cookie', 'other=1'],
            ['an unknown experience value', 'experience=foo'],
            ['an empty experience value', 'experience='],
        ])('stays with %s', (_, cookies) => {
            arrangeCookies(cookies);

            expect(shouldHopToSharedHost()).toBe(false);
        });

        it.each([
            ['the shared host', `${SHARED_ORIGIN}/r/123`],
            ['another port of the legacy host', 'https://dev.new.expensify.com:8083/r/123'],
            ['an unrelated host', 'http://localhost/r/123'],
        ])('stays on %s', (_, href) => {
            arrangeLocation(href);

            expect(shouldHopToSharedHost()).toBe(false);
        });

        it('stays while the router brake cookie is set', () => {
            arrangeCookies('experience=new; hybridWebClassicHost=www');

            expect(shouldHopToSharedHost()).toBe(false);
        });

        it('stays when this tab hopped within the guard duration', () => {
            sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP, String(Date.now() - CONST.LEGACY_HOST_HOP.TAB_GUARD_DURATION_MS + 1000));

            expect(shouldHopToSharedHost()).toBe(false);
        });

        it('hops again once the guard duration has passed', () => {
            sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP, String(Date.now() - CONST.LEGACY_HOST_HOP.TAB_GUARD_DURATION_MS - 1));

            expect(shouldHopToSharedHost()).toBe(true);
        });

        it.each(['', 'abc', '-5', '1.5'])('stays when the tab mark is %p', (mark) => {
            sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP, mark);

            expect(shouldHopToSharedHost()).toBe(false);
        });

        it('stays when sessionStorage throws', () => {
            jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('blocked');
            });

            expect(shouldHopToSharedHost()).toBe(false);
        });

        it('never hops on native', async () => {
            expect(NativeLegacyHostHop.shouldHopToSharedHost()).toBe(false);
            await expect(NativeLegacyHostHop.hopToSharedHost(SIGNED_IN_SESSION)).resolves.toBe(false);
        });
    });

    describe('hopToSharedHost', () => {
        it('moves a signed out page to the same path on the shared host', async () => {
            await expect(hopToSharedHost(undefined)).resolves.toBe(true);

            expect(mockReplace).toHaveBeenCalledWith(`${SHARED_ORIGIN}/r/123?foo=bar#hash`);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP)).not.toBeNull();
        });

        it('moves an anonymous session without a token', async () => {
            await expect(hopToSharedHost({authToken: 'anon', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS})).resolves.toBe(true);

            expect(mockReplace).toHaveBeenCalledWith(`${SHARED_ORIGIN}/r/123?foo=bar#hash`);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
        });

        it('forwards a /transition link as it is', async () => {
            arrangeLocation(`${LEGACY_ORIGIN}/transition?shortLivedAuthToken=abc&email=a%40b.com&exitTo=r%2F1`);

            await expect(hopToSharedHost(SIGNED_IN_SESSION)).resolves.toBe(true);

            expect(mockReplace).toHaveBeenCalledWith(`${SHARED_ORIGIN}/transition?shortLivedAuthToken=abc&email=a%40b.com&exitTo=r%2F1`);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
        });

        it('waits for the write queue, then moves a signed in page through /transition', async () => {
            await expect(hopToSharedHost(SIGNED_IN_SESSION)).resolves.toBe(true);

            expect(mockWaitForIdle.mock.invocationCallOrder.at(0)).toBeLessThan(mockGetShortLivedAuthToken.mock.invocationCallOrder.at(0) ?? 0);
            const url = new URL(mockReplace.mock.calls.at(0)?.at(0) ?? '');
            expect(url.origin + url.pathname).toBe(`${SHARED_ORIGIN}/transition`);
            expect(url.searchParams.get('shortLivedAuthToken')).toBe('short+lived/token');
            expect(url.searchParams.get('email')).toBe('user+beta@example.com');
            expect(url.searchParams.get('exitTo')).toBe('r/123?foo=bar');
        });

        it('leaves out exitTo for the root path', async () => {
            arrangeLocation(`${LEGACY_ORIGIN}/`);

            await hopToSharedHost(SIGNED_IN_SESSION);

            const url = new URL(mockReplace.mock.calls.at(0)?.at(0) ?? '');
            expect(url.searchParams.has('exitTo')).toBe(false);
        });

        it.each([
            ['no token', undefined],
            ['an empty token', ''],
        ])('stays when the token request returns %s and does not retry in this tab', async (_, token) => {
            mockGetShortLivedAuthToken.mockResolvedValue(token);

            await expect(hopToSharedHost(SIGNED_IN_SESSION)).resolves.toBe(false);

            expect(mockReplace).not.toHaveBeenCalled();
            expect(shouldHopToSharedHost()).toBe(false);
        });

        it('stays when queued requests remain after waiting', async () => {
            mockInMemoryRequests = [{command: 'AddComment'}];

            await expect(hopToSharedHost(SIGNED_IN_SESSION)).resolves.toBe(false);

            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('checks the queue only after the stored requests have loaded', async () => {
            let finishLoading: () => void = () => {};
            mockWaitForPersistedRequests.mockReturnValue(
                new Promise((resolve) => {
                    finishLoading = resolve;
                }),
            );

            const result = hopToSharedHost(SIGNED_IN_SESSION);
            await Promise.resolve();
            expect(mockWaitForIdle).not.toHaveBeenCalled();

            mockInMemoryRequests = [{command: 'AddComment'}];
            finishLoading();

            await expect(result).resolves.toBe(false);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
        });

        it('stays offline without waiting for the queue', async () => {
            mockIsOffline = true;

            await expect(hopToSharedHost(SIGNED_IN_SESSION)).resolves.toBe(false);

            expect(mockWaitForIdle).not.toHaveBeenCalled();
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('stays when the queue does not drain before the timeout', async () => {
            jest.useFakeTimers();
            mockWaitForIdle.mockReturnValue(new Promise(() => {}));

            const result = hopToSharedHost(SIGNED_IN_SESSION);
            jest.advanceTimersByTime(CONST.LEGACY_HOST_HOP.TIMEOUT_MS);

            await expect(result).resolves.toBe(false);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('ignores a token that arrives after the timeout', async () => {
            jest.useFakeTimers();
            let resolveToken: (token: string) => void = () => {};
            mockGetShortLivedAuthToken.mockReturnValue(
                new Promise((resolve) => {
                    resolveToken = resolve;
                }),
            );

            const result = hopToSharedHost(SIGNED_IN_SESSION);
            await jest.advanceTimersByTimeAsync(CONST.LEGACY_HOST_HOP.TIMEOUT_MS);
            await expect(result).resolves.toBe(false);

            expect(mockGetShortLivedAuthToken).toHaveBeenCalledTimes(1);

            resolveToken('late-token');
            await Promise.resolve();

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it.each([
            ['Supportal', {...SIGNED_IN_SESSION, authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT}],
            ['Supportal with a used support token', {...SIGNED_IN_SESSION, isSupportAuthTokenUsed: true}],
            ['Copilot', {...SIGNED_IN_SESSION, authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE}],
        ])('stays in a %s session without marking the tab', async (_, session: Session) => {
            await expect(hopToSharedHost(session)).resolves.toBe(false);

            expect(mockReplace).not.toHaveBeenCalled();
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP)).toBeNull();
        });

        it.each([
            ['without the experience cookie', () => arrangeCookies('other=1')],
            ['while the brake cookie is set', () => arrangeCookies('experience=new; hybridWebClassicHost=www')],
            ['on the shared host', () => arrangeLocation(`${SHARED_ORIGIN}/r/123`)],
        ])('does nothing %s', async (_, arrange) => {
            arrange();

            await expect(hopToSharedHost(SIGNED_IN_SESSION)).resolves.toBe(false);

            expect(mockReplace).not.toHaveBeenCalled();
            expect(mockWaitForIdle).not.toHaveBeenCalled();
            expect(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP)).toBeNull();
        });

        it('hops only once per tab', async () => {
            await hopToSharedHost(undefined);
            await expect(hopToSharedHost(undefined)).resolves.toBe(false);

            expect(mockReplace).toHaveBeenCalledTimes(1);
        });

        it('stays when the tab mark cannot be stored', async () => {
            jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('quota');
            });

            await expect(hopToSharedHost(undefined)).resolves.toBe(false);

            expect(mockReplace).not.toHaveBeenCalled();
        });
    });
});
