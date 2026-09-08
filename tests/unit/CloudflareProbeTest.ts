/**
 * The probe's decision tree: which branch runs for which session state, and that every failure comes back
 * as a semantic result rather than a rejection. Its dependencies are mocked, since they have their own suites.
 */
import {CF_REAUTH_REQUIRED} from '@libs/CloudflareAccess/fetchWithQAAuth';

import {runCloudflareAuthProbe} from '@userActions/CloudflareProbe';
import {redirectToCloudflareSignIn, getCloudflareSession, getPendingCloudflareCodeExchange, isSessionNearExpiry, refreshCloudflareSession} from '@userActions/CloudflareSession';

import type CloudflareSession from '@src/types/onyx/CloudflareSession';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/** The slice of the fetch Response the probe touches. A full Response stub would add nothing */
type ProbeResponse = {ok: boolean; status: number; json: () => Promise<unknown>};

const mockFetchWithQAAuth = jest.fn<Promise<ProbeResponse>, [string, {method?: string}]>();

function jsonResponse(body: unknown): ProbeResponse {
    return {ok: true, status: 200, json: () => Promise.resolve(body)};
}

jest.mock('@userActions/CloudflareSession', () => ({
    __esModule: true,
    getCloudflareSession: jest.fn(),
    getPendingCloudflareCodeExchange: jest.fn(() => null),
    isSessionNearExpiry: jest.fn(() => false),
    refreshCloudflareSession: jest.fn(),
    waitForCloudflareSessionHydration: jest.fn(() => Promise.resolve()),
    redirectToCloudflareSignIn: jest.fn(),
}));

jest.mock('@libs/CloudflareAccess/fetchWithQAAuth', () => ({
    __esModule: true,
    // Forwarding wrapper instead of the mock itself: the factory runs while the hoisted import chain is still
    // executing, before mockFetchWithQAAuth's initializer. A direct reference would capture undefined
    default: (...args: Parameters<typeof mockFetchWithQAAuth>) => mockFetchWithQAAuth(...args),
    CF_REAUTH_REQUIRED: 'Cloudflare re-authentication required',
}));

const SESSION: CloudflareSession = {accessToken: 'oauth:access', refreshToken: 'oauth:refresh', expiresAt: 1900000000000};

beforeEach(() => {
    jest.clearAllMocks();
    // clearAllMocks keeps implementations, and the redirect stub is deliberately never-settling in one
    // case. Leaking that into the next test would hang it
    jest.mocked(redirectToCloudflareSignIn).mockReset();
    jest.mocked(isSessionNearExpiry).mockReturnValue(false);
    jest.mocked(getPendingCloudflareCodeExchange).mockReturnValue(null);
    mockFetchWithQAAuth.mockResolvedValue(jsonResponse({jsonCode: 200, authenticatedVia: 'oauth-bearer'}));
});

