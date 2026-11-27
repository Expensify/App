import * as NativeLegacyHostHop from '@libs/LegacyHostHop/index.native';
import type * as WebLegacyHostHop from '@libs/LegacyHostHop/index.ts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
const EXPERIENCE_VALUES = [CONST.EXPERIENCE_COOKIE.VALUES.NEW, CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC];

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

function arrangeBrowserOffline() {
    jest.spyOn(Navigator.prototype, 'onLine', 'get').mockReturnValue(false);
}

function getNavigatedURL(): URL {
    return new URL(mockReplace.mock.calls.at(0)?.at(0) ?? '');
}

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(async () => {
    jest.clearAllMocks();
    await Onyx.set(ONYXKEYS.SESSION, SIGNED_IN_SESSION);
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
        it.each(EXPERIENCE_VALUES)('hops on the legacy host with experience=%s', (value) => {
            // Given a page on the legacy host in a browser with either experience value
            arrangeCookies(`experience=${value}`);

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it hops, since the cookie marks a browser that uses the shared host whichever product it prefers
            expect(shouldHop).toBe(true);
        });

        it.each([
            ['no experience cookie', 'other=1'],
            ['an unknown experience value', 'experience=foo'],
            ['an empty experience value', 'experience='],
        ])('stays with %s', (_, cookies) => {
            // Given a browser without a valid experience cookie
            arrangeCookies(cookies);

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it stays, because only browsers with the cookie use the shared host
            expect(shouldHop).toBe(false);
        });

        it.each([
            ['the shared host', `${SHARED_ORIGIN}/r/123`],
            ['another port of the legacy host', 'https://dev.new.expensify.com:8083/r/123'],
            ['an unrelated host', 'http://localhost/r/123'],
        ])('stays on %s', (_, href) => {
            // Given a page on a host other than the legacy one
            arrangeLocation(href);

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it stays, because only the legacy host moves pages
            expect(shouldHop).toBe(false);
        });

        it('stays while the router brake cookie is set', () => {
            // Given the router asked this browser to stay off the shared host
            arrangeCookies('experience=new; hybridWebClassicHost=www');

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it stays, so the router and the App don't send the browser back and forth
            expect(shouldHop).toBe(false);
        });

        it('stays while the browser is offline', () => {
            // Given a browser that reports it has no network
            arrangeBrowserOffline();

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it stays, because the shared host can't load while the cached app on this host can
            expect(shouldHop).toBe(false);
        });

        it('stays when this tab hopped within the guard duration', () => {
            // Given this tab left for the shared host shortly before
            sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP, String(Date.now() - CONST.LEGACY_HOST_HOP.TAB_GUARD_DURATION_MS + 1000));

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it stays, because the shared host sent the page back and hopping again would loop
            expect(shouldHop).toBe(false);
        });

        it('hops again once the guard duration has passed', () => {
            // Given this tab left for the shared host long ago
            sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP, String(Date.now() - CONST.LEGACY_HOST_HOP.TAB_GUARD_DURATION_MS - 1));

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it hops, because an old mark doesn't mean a loop
            expect(shouldHop).toBe(true);
        });

        it.each(['', 'abc', '-5', '1.5'])('stays when the tab mark is %p', (mark) => {
            // Given a tab mark that isn't a timestamp
            sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP, mark);

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it stays, treating the mark as recent to be safe from loops
            expect(shouldHop).toBe(false);
        });

        it('stays when sessionStorage throws', () => {
            // Given sessionStorage can't be read
            jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('blocked');
            });

            // When startup asks whether to hop
            const shouldHop = shouldHopToSharedHost();

            // Then it stays, because without the tab mark a loop can't be ruled out
            expect(shouldHop).toBe(false);
        });

        it('never hops on native', async () => {
            // Given the native implementation

            // When startup asks whether to hop and tries to hop
            const shouldHop = NativeLegacyHostHop.shouldHopToSharedHost();
            const hop = NativeLegacyHostHop.hopToSharedHost(SIGNED_IN_SESSION);

            // Then nothing moves, because native apps don't run on a web host
            expect(shouldHop).toBe(false);
            await expect(hop).resolves.toBe(false);
        });
    });

    describe('hopToSharedHost', () => {
        it.each(EXPERIENCE_VALUES)('moves a signed out page to the same path on the shared host with experience=%s', async (value) => {
            // Given a signed out page in a browser with either experience value
            arrangeCookies(`experience=${value}`);

            // When the page hops
            const hop = hopToSharedHost(undefined);

            // Then it moves as it is, because there is no session to carry over
            await expect(hop).resolves.toBe(true);
            expect(mockReplace).toHaveBeenCalledWith(`${SHARED_ORIGIN}/r/123?foo=bar#hash`);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP)).not.toBeNull();
        });

        it('moves an anonymous session without a token', async () => {
            // Given an anonymous session used to view a public room
            const session: Session = {authToken: 'anon', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS};

            // When the page hops
            const hop = hopToSharedHost(session);

            // Then it moves as it is, because an anonymous session has no account to carry over
            await expect(hop).resolves.toBe(true);
            expect(mockReplace).toHaveBeenCalledWith(`${SHARED_ORIGIN}/r/123?foo=bar#hash`);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
        });

        it('forwards a /transition link as it is', async () => {
            // Given a /transition link that already carries its own token
            arrangeLocation(`${LEGACY_ORIGIN}/transition?shortLivedAuthToken=abc&email=a%40b.com&exitTo=r%2F1`);

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then the link moves unchanged and no second token is fetched
            await expect(hop).resolves.toBe(true);
            expect(mockReplace).toHaveBeenCalledWith(`${SHARED_ORIGIN}/transition?shortLivedAuthToken=abc&email=a%40b.com&exitTo=r%2F1`);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
        });

        it.each(EXPERIENCE_VALUES)('waits for the write queue, then moves a signed in page through /transition with experience=%s', async (value) => {
            // Given a signed in page in a browser with either experience value
            arrangeCookies(`experience=${value}`);

            // When the page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then the token is fetched after the queue drains, and the page moves through /transition to the same path
            await expect(hop).resolves.toBe(true);
            expect(mockWaitForIdle.mock.invocationCallOrder.at(0)).toBeLessThan(mockGetShortLivedAuthToken.mock.invocationCallOrder.at(0) ?? 0);
            const url = getNavigatedURL();
            expect(url.origin + url.pathname).toBe(`${SHARED_ORIGIN}/transition`);
            expect(url.searchParams.get('shortLivedAuthToken')).toBe('short+lived/token');
            expect(url.searchParams.get('email')).toBe('user+beta@example.com');
            expect(url.searchParams.get('exitTo')).toBe('r/123?foo=bar');
        });

        it('leaves out exitTo for the root path', async () => {
            // Given a signed in page at the root path
            arrangeLocation(`${LEGACY_ORIGIN}/`);

            // When the page hops
            await hopToSharedHost(SIGNED_IN_SESSION);

            // Then the transition URL has no exitTo, so the shared host opens its default page
            expect(getNavigatedURL().searchParams.has('exitTo')).toBe(false);
        });

        it.each([
            ['no token', undefined],
            ['an empty token', ''],
        ])('stays when the token request returns %s and does not retry in this tab', async (_, token) => {
            // Given the token request returns no usable token
            mockGetShortLivedAuthToken.mockResolvedValue(token);

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then it stays, and the tab mark stops a retry on every reload
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
            expect(shouldHopToSharedHost()).toBe(false);
        });

        it('stays when queued requests remain after waiting', async () => {
            // Given a write that is still queued after the queue went idle
            mockInMemoryRequests = [{command: 'AddComment'}];

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then it stays without a token, because leaving would drop the write
            await expect(hop).resolves.toBe(false);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('stays when a request is queued while the token is fetched', async () => {
            // Given a write that enters the queue while the token request is in flight
            mockGetShortLivedAuthToken.mockImplementation(() => {
                mockInMemoryRequests = [{command: 'AddComment'}];
                return Promise.resolve('short+lived/token');
            });

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then it stays, because leaving would drop the write
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('checks the queue only after the stored requests have loaded', async () => {
            // Given the stored queue is still loading
            let finishLoading: () => void = () => {};
            mockWaitForPersistedRequests.mockReturnValue(
                new Promise((resolve) => {
                    finishLoading = resolve;
                }),
            );

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);
            await Promise.resolve();

            // Then it doesn't look at the queue yet
            expect(mockWaitForIdle).not.toHaveBeenCalled();

            // When the queue loads with a stored write
            mockInMemoryRequests = [{command: 'AddComment'}];
            finishLoading();

            // Then it stays, because the stored write hasn't been sent
            await expect(hop).resolves.toBe(false);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
        });

        it('stays offline without waiting for the queue', async () => {
            // Given the App knows it is offline
            mockIsOffline = true;

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then it stays, because the queue can't drain and no token can be fetched
            await expect(hop).resolves.toBe(false);
            expect(mockWaitForIdle).not.toHaveBeenCalled();
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it.each([
            ['a signed out page', undefined, `${LEGACY_ORIGIN}/r/123`],
            ['an anonymous session', {authToken: 'anon', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS}, `${LEGACY_ORIGIN}/r/123`],
            ['a /transition link', SIGNED_IN_SESSION, `${LEGACY_ORIGIN}/transition?shortLivedAuthToken=abc`],
            ['a signed in page', SIGNED_IN_SESSION, `${LEGACY_ORIGIN}/r/123`],
        ])('stays with %s while the browser is offline', async (_, session: Session | undefined, href) => {
            // Given a browser that reports it has no network before the App knows its own network state
            arrangeLocation(href);
            arrangeBrowserOffline();

            // When the page hops
            const hop = hopToSharedHost(session);

            // Then it stays on the cached app here without marking the tab, so the hop can happen once the browser is back online
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
            expect(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP)).toBeNull();
        });

        it('moves a signed in page when the auth token is renewed for the same account while the token is fetched', async () => {
            // Given the stored auth token has expired, so the token request reauthenticates the same account and is sent again
            mockGetShortLivedAuthToken.mockImplementation(async () => {
                await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'renewedAuthToken'});
                return 'short+lived/token';
            });

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then it still moves, because a renewed token belongs to the account that passed the checks
            await expect(hop).resolves.toBe(true);
            expect(getNavigatedURL().searchParams.get('shortLivedAuthToken')).toBe('short+lived/token');
        });

        it('sends the token request only after the session watch has seen the live session', async () => {
            // Given a session watch whose first value is held back
            let deliverSession: (session: OnyxEntry<Session>) => void = () => {};
            jest.spyOn(Onyx, 'connectWithoutView').mockImplementation((options) => {
                deliverSession = (session) => options.callback?.(session, ONYXKEYS.SESSION);
                return {unsubscribe: () => {}};
            });

            // When a signed in page hops and the queue has drained
            const hop = hopToSharedHost(SIGNED_IN_SESSION);
            await waitForBatchedUpdates();

            // Then the token is not requested yet, because the request could be sent with a session the watch never sees
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();

            // When the watch sees the live session
            deliverSession(SIGNED_IN_SESSION);

            // Then the token is requested and the page moves
            await expect(hop).resolves.toBe(true);
            expect(mockGetShortLivedAuthToken).toHaveBeenCalledTimes(1);
        });

        it('does not request a token when the live session is already a Copilot session', async () => {
            // Given the live session became a Copilot session before the hop started watching it
            await Onyx.set(ONYXKEYS.SESSION, {...SIGNED_IN_SESSION, authToken: 'delegateAuthToken', authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE});

            // When a page hops with the session it captured earlier
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then it stays without sending the request, since the server would answer with the Copilot session's long-lived token
            await expect(hop).resolves.toBe(false);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
        });

        it('stays when the checked session has no account ID', async () => {
            // Given a session without an account ID, which the watch can't tell apart from another account's
            const session: Session = {authToken: 'authToken', email: 'user+beta@example.com'};
            await Onyx.set(ONYXKEYS.SESSION, session);

            // When the page hops
            const hop = hopToSharedHost(session);

            // Then it stays, because the account behind the token can't be confirmed
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('stays when the session is a Copilot session only while the token request is sent', async () => {
            // Given another tab switches to a Copilot session while the request is sent, and the original session comes back before the response
            mockGetShortLivedAuthToken.mockImplementation(async () => {
                await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'delegateLongLivedToken', authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE});
                await Onyx.set(ONYXKEYS.SESSION, SIGNED_IN_SESSION);
                return 'delegateLongLivedToken';
            });

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then it stays, because the server answers a Copilot session with its long-lived token, which must never reach a URL
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it.each([
            ['another account signed in', {authToken: 'otherAuthToken', email: 'other@example.com', accountID: 2}],
            ['the session became a Copilot session', {...SIGNED_IN_SESSION, authToken: 'delegateAuthToken', authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE}],
            ['the session became a Supportal session', {...SIGNED_IN_SESSION, authToken: 'supportAuthToken', authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT}],
            ['the session signed out', {}],
            ['the session lost its auth token', {...SIGNED_IN_SESSION, authToken: undefined}],
        ])('stays when %s while the token was fetched', async (_, liveSession: Session) => {
            // Given the session changes in another tab while the token request is in flight
            mockGetShortLivedAuthToken.mockImplementation(async () => {
                await Onyx.set(ONYXKEYS.SESSION, liveSession);
                return 'short+lived/token';
            });

            // When a signed in page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then it stays, because the token may belong to a session that never passed the checks
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it.each([
            ['moves', () => {}, true],
            ['stays without a token', () => mockGetShortLivedAuthToken.mockResolvedValue(undefined), false],
            [
                'stays after the session changed',
                () =>
                    mockGetShortLivedAuthToken.mockImplementation(async () => {
                        await Onyx.set(ONYXKEYS.SESSION, {});
                        return 'short+lived/token';
                    }),
                false,
            ],
            ['stays after the timeout', () => mockWaitForIdle.mockReturnValue(new Promise(() => {})), false],
        ])('stops watching the session when the page %s', async (_, arrange, isLeaving) => {
            // Given a session watch whose unsubscribe is recorded
            const connectWithoutView = Onyx.connectWithoutView.bind(Onyx);
            const unsubscribe = jest.fn();
            jest.spyOn(Onyx, 'connectWithoutView').mockImplementation((options) => {
                const connection = connectWithoutView(options);
                return {
                    unsubscribe: () => {
                        unsubscribe();
                        connection.unsubscribe();
                    },
                };
            });
            jest.useFakeTimers();
            arrange();

            // When a signed in page hops, and the timeout passes if it is still waiting
            const hop = hopToSharedHost(SIGNED_IN_SESSION);
            await jest.advanceTimersByTimeAsync(CONST.LEGACY_HOST_HOP.TIMEOUT_MS);

            // Then the watch is stopped on the way out, so the subscription never outlives the hop
            await expect(hop).resolves.toBe(isLeaving);
            expect(unsubscribe).toHaveBeenCalledTimes(1);
        });

        it('stays when the queue does not drain before the timeout', async () => {
            // Given a queue that never goes idle
            jest.useFakeTimers();
            mockWaitForIdle.mockReturnValue(new Promise(() => {}));

            // When a signed in page hops and the timeout passes
            const hop = hopToSharedHost(SIGNED_IN_SESSION);
            jest.advanceTimersByTime(CONST.LEGACY_HOST_HOP.TIMEOUT_MS);

            // Then it stays, so a slow queue never holds startup
            await expect(hop).resolves.toBe(false);
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('ignores a token that arrives after the timeout', async () => {
            // Given a token request that answers only after the timeout
            jest.useFakeTimers();
            let resolveToken: (token: string) => void = () => {};
            mockGetShortLivedAuthToken.mockReturnValue(
                new Promise((resolve) => {
                    resolveToken = resolve;
                }),
            );

            // When a signed in page hops and the timeout passes
            const hop = hopToSharedHost(SIGNED_IN_SESSION);
            await jest.advanceTimersByTimeAsync(CONST.LEGACY_HOST_HOP.TIMEOUT_MS);
            await expect(hop).resolves.toBe(false);
            expect(mockGetShortLivedAuthToken).toHaveBeenCalledTimes(1);

            // When the token finally arrives
            resolveToken('late-token');
            await Promise.resolve();

            // Then the page doesn't move, because startup has already continued here
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it.each([
            ['Supportal', {...SIGNED_IN_SESSION, authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT}],
            ['Supportal with a used support token', {...SIGNED_IN_SESSION, isSupportAuthTokenUsed: true}],
            ['Copilot', {...SIGNED_IN_SESSION, authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE}],
        ])('stays in a %s session without marking the tab', async (_, session: Session) => {
            // Given a session whose token request fails or returns a long-lived token

            // When the page hops
            const hop = hopToSharedHost(session);

            // Then it stays without asking for a token, and leaves the tab free to hop in a later session
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
            expect(mockGetShortLivedAuthToken).not.toHaveBeenCalled();
            expect(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP)).toBeNull();
        });

        it.each([
            ['without the experience cookie', () => arrangeCookies('other=1')],
            ['while the brake cookie is set', () => arrangeCookies('experience=new; hybridWebClassicHost=www')],
            ['on the shared host', () => arrangeLocation(`${SHARED_ORIGIN}/r/123`)],
        ])('does nothing %s', async (_, arrange) => {
            // Given a page that shouldn't hop
            arrange();

            // When the page hops
            const hop = hopToSharedHost(SIGNED_IN_SESSION);

            // Then nothing happens and the tab stays unmarked
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
            expect(mockWaitForIdle).not.toHaveBeenCalled();
            expect(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP)).toBeNull();
        });

        it('hops only once per tab', async () => {
            // Given a page that has already hopped
            await hopToSharedHost(undefined);

            // When it tries to hop again
            const secondHop = hopToSharedHost(undefined);

            // Then the second attempt stays, so a page sent back by the shared host doesn't loop
            await expect(secondHop).resolves.toBe(false);
            expect(mockReplace).toHaveBeenCalledTimes(1);
        });

        it('stays when the tab mark cannot be stored', async () => {
            // Given sessionStorage can't be written
            jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('quota');
            });

            // When the page hops
            const hop = hopToSharedHost(undefined);

            // Then it stays, because without the mark a page sent back could loop
            await expect(hop).resolves.toBe(false);
            expect(mockReplace).not.toHaveBeenCalled();
        });
    });
});
