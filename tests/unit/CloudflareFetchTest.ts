/**
 * Which requests get the bearer header, and the recovery where a 401 triggers one refresh and a single retry.
 * mocked. Its own invariants live in CloudflareSessionTest, so asserting them here would test the mock.
 */
import type * as ConfigModule from '@libs/CloudflareAccess/Config';
import {isQAServerRequest} from '@libs/CloudflareAccess/Config';
import fetchWithQAAuth, {CF_REAUTH_REQUIRED} from '@libs/CloudflareAccess/fetchWithQAAuth';

import {getCloudflareSession, refreshCloudflareSession} from '@userActions/CloudflareSession';

jest.mock('@userActions/CloudflareSession', () => ({
    __esModule: true,
    getCloudflareSession: jest.fn(),
    refreshCloudflareSession: jest.fn(),
}));

jest.mock('@libs/CloudflareAccess/Config', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ConfigModule>('@libs/CloudflareAccess/Config'),
    isQAServerRequest: jest.fn(() => false),
}));

const QA_API_ROOT = 'https://qa.example.com/';
const QA_URL = `${QA_API_ROOT}api/CloudflareAuthProbe`;
const OTHER_URL = 'https://www.expensify.com/api/OpenApp';
const SESSION_A = {accessToken: 'oauth:access-a', refreshToken: 'oauth:refresh-a', expiresAt: 1900000000000};
const SESSION_B = {accessToken: 'oauth:access-b', refreshToken: 'oauth:refresh-b', expiresAt: 1900000900000};

function response(status: number) {
    return {ok: status >= 200 && status < 300, status, json: () => Promise.resolve({})};
}

type CapturedRequest = {url: string; init: RequestInit};

/** Scripted responses with typed argument capture, so assertions never touch `mock.calls` (any-typed) */
function mockFetchSequence(...responses: Array<ReturnType<typeof response>>) {
    const captured: CapturedRequest[] = [];
    const fetchMock = jest.fn().mockImplementation((url: string, init: RequestInit) => {
        captured.push({url, init});
        return Promise.resolve(responses.at(Math.min(captured.length, responses.length) - 1));
    });
    global.fetch = fetchMock;
    return {fetchMock, captured};
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isQAServerRequest).mockImplementation((url: string) => url.startsWith(QA_API_ROOT));
    jest.mocked(getCloudflareSession).mockReturnValue(SESSION_A);
    jest.mocked(refreshCloudflareSession).mockResolvedValue('refreshed');
});

describe('fetchWithQAAuth', () => {
    it('attaches the bearer header on a QA request, keeps credentials omitted', async () => {
        // Given a live session and a request to the exact configured QA origin. The one place the token is allowed to go
        const {captured} = mockFetchSequence(response(200));

        // When the request is made
        await fetchWithQAAuth(QA_URL, {method: 'post'});

        // Then the token travels in the Authorization header, and credentials stay omitted like HttpUtils. Auth rides in the header, never cookies
        expect(captured.at(0)?.init.headers).toEqual({Authorization: `Bearer ${SESSION_A.accessToken}`});
        expect(captured.at(0)?.init.credentials).toBe('omit');
    });

    it('sends no auth header for any other origin, even with a live session', async () => {
        // Given a live session but a request to some other origin. The exact-origin match is the security boundary
        const {captured} = mockFetchSequence(response(200));

        // When the request is made
        await fetchWithQAAuth(OTHER_URL, {method: 'post'});

        // Then no auth header is attached, so the token can never leak to production, staging, or a user-controlled URL. Credentials stay omitted either way
        expect(captured.at(0)?.init.headers).toBeUndefined();
        expect(captured.at(0)?.init.credentials).toBe('omit');
    });

    it('on a 401: refreshes once with the used token and retries once with the rotated token', async () => {
        // Given the QA origin rejects the current token with a 401, and a refresh would rotate the session to a new token
        jest.mocked(getCloudflareSession).mockReturnValueOnce(SESSION_A).mockReturnValue(SESSION_B);
        const {fetchMock, captured} = mockFetchSequence(response(401), response(200));

        // When the request is made, it recovers and resolves with the retried response
        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).resolves.toMatchObject({status: 200});

        // Then exactly one refresh (keyed on the token that just failed) and one retry happen, and the retry already carries the rotated token. Refresh must persist the new session before resolving
        expect(refreshCloudflareSession).toHaveBeenCalledTimes(1);
        expect(refreshCloudflareSession).toHaveBeenCalledWith(SESSION_A.accessToken);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(captured.at(1)?.init.headers).toEqual({Authorization: `Bearer ${SESSION_B.accessToken}`});
    });

    it('rejects with the re-auth marker and does not retry when the refresh outcome is terminal', async () => {
        // Given the QA origin 401s and the refresh reports a terminal outcome. The session is unrecoverable
        jest.mocked(refreshCloudflareSession).mockResolvedValue('reauth-required');
        const {fetchMock} = mockFetchSequence(response(401));

        // When the request is made, it rejects with the marker so the caller knows to start a fresh authorize round trip
        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).rejects.toThrow(CF_REAUTH_REQUIRED);

        // Then no retry was attempted. Retrying with a dead session would just 401 again
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('propagates a transient refresh failure as-is — the session is still alive', async () => {
        // Given the QA origin 401s and the refresh fails transiently (e.g. network blip). The session itself is still alive
        const transientError = new TypeError('Failed to fetch');
        jest.mocked(refreshCloudflareSession).mockRejectedValue(transientError);
        const {fetchMock} = mockFetchSequence(response(401));

        // When the request is made, the transient error propagates as-is rather than being converted to re-auth, so the caller may simply retry later
        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).rejects.toBe(transientError);

        // Then no retry was attempted with the un-refreshed token
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('on a second 401: rejects with the re-auth marker and leaves the shared session alone', async () => {
        // Given the retry with the freshly rotated token still gets a 401. Refreshing again clearly won't help
        jest.mocked(getCloudflareSession).mockReturnValueOnce(SESSION_A).mockReturnValue(SESSION_B);
        const {fetchMock} = mockFetchSequence(response(401), response(401));

        // When the request is made, it rejects with the re-auth marker instead of looping refresh attempts
        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).rejects.toThrow(CF_REAUTH_REQUIRED);

        // Then only one refresh happened, and the shared session store was deliberately left alone. It is shared across tabs, so recovery is by replacement, not deletion
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(refreshCloudflareSession).toHaveBeenCalledTimes(1);
    });

    it('leaves a 401 from any other origin alone — no refresh, no retry', async () => {
        // Given a 401 from a non-QA origin, no bearer was sent there, so it cannot be a Cloudflare Access rejection
        const {fetchMock} = mockFetchSequence(response(401));

        // When the request is made, the 401 is returned untouched for the caller to handle
        await expect(fetchWithQAAuth(OTHER_URL, {method: 'post'})).resolves.toMatchObject({status: 401});

        // Then no refresh or retry happened. The Cloudflare session had nothing to do with this failure
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(refreshCloudflareSession).not.toHaveBeenCalled();
    });

    it('returns a non-401 error response untouched, so the caller decides', async () => {
        // Given the QA origin returns an error other than 401. The token was accepted, something else failed
        mockFetchSequence(response(500));

        // When the request is made, the error response is returned untouched so the caller decides what to do with it
        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).resolves.toMatchObject({status: 500});

        // Then no refresh was burned. Only a 401 signals a Cloudflare Access token problem
        expect(refreshCloudflareSession).not.toHaveBeenCalled();
    });
});
