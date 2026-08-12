/**
 * Which requests get the bearer header, and the 401 → refresh → single retry recovery. The session action is
 * mocked; its own invariants live in CloudflareSessionTest, so asserting them here would test the mock.
 */
import type * as ConfigModule from '@libs/CloudflareAccess/Config';
import {isQAServerRequest} from '@libs/CloudflareAccess/Config';
import fetchWithQAAuth, {CF_REAUTH_REQUIRED} from '@libs/CloudflareAccess/fetchWithQAAuth';

import {getCloudflareSession, markCloudflareSessionRejected, refreshCloudflareSession} from '@userActions/CloudflareSession';

jest.mock('@userActions/CloudflareSession', () => ({
    __esModule: true,
    getCloudflareSession: jest.fn(),
    markCloudflareSessionRejected: jest.fn(),
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
    jest.mocked(markCloudflareSessionRejected).mockResolvedValue(undefined);
});

describe('fetchWithQAAuth', () => {
    it('attaches the bearer header on a QA request, keeps credentials omitted', async () => {
        const {captured} = mockFetchSequence(response(200));

        await fetchWithQAAuth(QA_URL, {method: 'post'});

        expect(captured.at(0)?.init.headers).toEqual({Authorization: `Bearer ${SESSION_A.accessToken}`});
        expect(captured.at(0)?.init.credentials).toBe('omit');
    });

    it('sends no auth header for any other origin, even with a live session', async () => {
        const {captured} = mockFetchSequence(response(200));

        await fetchWithQAAuth(OTHER_URL, {method: 'post'});

        expect(captured.at(0)?.init.headers).toBeUndefined();
        expect(captured.at(0)?.init.credentials).toBe('omit');
    });

    it('on a 401: refreshes once with the used token and retries once with the rotated token', async () => {
        jest.mocked(getCloudflareSession).mockReturnValueOnce(SESSION_A).mockReturnValue(SESSION_B);
        const {fetchMock, captured} = mockFetchSequence(response(401), response(200));

        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).resolves.toMatchObject({status: 200});

        expect(refreshCloudflareSession).toHaveBeenCalledTimes(1);
        expect(refreshCloudflareSession).toHaveBeenCalledWith(SESSION_A.accessToken);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(captured.at(1)?.init.headers).toEqual({Authorization: `Bearer ${SESSION_B.accessToken}`});
    });

    it('rejects with the re-auth sentinel and does not retry when the refresh outcome is terminal', async () => {
        jest.mocked(refreshCloudflareSession).mockResolvedValue('reauth-required');
        const {fetchMock} = mockFetchSequence(response(401));

        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).rejects.toThrow(CF_REAUTH_REQUIRED);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(markCloudflareSessionRejected).not.toHaveBeenCalled();
    });

    it('propagates a transient refresh failure as-is — the session is still alive', async () => {
        const transientError = new TypeError('Failed to fetch');
        jest.mocked(refreshCloudflareSession).mockRejectedValue(transientError);
        const {fetchMock} = mockFetchSequence(response(401));

        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).rejects.toBe(transientError);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(markCloudflareSessionRejected).not.toHaveBeenCalled();
    });

    it('on a second 401: drops the rejected session and rejects with the re-auth sentinel', async () => {
        jest.mocked(getCloudflareSession).mockReturnValueOnce(SESSION_A).mockReturnValue(SESSION_B);
        const {fetchMock} = mockFetchSequence(response(401), response(401));

        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).rejects.toThrow(CF_REAUTH_REQUIRED);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(refreshCloudflareSession).toHaveBeenCalledTimes(1);
        expect(markCloudflareSessionRejected).toHaveBeenCalledTimes(1);
        expect(markCloudflareSessionRejected).toHaveBeenCalledWith(SESSION_B.accessToken);
    });

    it('leaves a 401 from any other origin alone — no refresh, no retry', async () => {
        const {fetchMock} = mockFetchSequence(response(401));

        await expect(fetchWithQAAuth(OTHER_URL, {method: 'post'})).resolves.toMatchObject({status: 401});

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(refreshCloudflareSession).not.toHaveBeenCalled();
    });

    it('returns a non-401 error response untouched, so the caller decides', async () => {
        mockFetchSequence(response(500));

        await expect(fetchWithQAAuth(QA_URL, {method: 'post'})).resolves.toMatchObject({status: 500});

        expect(refreshCloudflareSession).not.toHaveBeenCalled();
    });
});
