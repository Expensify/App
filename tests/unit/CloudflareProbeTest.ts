/**
 * The probe's decision tree: which branch runs for which session state, and that every failure comes back
 * as a semantic result rather than a rejection. Its dependencies are mocked; they have their own suites.
 */
import {CF_REAUTH_REQUIRED} from '@libs/CloudflareAccess/fetchWithQAAuth';

import {runCloudflareAuthProbe} from '@userActions/CloudflareProbe';
import {beginCloudflareAuthRedirect, getCloudflareSession, getPendingCloudflareAuthCompletion, isSessionNearExpiry, refreshCloudflareSession} from '@userActions/CloudflareSession';

import type CloudflareSession from '@src/types/onyx/CloudflareSession';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/** The slice of the fetch Response the probe touches; a full Response stub would add nothing */
type ProbeResponse = {ok: boolean; status: number; json: () => Promise<unknown>};

const mockFetchWithQAAuth = jest.fn<Promise<ProbeResponse>, [string, {method?: string}]>();

function jsonResponse(body: unknown): ProbeResponse {
    return {ok: true, status: 200, json: () => Promise.resolve(body)};
}

jest.mock('@userActions/CloudflareSession', () => ({
    __esModule: true,
    getCloudflareSession: jest.fn(),
    getPendingCloudflareAuthCompletion: jest.fn(() => null),
    isSessionNearExpiry: jest.fn(() => false),
    refreshCloudflareSession: jest.fn(),
    waitForCloudflareSessionHydration: jest.fn(() => Promise.resolve()),
    beginCloudflareAuthRedirect: jest.fn(),
}));

jest.mock('@libs/CloudflareAccess/fetchWithQAAuth', () => ({
    __esModule: true,
    // Forwarding wrapper instead of the mock itself: the factory runs while the hoisted import chain is still
    // executing, before mockFetchWithQAAuth's initializer — a direct reference would capture undefined
    default: (...args: Parameters<typeof mockFetchWithQAAuth>) => mockFetchWithQAAuth(...args),
    CF_REAUTH_REQUIRED: 'Cloudflare re-authentication required',
}));

const SESSION: CloudflareSession = {accessToken: 'oauth:access', refreshToken: 'oauth:refresh', expiresAt: 1900000000000};

beforeEach(() => {
    jest.clearAllMocks();
    // clearAllMocks keeps implementations, and the redirect stub is deliberately never-settling in one
    // case — leaking that into the next test would hang it
    jest.mocked(beginCloudflareAuthRedirect).mockReset();
    jest.mocked(isSessionNearExpiry).mockReturnValue(false);
    jest.mocked(getPendingCloudflareAuthCompletion).mockReturnValue(null);
    mockFetchWithQAAuth.mockResolvedValue(jsonResponse({jsonCode: 200, authenticatedVia: 'oauth-bearer'}));
});

describe('runCloudflareAuthProbe', () => {
    it('with no session: starts the redirect and never fires the request — the page is leaving', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(null);
        // The real one navigates the tab away and never settles
        jest.mocked(beginCloudflareAuthRedirect).mockReturnValue(new Promise<never>(() => {}));

        let isSettled = false;
        runCloudflareAuthProbe().then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();

        expect(beginCloudflareAuthRedirect).toHaveBeenCalledTimes(1);
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
        expect(isSettled).toBe(false);
    });

    it('joins a callback-boot exchange instead of starting a second redirect', async () => {
        // The boot after the callback: the exchange is in flight, and populates the cache before the
        // probe reads it — so no second round trip is needed
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        jest.mocked(getPendingCloudflareAuthCompletion).mockReturnValue(Promise.resolve());

        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'success', detail: 'authenticatedVia: oauth-bearer'});

        expect(beginCloudflareAuthRedirect).not.toHaveBeenCalled();
    });

    it('surfaces a failed callback-boot exchange as signInFailed, with no redirect', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(null);
        jest.mocked(getPendingCloudflareAuthCompletion).mockReturnValue(Promise.reject(new Error('invalid_grant')));

        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'signInFailed', detail: 'invalid_grant'});

        expect(beginCloudflareAuthRedirect).not.toHaveBeenCalled();
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
    });

    it('with a fresh session: goes straight to the request, no auth flow', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);

        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'success', detail: 'authenticatedVia: oauth-bearer'});

        expect(beginCloudflareAuthRedirect).not.toHaveBeenCalled();
        expect(refreshCloudflareSession).not.toHaveBeenCalled();
    });

    it('near expiry with a terminal refresh: reports reauthRequired with no redirect and no request', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        jest.mocked(isSessionNearExpiry).mockReturnValue(true);
        jest.mocked(refreshCloudflareSession).mockResolvedValue('reauth-required');

        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'reauthRequired'});

        // A background failure must never navigate the tab away
        expect(beginCloudflareAuthRedirect).not.toHaveBeenCalled();
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
    });

    it('near expiry with a terminal refresh and consent: starts the redirect and never settles', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        jest.mocked(isSessionNearExpiry).mockReturnValue(true);
        jest.mocked(refreshCloudflareSession).mockResolvedValue('reauth-required');
        jest.mocked(beginCloudflareAuthRedirect).mockReturnValue(new Promise<never>(() => {}));

        let isSettled = false;
        runCloudflareAuthProbe({shouldRedirectOnReauthRequired: true}).then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();

        expect(beginCloudflareAuthRedirect).toHaveBeenCalledTimes(1);
        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
        expect(isSettled).toBe(false);
    });

    it('maps the request-level re-auth rejection to a redirect when consented', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        mockFetchWithQAAuth.mockRejectedValue(new Error(CF_REAUTH_REQUIRED));
        jest.mocked(beginCloudflareAuthRedirect).mockReturnValue(new Promise<never>(() => {}));

        let isSettled = false;
        runCloudflareAuthProbe({shouldRedirectOnReauthRequired: true}).then(() => {
            isSettled = true;
            return undefined;
        });
        await waitForBatchedUpdates();

        expect(beginCloudflareAuthRedirect).toHaveBeenCalledTimes(1);
        expect(isSettled).toBe(false);
    });

    it('near expiry with a transient refresh failure: reports a plain error, keeps advice honest', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        jest.mocked(isSessionNearExpiry).mockReturnValue(true);
        jest.mocked(refreshCloudflareSession).mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'error', detail: 'Failed to fetch'});

        expect(mockFetchWithQAAuth).not.toHaveBeenCalled();
    });

    it('maps the request-level re-auth rejection to reauthRequired', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        mockFetchWithQAAuth.mockRejectedValue(new Error(CF_REAUTH_REQUIRED));

        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'reauthRequired'});
    });

    it('maps a redirect that could not start to a semantic error result', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(null);
        jest.mocked(beginCloudflareAuthRedirect).mockRejectedValue(new Error('Session storage is unavailable'));

        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'error', detail: 'Session storage is unavailable'});
    });

    it('reports success with a null echo when the Worker response carries no authenticatedVia', async () => {
        jest.mocked(getCloudflareSession).mockReturnValue(SESSION);
        mockFetchWithQAAuth.mockResolvedValue(jsonResponse({jsonCode: 200}));

        await expect(runCloudflareAuthProbe()).resolves.toEqual({status: 'success', detail: 'authenticatedVia: null'});
    });
});
