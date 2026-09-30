/**
 * Single-flight refresh with rotated-token persistence, the terminal/transient failure split, and both
 * halves of the redirect flow. Modules are re-required per test because the module-level caches are
 * exactly what's under test.
 */
import type * as ConfigModule from '@libs/CloudflareAccess/Config';
import type * as PKCEModule from '@libs/CloudflareAccess/generatePKCE';
import type WebCryptoProvider from '@libs/CloudflareAccess/getWebCrypto/types';
import type * as OAuthClientModule from '@libs/CloudflareAccess/OAuthClient';
import type * as PendingAuthFlowStorageModule from '@libs/CloudflareAccess/PendingAuthFlowStorage';
import type * as SessionCleanupModule from '@libs/SessionCleanup';

import type * as SessionActionsModule from '@userActions/CloudflareSession';

import type * as OnyxKeysModule from '@src/ONYXKEYS';
import type CloudflareSession from '@src/types/onyx/CloudflareSession';

// Default type import only: a namespace import would pull in the restricted `useOnyx` name
import type OnyxDefault from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type PKCEPair = PKCEModule.PKCEPair;

const AUTHORIZE_URL = 'https://team.cloudflareaccess.com/cdn-cgi/access/oauth/authorization?mock=1';

// OAuthClient imports CONFIG, whose native dependency is unavailable in the Jest environment.
jest.mock('@src/CONFIG', () => ({__esModule: true, default: {QA_AUTH: {CLIENT_ID: 'client-123'}}}));

// CloudflareSession imports Log, whose native dependency is unavailable in the Jest environment. The session
// behavior under test is platform-independent, so keep that native dependency out of this test.
jest.mock('@libs/Log', () => ({__esModule: true, default: {warn: jest.fn()}}));

// The module gates its subscription and cleanup on a complete config. Everything under test is behind it
jest.mock('@libs/CloudflareAccess/Config', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ConfigModule>('@libs/CloudflareAccess/Config'),
    isQAAuthConfigured: jest.fn(() => true),
}));

jest.mock('@libs/CloudflareAccess/OAuthClient', () => ({
    __esModule: true,
    // Keep the real OAuthError class. The terminal/transient split hangs on instanceof
    ...jest.requireActual<typeof OAuthClientModule>('@libs/CloudflareAccess/OAuthClient'),
    buildAuthorizeURL: jest.fn(() => Promise.resolve(AUTHORIZE_URL)),
    exchangeCode: jest.fn(),
    refreshTokens: jest.fn(),
}));

jest.mock('@libs/CloudflareAccess/generatePKCE', () => ({
    __esModule: true,
    generatePKCEPair: jest.fn(),
    generateState: jest.fn(() => 'test-state'),
}));

const SESSION_A: CloudflareSession = {accessToken: 'oauth:access-a', refreshToken: 'oauth:refresh-a', expiresAt: 1900000000000};
const SESSION_B: CloudflareSession = {accessToken: 'oauth:access-b', refreshToken: 'oauth:refresh-b', expiresAt: 1900000900000};

const PAIR_1: PKCEPair = {codeVerifier: 'verifier-1', codeChallenge: 'challenge-1'};

let Onyx: typeof OnyxDefault;
let ONYXKEYS: typeof OnyxKeysModule.default;
let SessionActions: typeof SessionActionsModule;
let oAuthClient: typeof OAuthClientModule;
let pkce: typeof PKCEModule;
let pendingAuthFlowStorage: typeof PendingAuthFlowStorageModule;
let sessionCleanup: typeof SessionCleanupModule;
let assignSpy: jest.Mock;
let realLocation: Location;

beforeEach(() => {
    jest.resetModules();
    // The redirect flow record lives in jsdom's real sessionStorage. Drop leftovers from earlier tests
    window.sessionStorage.clear();
    // jsdom throws "Not implemented: navigation" on a real location.assign
    realLocation = window.location;
    assignSpy = jest.fn<void, [string]>();
    Object.defineProperty(window, 'location', {
        value: {origin: 'http://localhost', href: 'http://localhost/settings/troubleshoot', pathname: '/settings/troubleshoot', assign: assignSpy},
        writable: true,
        configurable: true,
    });
    Onyx = require<{default: typeof OnyxDefault}>('react-native-onyx').default;
    ONYXKEYS = require<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
    Onyx.init({keys: ONYXKEYS});
    oAuthClient = require<typeof OAuthClientModule>('@libs/CloudflareAccess/OAuthClient');
    pkce = require<typeof PKCEModule>('@libs/CloudflareAccess/generatePKCE');
    pendingAuthFlowStorage = require<typeof PendingAuthFlowStorageModule>('@libs/CloudflareAccess/PendingAuthFlowStorage');
    SessionActions = require<typeof SessionActionsModule>('@userActions/CloudflareSession');
    // Required after the actions module, which registers its cleanup callback on import
    sessionCleanup = require<typeof SessionCleanupModule>('@libs/SessionCleanup');
});

