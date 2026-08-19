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

// The module gates its subscription and cleanup on a complete config; everything under test is behind it
jest.mock('@libs/CloudflareAccess/Config', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ConfigModule>('@libs/CloudflareAccess/Config'),
    isQAAuthConfigured: jest.fn(() => true),
}));

jest.mock('@libs/CloudflareAccess/OAuthClient', () => ({
    __esModule: true,
    // Keep the real OAuthError class — the terminal/transient split hangs on instanceof
    ...jest.requireActual<typeof OAuthClientModule>('@libs/CloudflareAccess/OAuthClient'),
    buildAuthorizeURL: jest.fn(() => AUTHORIZE_URL),
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

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {promise, resolve, reject};
}

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
    // The redirect flow record lives in jsdom's real sessionStorage — drop leftovers from earlier tests
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
    // jsdom ships no Web Locks, so the lock test installs one — every other test must see it absent again
    Object.defineProperty(navigator, 'locks', {value: undefined, writable: true, configurable: true});
});

async function seedSession(session: CloudflareSession | null) {
    await Onyx.set(ONYXKEYS.CF_SESSION, session);
    await waitForBatchedUpdates();
}

describe('refreshCloudflareSession', () => {
    it('is single-flight: concurrent callers share one refreshTokens call', async () => {
        await seedSession(SESSION_A);
        const refreshDeferred = createDeferred<CloudflareSession>();
        jest.mocked(oAuthClient.refreshTokens).mockReturnValue(refreshDeferred.promise);

        const first = SessionActions.refreshCloudflareSession();
        const second = SessionActions.refreshCloudflareSession();
        expect(second).toBe(first);

        refreshDeferred.resolve(SESSION_B);
        await expect(first).resolves.toBe('refreshed');
        await expect(second).resolves.toBe('refreshed');
        expect(oAuthClient.refreshTokens).toHaveBeenCalledTimes(1);
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_B);
    });

    it('joins the in-flight refresh before the staleness shortcut, so late callers cannot race ahead of persistence', async () => {
        await seedSession(SESSION_A);
        jest.mocked(oAuthClient.refreshTokens).mockResolvedValue(SESSION_B);
        const persistDeferred = createDeferred<void>();
        const setSpy = jest.spyOn(Onyx, 'set').mockReturnValue(persistDeferred.promise);

        const inFlight = SessionActions.refreshCloudflareSession();
        await waitForBatchedUpdates(); // rotation resolved, cache updated, Onyx.set still pending

        // The cache already holds SESSION_B, so the staleness shortcut WOULD match — but the join must win
        const lateCaller = SessionActions.refreshCloudflareSession(SESSION_A.accessToken);
        expect(lateCaller).toBe(inFlight);

        let isSettled = false;
        inFlight.then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();
        expect(isSettled).toBe(false); // not before the rotated pair is persisted

        persistDeferred.resolve();
        await expect(inFlight).resolves.toBe('refreshed');
        expect(oAuthClient.refreshTokens).toHaveBeenCalledTimes(1);
        setSpy.mockRestore();
    });

    it('skips with no network call when the token was already rotated and no refresh is in flight', async () => {
        await seedSession(SESSION_B);
        await expect(SessionActions.refreshCloudflareSession(SESSION_A.accessToken)).resolves.toBe('skipped-newer-token');
        expect(oAuthClient.refreshTokens).not.toHaveBeenCalled();
    });

    it.each(['invalid_grant', 'invalid_response'])('keeps the session and resolves reauth-required on the terminal %s', async (code) => {
        await seedSession(SESSION_A);
        jest.mocked(oAuthClient.refreshTokens).mockRejectedValue(new oAuthClient.OAuthError(code));

        await expect(SessionActions.refreshCloudflareSession()).resolves.toBe('reauth-required');
        // Deliberately not cleared: the store is shared across tabs and recovery is by replacement — a
        // deletion here could destroy a working rotation another tab persisted moments earlier
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_A);
    });

    it('rethrows transient failures and keeps the session', async () => {
        await seedSession(SESSION_A);
        const transientError = new TypeError('Failed to fetch');
        jest.mocked(oAuthClient.refreshTokens).mockRejectedValue(transientError);

        await expect(SessionActions.refreshCloudflareSession()).rejects.toBe(transientError);
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_A);
    });

    it('resolves reauth-required without a network call when there is no session', async () => {
        await seedSession(null);
        await expect(SessionActions.refreshCloudflareSession()).resolves.toBe('reauth-required');
        expect(oAuthClient.refreshTokens).not.toHaveBeenCalled();
    });

    it('leaves the session another tab already rotated alone when the token this one submitted is rejected', async () => {
        await seedSession(SESSION_A);
        const refreshDeferred = createDeferred<CloudflareSession>();
        jest.mocked(oAuthClient.refreshTokens).mockReturnValue(refreshDeferred.promise);

        const refresh = SessionActions.refreshCloudflareSession();
        // The other tab won the rotation race and its new pair reached this tab through Onyx
        await seedSession(SESSION_B);
        refreshDeferred.reject(new oAuthClient.OAuthError('invalid_grant'));

        // Terminal for the spent token, but clearing here would destroy the pair the other tab just persisted
        await expect(refresh).resolves.toBe('skipped-newer-token');
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_B);
    });

    it('re-reads the session after acquiring the cross-tab lock, so the tab that waited cannot spend a rotated token', async () => {
        await seedSession(SESSION_A);
        const lockDeferred = createDeferred<void>();
        Object.defineProperty(navigator, 'locks', {
            value: {request: (_name: string, callback: () => Promise<unknown>) => lockDeferred.promise.then(callback)},
            writable: true,
            configurable: true,
        });

        const refresh = SessionActions.refreshCloudflareSession(SESSION_A.accessToken);
        // While this call is queued behind the other tab's lock, that tab rotates and persists
        await seedSession(SESSION_B);
        lockDeferred.resolve();

        await expect(refresh).resolves.toBe('skipped-newer-token');
        // Never sent: the staleness check that matched at call time is repeated once the lock is held
        expect(oAuthClient.refreshTokens).not.toHaveBeenCalled();
    });

    it('does not persist a rotation that resolves after sign-out', async () => {
        await seedSession(SESSION_A);
        const refreshDeferred = createDeferred<CloudflareSession>();
        jest.mocked(oAuthClient.refreshTokens).mockReturnValue(refreshDeferred.promise);

        const refresh = SessionActions.refreshCloudflareSession();
        sessionCleanup.runSessionCleanupCallbacks();
        refreshDeferred.resolve(SESSION_B);

        await expect(refresh).resolves.toBe('reauth-required');
        // The cache is written before Onyx, so a null cache is proof the rotated pair never reached the store
        expect(SessionActions.getCloudflareSession()).toBeNull();
    });
});

