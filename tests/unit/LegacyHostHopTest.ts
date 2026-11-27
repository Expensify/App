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