afterEach(() => {
    Object.defineProperty(window, 'location', {value: realLocation, writable: true, configurable: true});
    // jsdom ships no Web Locks, so the lock test installs one. Every other test must see it absent again
    Object.defineProperty(navigator, 'locks', {value: undefined, writable: true, configurable: true});
});

async function seedSession(session: CloudflareSession | null) {
    await Onyx.set(ONYXKEYS.CLOUDFLARE_SESSION, session);
    await waitForBatchedUpdates();
}

describe('refreshCloudflareSession', () => {
    it('is single-flight: concurrent callers share one refreshTokens call', async () => {
        // Given a stored session and a refresh request that has not resolved yet
        await seedSession(SESSION_A);
        const refreshDeferred = Promise.withResolvers<CloudflareSession>();
        jest.mocked(oAuthClient.refreshTokens).mockReturnValue(refreshDeferred.promise);

        // When a second caller asks for a refresh while the first is still in flight
        const first = SessionActions.refreshCloudflareSession();
        const second = SessionActions.refreshCloudflareSession();
        // Then it must join the same promise: refresh tokens are single-use (Cloudflare rotates them),
        // so two parallel refreshes would spend the same token and one of them would be rejected
        expect(second).toBe(first);

        // Then both callers observe the single rotation and the rotated pair becomes the cached session
        refreshDeferred.resolve(SESSION_B);
        await expect(first).resolves.toBe('refreshed');
        await expect(second).resolves.toBe('refreshed');
        expect(oAuthClient.refreshTokens).toHaveBeenCalledTimes(1);
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_B);
    });

    it('joins the in-flight refresh before the staleness shortcut, so late callers cannot race ahead of persistence', async () => {
        // Given a refresh whose rotation already resolved but whose Onyx persist is still pending
        await seedSession(SESSION_A);
        jest.mocked(oAuthClient.refreshTokens).mockResolvedValue(SESSION_B);
        const persistDeferred = Promise.withResolvers<void>();
        const setSpy = jest.spyOn(Onyx, 'set').mockReturnValue(persistDeferred.promise);

        const inFlight = SessionActions.refreshCloudflareSession();
        // The rotation resolved and the cache updated, but Onyx.set is still pending
        await waitForBatchedUpdates();

        // When a late caller arrives now. The cache already holds SESSION_B, so the staleness shortcut WOULD match
        // Then the join must win anyway: resolving via the shortcut would let the caller proceed before the
        // rotated single-use pair is safely persisted, and a reload at that moment would lose it
        const lateCaller = SessionActions.refreshCloudflareSession(SESSION_A.accessToken);
        expect(lateCaller).toBe(inFlight);

        let isSettled = false;
        inFlight.then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();
        // Not before the rotated pair is persisted
        expect(isSettled).toBe(false);

        persistDeferred.resolve();
        await expect(inFlight).resolves.toBe('refreshed');
        expect(oAuthClient.refreshTokens).toHaveBeenCalledTimes(1);
        setSpy.mockRestore();
    });

    it('skips with no network call when the token was already rotated and no refresh is in flight', async () => {
        // Given a store already holding a newer pair. Another context rotated while this caller held the old token
        await seedSession(SESSION_B);
        // When the caller submits the outdated token, Then it resolves skipped-newer-token with no network
        // call: the caller should retry with the newer token rather than needlessly spend a refresh token
        await expect(SessionActions.refreshCloudflareSession(SESSION_A.accessToken)).resolves.toBe('skipped-newer-token');
        expect(oAuthClient.refreshTokens).not.toHaveBeenCalled();
    });

    it.each(['invalid_grant', 'invalid_response'])('keeps the session and resolves reauth-required on the terminal %s', async (code) => {
        // Given a stored session whose refresh the server rejects with a terminal OAuth error (each
        // parametrized code means this refresh token can never succeed again)
        await seedSession(SESSION_A);
        jest.mocked(oAuthClient.refreshTokens).mockRejectedValue(new oAuthClient.OAuthError(code));

        // When the refresh runs, Then it resolves reauth-required rather than rejecting: only a fresh
        // authorize round trip can recover, so callers must be told to re-auth, not tempted to retry
        await expect(SessionActions.refreshCloudflareSession()).resolves.toBe('reauth-required');
        // Then the session is deliberately not cleared: the store is shared across tabs and recovery is by
        // replacement. A deletion here could destroy a working rotation another tab persisted moments earlier
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_A);
    });

    it('rethrows transient failures and keeps the session', async () => {
        // Given a stored session and a refresh that fails at the network level
        await seedSession(SESSION_A);
        const transientError = new TypeError('Failed to fetch');
        jest.mocked(oAuthClient.refreshTokens).mockRejectedValue(transientError);

        // When the refresh runs, Then the error propagates so callers can retry, and the session stays
        // alive: a network blip says nothing about the token, so it must not force a re-auth
        await expect(SessionActions.refreshCloudflareSession()).rejects.toBe(transientError);
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_A);
    });

    it('resolves reauth-required without a network call when there is no session', async () => {
        // Given an empty store: there is no refresh token to spend
        await seedSession(null);
        // When a refresh is requested, Then it resolves reauth-required without touching the network,
        // because the authorize round trip is the only path that can produce a session from nothing
        await expect(SessionActions.refreshCloudflareSession()).resolves.toBe('reauth-required');
        expect(oAuthClient.refreshTokens).not.toHaveBeenCalled();
    });

    it('leaves the session another tab already rotated alone when the token this one submitted is rejected', async () => {
        // Given a stored session and this tab's refresh still in flight
        await seedSession(SESSION_A);
        const refreshDeferred = Promise.withResolvers<CloudflareSession>();
        jest.mocked(oAuthClient.refreshTokens).mockReturnValue(refreshDeferred.promise);

        const refresh = SessionActions.refreshCloudflareSession();
        // When the other tab wins the rotation race (its new pair reaches this tab through Onyx) and the
        // server then rejects the token this tab submitted as already spent
        await seedSession(SESSION_B);
        refreshDeferred.reject(new oAuthClient.OAuthError('invalid_grant'));

        // Then the rejection is terminal only for the spent token: clearing here would destroy the pair the
        // other tab just persisted, so the caller is told to retry with the newer token instead
        await expect(refresh).resolves.toBe('skipped-newer-token');
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_B);
    });

    it('re-reads the session after acquiring the cross-tab lock, so the tab that waited cannot spend a rotated token', async () => {
        // Given a Web Lock held by another tab, so this tab's refresh queues behind it (the cross-tab lock
        // exists because refresh tokens are single-use and only one context may spend one at a time)
        await seedSession(SESSION_A);
        const lockDeferred = Promise.withResolvers<void>();
        Object.defineProperty(navigator, 'locks', {
            value: {request: (_name: string, callback: () => Promise<unknown>) => lockDeferred.promise.then(callback)},
            writable: true,
            configurable: true,
        });

        const refresh = SessionActions.refreshCloudflareSession(SESSION_A.accessToken);
        // When, while this call is queued behind the other tab's lock, that tab rotates and persists
        await seedSession(SESSION_B);
        lockDeferred.resolve();

        await expect(refresh).resolves.toBe('skipped-newer-token');
        // Then no request was ever sent: the staleness check that matched at call time must be repeated once
        // the lock is held, or the tab that waited would spend a token that was rotated while it queued
        expect(oAuthClient.refreshTokens).not.toHaveBeenCalled();
    });

    it('does not persist a rotation that resolves after sign-out', async () => {
        // Given a stored session and a refresh that will still be in flight when sign-out runs. In-flight
        // async work cannot be cancelled, only have its result discarded
        await seedSession(SESSION_A);
        const refreshDeferred = Promise.withResolvers<CloudflareSession>();
        jest.mocked(oAuthClient.refreshTokens).mockReturnValue(refreshDeferred.promise);

        // When sign-out bumps the session generation before the rotation resolves
        const refresh = SessionActions.refreshCloudflareSession();
        sessionCleanup.runSessionCleanupCallbacks();
        refreshDeferred.resolve(SESSION_B);

        // Then the late result must be dropped so the signed-out account's session is never resurrected
        await expect(refresh).resolves.toBe('reauth-required');
        // Then the cache is written before Onyx, so a null cache is proof the rotated pair never reached the store
        expect(SessionActions.getCloudflareSession()).toBeNull();
    });
});