describe('beginCloudflareAuthRedirect', () => {
    it('stores the flow record before navigating — module memory does not survive the unload', async () => {
        jest.mocked(pkce.generatePKCEPair).mockResolvedValue(PAIR_1);
        const savedBeforeAssign: Array<string | null> = [];
        assignSpy.mockImplementation(() => {
            savedBeforeAssign.push(window.sessionStorage.getItem('QA_AUTH_REDIRECT_FLOW'));
        });

        SessionActions.beginCloudflareAuthRedirect('http://localhost/settings/troubleshoot');
        await waitForBatchedUpdates();

        expect(assignSpy).toHaveBeenCalledWith(AUTHORIZE_URL);
        // The record must already be readable at the moment the navigation is requested
        expect(savedBeforeAssign.at(0)).not.toBeNull();
        expect(pendingAuthFlowStorage.consumePendingAuthFlow()).toMatchObject({
            state: 'test-state',
            codeVerifier: PAIR_1.codeVerifier,
            returnURL: 'http://localhost/settings/troubleshoot',
        });
        expect(jest.mocked(oAuthClient.buildAuthorizeURL)).toHaveBeenCalledWith({state: 'test-state', codeChallenge: PAIR_1.codeChallenge});
    });

    it('never settles once the navigation is requested, so callers run nothing after it', async () => {
        jest.mocked(pkce.generatePKCEPair).mockResolvedValue(PAIR_1);

        let isSettled = false;
        SessionActions.beginCloudflareAuthRedirect().then(
            () => {
                isSettled = true;
            },
            () => {
                isSettled = true;
            },
        );
        await waitForBatchedUpdates();

        expect(assignSpy).toHaveBeenCalledTimes(1);
        expect(isSettled).toBe(false);
    });

    it('refuses to navigate when the flow record cannot be stored', async () => {
        jest.mocked(pkce.generatePKCEPair).mockResolvedValue(PAIR_1);
        // jsdom's Storage methods are not spy-able, so the whole object is swapped out
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

        // Navigating away without a stored verifier would strand the flow with no way to exchange
        await expect(SessionActions.beginCloudflareAuthRedirect()).rejects.toThrow('QuotaExceededError');
        expect(assignSpy).not.toHaveBeenCalled();

        Object.defineProperty(window, 'sessionStorage', {value: realSessionStorage, writable: true, configurable: true});
    });

    it('refuses to navigate when sign-out invalidated the flow while the key material was generated', async () => {
        const pkceDeferred = createDeferred<PKCEPair>();
        jest.mocked(pkce.generatePKCEPair).mockReturnValue(pkceDeferred.promise);

        const redirect = SessionActions.beginCloudflareAuthRedirect('http://localhost/settings/troubleshoot');
        sessionCleanup.runSessionCleanupCallbacks();
        pkceDeferred.resolve(PAIR_1);

        await expect(redirect).rejects.toThrow();
        expect(assignSpy).not.toHaveBeenCalled();
        expect(window.sessionStorage.getItem('QA_AUTH_REDIRECT_FLOW')).toBeNull();
    });

    it('a second press while the first navigation settles does not overwrite the stored flow', async () => {
        jest.mocked(pkce.generatePKCEPair).mockResolvedValue(PAIR_1);

        SessionActions.beginCloudflareAuthRedirect();
        SessionActions.beginCloudflareAuthRedirect();
        await waitForBatchedUpdates();

        expect(assignSpy).toHaveBeenCalledTimes(1);
        expect(pkce.generatePKCEPair).toHaveBeenCalledTimes(1);
    });
});