describe('runCloudflareAuthProbe', () => {
    it('with no session: starts the redirect and never fires the request — the page is leaving', async () => {
        // Given no stored session, so the only path to working auth is a fresh authorize round trip
        jest.mocked(getCloudflareSession).mockReturnValue(null);
        // Given a redirect stub that, like the real one, navigates the tab away and never settles
        jest.mocked(redirectToCloudflareSignIn).mockReturnValue(new Promise<never>(() => {}));

        // When the probe runs
        let isSettled = false;
        runCloudflareAuthProbe().then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();

        // Then it should start the redirect and do nothing else: the page is leaving, so firing the request
        // or settling the promise would only report into a tab that is about to be gone
        expect(redirectToCloudflareSignIn).toHaveBeenCalledTimes(1);
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
        expect(isSettled).toBe(false);
    });

    it('joins a callback-boot exchange instead of starting a second redirect', async () => {
        // Given the boot after the callback: the exchange is in flight, and populates the cache before the
        // probe reads it, so no second round trip is needed
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        jest.mocked(getPendingCloudflareCodeExchange).mockReturnValue(Promise.resolve());

        // When the probe runs
        // Then it should join the in-flight exchange and succeed off the session that exchange produced
        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'success', detail: 'authenticatedVia: oauth-bearer'});

        // Then no second redirect should start: the authorization code is single-use, so another round trip
        // could only invalidate the exchange already under way
        expect(redirectToCloudflareSignIn).not.toHaveBeenCalled();
    });

    it('surfaces a failed callback-boot exchange as signInFailed, with no redirect', async () => {
        // Given a callback boot whose in-flight exchange rejects. The sign-in itself failed
        jest.mocked(getCloudflareSession).mockReturnValue(null);
        jest.mocked(getPendingCloudflareCodeExchange).mockReturnValue(Promise.reject(new Error('invalid_grant')));

        // When the probe joins that exchange
        // Then it should report signInFailed rather than a generic error: the sign-in failed, not the probe,
        // and naming it tells the user that running the probe again (a fresh authorize round trip) is the retry
        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'signInFailed', detail: 'invalid_grant'});

        // Then no redirect and no request: the retry must be the user's informed rerun, not something the
        // probe launches behind their back
        expect(redirectToCloudflareSignIn).not.toHaveBeenCalled();
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
    });

    it('with a fresh session: goes straight to the request, no auth flow', async () => {
        // Given a valid session nowhere near expiry
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);

        // When the probe runs
        // Then it should succeed and echo how the Worker authenticated the request. Exercising that
        // end-to-end path is the probe's whole purpose
        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'success', detail: 'authenticatedVia: oauth-bearer'});

        // Then neither redirect nor refresh should run: a healthy session needs no auth flow, so the happy
        // path must cost nothing beyond the request itself
        expect(redirectToCloudflareSignIn).not.toHaveBeenCalled();
        expect(refreshCloudflareSession).not.toHaveBeenCalled();
    });

    it('near expiry with a terminal refresh: reports reauthRequired with no redirect and no request', async () => {
        // Given a session near expiry whose refresh fails terminally. The refresh token itself is no longer good
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        jest.mocked(isSessionNearExpiry).mockReturnValue(true);
        jest.mocked(refreshCloudflareSession).mockResolvedValue('reauth-required');

        // When the probe runs without consent to redirect
        // Then it should report reauthRequired, so the user is told re-auth is needed before anything drastic happens
        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'reauthRequired'});

        // Then no redirect and no request: an unannounced background failure must never navigate the tab
        // away, and probing with a token the Worker will reject would prove nothing
        expect(redirectToCloudflareSignIn).not.toHaveBeenCalled();
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
    });

    it('near expiry with a terminal refresh and consent: starts the redirect and never settles', async () => {
        // Given the same terminal refresh failure as above
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        jest.mocked(isSessionNearExpiry).mockReturnValue(true);
        jest.mocked(refreshCloudflareSession).mockResolvedValue('reauth-required');
        // Given a redirect stub that, like the real one, navigates away and never settles
        jest.mocked(redirectToCloudflareSignIn).mockReturnValue(new Promise<never>(() => {}));

        // When the probe runs with shouldRedirectOnReauthRequired. The user already saw reauthRequired and
        // pressed Run again, and that informed second press is the consent
        let isSettled = false;
        runCloudflareAuthProbe({shouldRedirectOnReauthRequired: true}).then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();

        // Then the same failure that was only reported before now starts the redirect and never settles:
        // consent makes navigating the tab away acceptable, and the leaving page has nothing left to report
        expect(redirectToCloudflareSignIn).toHaveBeenCalledTimes(1);
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
        expect(isSettled).toBe(false);
    });

    it('maps the request-level re-auth rejection to a redirect when consented', async () => {
        // Given a locally fresh session that the Worker nevertheless rejects mid-request. The server, not
        // the local clock, is the authority on when re-auth is needed
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        mockFetchWithQAAuth.mockRejectedValue(new Error(CF_REAUTH_REQUIRED));
        jest.mocked(redirectToCloudflareSignIn).mockReturnValue(new Promise<never>(() => {}));

        // When the probe runs with consent already granted
        let isSettled = false;
        runCloudflareAuthProbe({shouldRedirectOnReauthRequired: true}).then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();

        // Then the redirect should start and the probe never settle: the consent covers this rejection too,
        // because it is the same re-auth condition surfacing one step later
        expect(redirectToCloudflareSignIn).toHaveBeenCalledTimes(1);
        expect(isSettled).toBe(false);
    });

    it('near expiry with a transient refresh failure: reports a plain error, keeps advice honest', async () => {
        // Given a session near expiry whose refresh fails transiently. The network dropped, not the token
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        jest.mocked(isSessionNearExpiry).mockReturnValue(true);
        jest.mocked(refreshCloudflareSession).mockRejectedValue(new TypeError('Failed to fetch'));

        // When the probe runs
        // Then it should report a plain error rather than reauthRequired: the session is intact and a retry
        // may work, so any stronger advice would be dishonest
        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'error', detail: 'Failed to fetch'});

        // Then the request should not fire: continuing past the failed refresh would probe with a token it just failed to renew
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
    });

    it('maps the request-level re-auth rejection to reauthRequired', async () => {
        // Given a locally fresh session that the Worker rejects mid-request with the re-auth marker
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        mockFetchWithQAAuth.mockRejectedValue(new Error(CF_REAUTH_REQUIRED));

        // When the probe runs without consent to redirect
        // Then it should map the rejection to reauthRequired instead of rejecting or redirecting: the probe
        // never rejects, and an unannounced redirect would navigate the tab away unannounced
        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'reauthRequired'});
    });

    it('maps a redirect that could not start to a semantic error result', async () => {
        // Given no session and a redirect that cannot even begin
        jest.mocked(getCloudflareSession).mockReturnValue(null);
        jest.mocked(redirectToCloudflareSignIn).mockRejectedValue(new Error('Session storage is unavailable'));

        // When the probe runs
        // Then even this failure should resolve as a semantic error result: the probe must never reject,
        // because the UI consumes it with .then only
        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'error', detail: 'Session storage is unavailable'});
    });

    it('reports success with a null echo when the Worker response carries no authenticatedVia', async () => {
        // Given a Worker response that omits the authenticatedVia echo
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        mockFetchWithQAAuth.mockResolvedValue(jsonResponse({jsonCode: 200}));

        // When the probe runs
        // Then it should still report success, showing 'null' for the echo: the echo is a diagnostic read
        // loosely, not a contract, so its absence must not fail an otherwise healthy round trip
        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'success', detail: 'authenticatedVia: null'});
    });
});