describe('redirectToCloudflareSignIn', () => {
    it('stores the flow record before navigating — module memory does not survive the unload', async () => {
        // Given key material ready and a navigation spy that captures what sessionStorage held at the exact
        // moment the browser was asked to leave the page
        jest.mocked(pkce.generatePKCEPair).mockResolvedValue(PAIR_1);
        const savedBeforeAssign: Array<string | null> = [];
        assignSpy.mockImplementation(() => {
            savedBeforeAssign.push(window.sessionStorage.getItem('QA_AUTH_REDIRECT_FLOW'));
        });

        // When the redirect begins
        SessionActions.redirectToCloudflareSignIn('http://localhost/settings/troubleshoot');
        await waitForBatchedUpdates();

        expect(assignSpy).toHaveBeenCalledWith(AUTHORIZE_URL);
        // Then the record must already be readable at the moment the navigation is requested: module memory
        // does not survive the unload, and without the stored verifier the returning code could never be exchanged
        expect(savedBeforeAssign.at(0)).not.toBeNull();
        expect(pendingAuthFlowStorage.consumePendingAuthFlow()).toMatchObject({
            state: 'test-state',
            codeVerifier: PAIR_1.codeVerifier,
            returnURL: 'http://localhost/settings/troubleshoot',
        });
        expect(jest.mocked(oAuthClient.buildAuthorizeURL)).toHaveBeenCalledWith({state: 'test-state', codeChallenge: PAIR_1.codeChallenge});
    });

    it('never settles once the navigation is requested, so callers run nothing after it', async () => {
        // Given a redirect that reaches the point of navigation
        jest.mocked(pkce.generatePKCEPair).mockResolvedValue(PAIR_1);

        // When the returned promise is observed after the navigation has been requested
        let isSettled = false;
        SessionActions.redirectToCloudflareSignIn().then(
            () => {
                isSettled = true;
            },
            () => {
                isSettled = true;
            },
        );
        await waitForBatchedUpdates();

        // Then it never settles: the document is about to unload, so any continuation would run in a dying
        // page and could act on a navigation that is already under way
        expect(assignSpy).toHaveBeenCalledTimes(1);
        expect(isSettled).toBe(false);
    });

    it('refuses to navigate when the flow record cannot be stored', async () => {
        jest.mocked(pkce.generatePKCEPair).mockResolvedValue(PAIR_1);
        // Given valid key material (mocked above) but a sessionStorage whose writes fail
        // (jsdom's Storage methods are not spy-able, so the whole object is swapped out)
        const realSessionStorage = window.sessionStorage;
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: () => null,
                removeItem: () => {},
                setItem: () => {
                    throw new Error('QuotaExceededError');
                },
            },
            writable: true,
            configurable: true,
        });

        // When the redirect begins, Then it must reject and stay on the page: navigating away without a
        // stored verifier would strand the flow with no way to exchange the code that comes back
        await expect(SessionActions.redirectToCloudflareSignIn()).rejects.toThrow('QuotaExceededError');
        expect(assignSpy).not.toHaveBeenCalled();

        Object.defineProperty(window, 'sessionStorage', {value: realSessionStorage, writable: true, configurable: true});
    });

    it('refuses to navigate when sign-out invalidated the flow while the key material was generated', async () => {
        // Given key-material generation still pending when the redirect starts
        const pkceDeferred = Promise.withResolvers<PKCEPair>();
        jest.mocked(pkce.generatePKCEPair).mockReturnValue(pkceDeferred.promise);

        // When sign-out invalidates the flow before the key material arrives
        const redirect = SessionActions.redirectToCloudflareSignIn('http://localhost/settings/troubleshoot');
        sessionCleanup.runSessionCleanupCallbacks();
        pkceDeferred.resolve(PAIR_1);

        // Then it must reject without navigating or storing anything: sign-out cannot cancel the in-flight
        // work, so its late result is discarded rather than sending a signed-out tab into the authorize flow
        await expect(redirect).rejects.toThrow();
        expect(assignSpy).not.toHaveBeenCalled();
        expect(window.sessionStorage.getItem('QA_AUTH_REDIRECT_FLOW')).toBeNull();
    });

    it('a second press while the first navigation settles does not overwrite the stored flow', async () => {
        // Given a first press whose navigation has been requested but has not torn the page down yet
        jest.mocked(pkce.generatePKCEPair).mockResolvedValue(PAIR_1);

        // When the button is pressed again before the unload completes
        SessionActions.redirectToCloudflareSignIn();
        SessionActions.redirectToCloudflareSignIn();
        await waitForBatchedUpdates();

        // Then the in-flight guard runs the flow only once: a second run would regenerate PKCE and overwrite
        // the stored flow record, orphaning the verifier that the navigation already under way is going to need
        expect(assignSpy).toHaveBeenCalledTimes(1);
        expect(pkce.generatePKCEPair).toHaveBeenCalledTimes(1);
    });
});