describe('completeCloudflareAuthRedirect', () => {
    it('caches the session before persistence but resolves only after Onyx.set completed', async () => {
        jest.mocked(oAuthClient.exchangeCode).mockResolvedValue(SESSION_A);
        const persistDeferred = createDeferred<void>();
        const setSpy = jest.spyOn(Onyx, 'set').mockReturnValue(persistDeferred.promise);

        const completion = SessionActions.completeCloudflareAuthRedirect({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});
        let isSettled = false;
        completion.then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();

        expect(oAuthClient.exchangeCode).toHaveBeenCalledWith({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_A); // cache first, requests during this boot must see it
        expect(isSettled).toBe(false); // but it waits for the disk write

        persistDeferred.resolve();
        await completion;
        expect(setSpy).toHaveBeenCalledWith(ONYXKEYS.CF_SESSION, SESSION_A);
        setSpy.mockRestore();
    });

    it('is single-flight: a joiner shares the exchange instead of burning the single-use code twice', async () => {
        const exchangeDeferred = createDeferred<CloudflareSession>();
        jest.mocked(oAuthClient.exchangeCode).mockReturnValue(exchangeDeferred.promise);

        const first = SessionActions.completeCloudflareAuthRedirect({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});
        expect(SessionActions.getPendingCloudflareAuthCompletion()).toBe(first);
        expect(SessionActions.completeCloudflareAuthRedirect({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier})).toBe(first);
        expect(oAuthClient.exchangeCode).toHaveBeenCalledTimes(1);

        exchangeDeferred.resolve(SESSION_A);
        await first;
        expect(SessionActions.getPendingCloudflareAuthCompletion()).toBeNull();
    });

    it('discards an exchange that resolves after sign-out, so the signed-out account is not resurrected', async () => {
        const exchangeDeferred = createDeferred<CloudflareSession>();
        jest.mocked(oAuthClient.exchangeCode).mockReturnValue(exchangeDeferred.promise);

        const completion = SessionActions.completeCloudflareAuthRedirect({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier});
        sessionCleanup.runSessionCleanupCallbacks();
        exchangeDeferred.resolve(SESSION_A);

        await completion;
        // The cache is written before Onyx, so a null cache is proof the exchanged pair never reached the store
        expect(SessionActions.getCloudflareSession()).toBeNull();
    });

    it('resolves and keeps the usable session in cache when the exchange succeeded but Onyx.set rejected', async () => {
        jest.mocked(oAuthClient.exchangeCode).mockResolvedValue(SESSION_A);
        const setSpy = jest.spyOn(Onyx, 'set').mockRejectedValue(new Error('QuotaExceededError'));

        await expect(SessionActions.completeCloudflareAuthRedirect({code: 'auth-code-1', codeVerifier: PAIR_1.codeVerifier})).resolves.toBeUndefined();
        // A failed persist is not a failed sign-in — the cache keeps the session and a reload self-heals
        expect(SessionActions.getCloudflareSession()).toEqual(SESSION_A);
        setSpy.mockRestore();
    });

    it('exposes no pending completion before an exchange starts', () => {
        expect(SessionActions.getPendingCloudflareAuthCompletion()).toBeNull();
    });

    it('propagates an exchange failure and leaves the session empty', async () => {
        // Onyx storage outlives jest.resetModules, so an earlier test's persisted session would hydrate here
        await seedSession(null);
        jest.mocked(oAuthClient.exchangeCode).mockRejectedValue(new oAuthClient.OAuthError('invalid_grant'));

        await expect(SessionActions.completeCloudflareAuthRedirect({code: 'bad-code', codeVerifier: PAIR_1.codeVerifier})).rejects.toMatchObject({code: 'invalid_grant'});
        expect(SessionActions.getCloudflareSession()).toBeNull();
        expect(SessionActions.getPendingCloudflareAuthCompletion()).toBeNull();
    });
});

describe('unconfigured builds', () => {
    it('subscribes to nothing and still resolves hydration, so no caller can hang', async () => {
        jest.resetModules();
        const config = require<typeof ConfigModule>('@libs/CloudflareAccess/Config');
        jest.mocked(config.isQAAuthConfigured).mockReturnValue(false);
        const onyx = require<{default: typeof OnyxDefault}>('react-native-onyx').default;
        const connectSpy = jest.spyOn(onyx, 'connectWithoutView');

        const sessionActions = require<typeof SessionActionsModule>('@userActions/CloudflareSession');

        // Importing the module pulls in unrelated modules that legitimately subscribe to their own keys,
        // so the claim is specifically that nothing connected to the QA session key
        const connectedKeys = connectSpy.mock.calls.map(([connection]) => connection.key);
        expect(connectedKeys).not.toContain(ONYXKEYS.CF_SESSION);
        expect(sessionActions.getCloudflareSession()).toBeNull();
        await expect(sessionActions.waitForCloudflareSessionHydration()).resolves.toBeUndefined();
        connectSpy.mockRestore();
    });
});

describe('native platform safety', () => {
    it('the real getWebCrypto resolves to the native stub here: import-safe and inert', () => {
        // jest-expo's haste config resolves index.native.ts — the same file native builds get.
        // The stub is unreachable behind the native isQAAuthConfigured() gate, so it is a typed no-op.
        const actualProvider = jest.requireActual<{default: WebCryptoProvider}>('@libs/CloudflareAccess/getWebCrypto').default;
        const array = new Uint8Array(1);
        expect(actualProvider.getRandomValues(array)).toBe(array);
    });
});