describe('exchangeCodeForCloudflareSession', () => {
    it('caches the session before persistence but resolves only after Onyx.set completed', async () => {
        // Given an exchange that succeeds while the Onyx persist is held open
        jest.mocked(oAuthClient.exchangeCode).mockResolvedValue(SESSION_A);
        const persistDeferred = Promise.withResolvers<void>();
        const setSpy = jest.spyOn(Onyx, 'set').mockReturnValue(persistDeferred.promise);

        // When the redirect completion runs
        const completion = SessionActions.exchangeCodeForCloudflareSession({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});
        let isSettled = false;
        completion.then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();

        // Then the session is cached before the disk write settles. Requests fired during this boot need the
        // token before disk I/O finishes. While the promise still waits for the write to actually complete
        expect(oAuthClient.exchangeCode).toHaveBeenCalledWith({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});
        // Cache first, because requests during this boot must see the token right away
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_A);
        // But the completion waits for the disk write
        expect(isSettled).toBe(false);

        persistDeferred.resolve();
        await completion;
        expect(setSpy).toHaveBeenCalledWith(ONYXKEYS.CLOUDFLARE_SESSION, SESSION_A);
        setSpy.mockRestore();
    });

    it('is single-flight: a joiner shares the exchange instead of burning the single-use code twice', async () => {
        // Given an exchange that has not resolved yet
        const exchangeDeferred = Promise.withResolvers<CloudflareSession>();
        jest.mocked(oAuthClient.exchangeCode).mockReturnValue(exchangeDeferred.promise);

        // When a second caller completes with the same code while the first is still in flight
        const first = SessionActions.exchangeCodeForCloudflareSession({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});
        expect(SessionActions.getPendingCloudflareCodeExchange()).toBe(first);
        // Then it must join the first: the authorization code is single-use, so a second exchange would burn
        // it at the server and fail both callers
        expect(SessionActions.exchangeCodeForCloudflareSession({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier})).toBe(first);
        expect(oAuthClient.exchangeCode).toHaveBeenCalledTimes(1);

        // Then the pending handle is released once settled, so a future flow can start a fresh exchange
        exchangeDeferred.resolve(SESSION_A);
        await first;
        expect(SessionActions.getPendingCloudflareCodeExchange()).toBeNull();
    });

    it('discards an exchange that resolves after sign-out, so the signed-out account is not resurrected', async () => {
        // Given an exchange that will still be in flight when sign-out runs
        const exchangeDeferred = Promise.withResolvers<CloudflareSession>();
        jest.mocked(oAuthClient.exchangeCode).mockReturnValue(exchangeDeferred.promise);

        // When sign-out bumps the session generation before the exchange resolves
        const completion = SessionActions.exchangeCodeForCloudflareSession({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});
        sessionCleanup.runSessionCleanupCallbacks();
        exchangeDeferred.resolve(SESSION_A);

        await completion;
        // Then the late result is dropped, since in-flight work cannot be cancelled, only discarded. Because
        // the cache is written before Onyx, a null cache is proof the exchanged pair never reached the store
        expect(SessionActions.getCloudflareSession()).toBeNull();
    });

    it('resolves and keeps the usable session in cache when the exchange succeeded but Onyx.set rejected', async () => {
        // Given an exchange that succeeds while the Onyx persist rejects
        jest.mocked(oAuthClient.exchangeCode).mockResolvedValue(SESSION_A);
        const setSpy = jest.spyOn(Onyx, 'set').mockRejectedValue(new Error('QuotaExceededError'));

        // When the completion runs, Then it still resolves
        await expect(SessionActions.exchangeCodeForCloudflareSession({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier})).resolves.toBeUndefined();
        // Then a failed persist is not a failed sign-in. The cache keeps the usable session and a reload self-heals
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_A);
        setSpy.mockRestore();
    });

    it('discards an exchange that resolves after Clear session, so clearing cannot be undone', async () => {
        // Given a code exchange that is still in flight when the user presses Clear session
        const exchangeDeferred = Promise.withResolvers<CloudflareSession>();
        jest.mocked(oAuthClient.exchangeCode).mockReturnValue(exchangeDeferred.promise);
        const completion = SessionActions.exchangeCodeForCloudflareSession({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});

        // When the session is cleared before the exchange settles
        await SessionActions.clearCloudflareSession();
        exchangeDeferred.resolve(SESSION_A);
        await completion;

        // Then the late result must stay discarded, because persisting it would silently undo the clear
        expect(SessionActions.getCloudflareSession()).toBeNull();
    });

    it('exposes no pending completion before an exchange starts', () => {
        // Given a fresh module, When no exchange has started, Then the pending handle is null so boot code
        // never awaits work that will never run
        expect(SessionActions.getPendingCloudflareCodeExchange()).toBeNull();
    });

    it('propagates an exchange failure and leaves the session empty', async () => {
        // Given an empty store (Onyx storage outlives jest.resetModules, so an earlier test's persisted
        // session would hydrate here) and an exchange the server rejects
        await seedSession(null);
        jest.mocked(oAuthClient.exchangeCode).mockRejectedValue(new oAuthClient.OAuthError('invalid_grant'));

        // When the completion runs, Then the failure must reach the caller. Only a fresh authorize round
        // trip can recover, and nothing is cached or left pending, because a failed exchange produced no session
        await expect(SessionActions.exchangeCodeForCloudflareSession({code: 'bad-code', codeVerifier: PAIR_1.codeVerifier})).rejects.toMatchObject({code: 'invalid_grant'});
        expect(SessionActions.getCloudflareSession()).toBeNull();
        expect(SessionActions.getPendingCloudflareCodeExchange()).toBeNull();
    });
});

describe('builds without QA auth configured', () => {
    it('subscribes to nothing and still resolves hydration, so no caller can hang', async () => {
        // Given a build where QA auth is not configured
        jest.resetModules();
        const config = require<typeof ConfigModule>('@libs/CloudflareAccess/Config');
        jest.mocked(config.isQAAuthConfigured).mockReturnValue(false);
        const onyx = require<{default: typeof OnyxDefault}>('react-native-onyx').default;
        const connectSpy = jest.spyOn(onyx, 'connectWithoutView');

        // When the actions module is imported
        const sessionActions = require<typeof SessionActionsModule>('@userActions/CloudflareSession');

        // Then nothing subscribed to the QA session key, so apps without QA auth configured pay no cost for the feature and
        // importing the module pulls in unrelated modules that legitimately subscribe to their own keys,
        // so the claim is specifically that nothing connected to the QA session key
        const connectedKeys = connectSpy.mock.calls.map(([connection]) => connection.key);
        expect(connectedKeys).not.toContain(ONYXKEYS.CLOUDFLARE_SESSION);
        expect(sessionActions.getCloudflareSession()).toBeNull();
        // Then hydration still resolves even though no subscription will ever fire, so no caller can hang on it
        await expect(sessionActions.waitForCloudflareSessionHydration()).resolves.toBeUndefined();
        connectSpy.mockRestore();
    });
});

describe('native platform safety', () => {
    it('the real getWebCrypto resolves to the native stub here: import-safe and inert', () => {
        // Given the real (unmocked) getWebCrypto. Jest-expo's haste config resolves index.native.ts, the same file native builds get.
        // When the stub is exercised, Then it must be import-safe and inert: it is unreachable behind the
        // native isQAAuthConfigured() gate, so it only needs to be a typed no-op that never crashes a native bundle.
        const actualProvider = jest.requireActual<{default: WebCryptoProvider}>('@libs/CloudflareAccess/getWebCrypto').default;
        const array = new Uint8Array(1);
        expect(actualProvider.getRandomValues(array)).toBe(array);
    });
});
