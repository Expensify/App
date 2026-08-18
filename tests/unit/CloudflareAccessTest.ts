/**
 * PKCE encoding pinned to the RFC 7636 Appendix B vector, the config security boundary
 * (isQAServerRequest), and the OAuth client's request/response contract.
 */
import type * as ConfigModule from '@libs/CloudflareAccess/Config';
import type * as PKCEModule from '@libs/CloudflareAccess/generatePKCE';
import type * as OAuthClientModule from '@libs/CloudflareAccess/OAuthClient';
import type * as PendingAuthFlowStorageModule from '@libs/CloudflareAccess/PendingAuthFlowStorage';

import Base64URL from '@src/utils/Base64URL';

import {webcrypto} from 'crypto';

// Mutable QA config the '@src/CONFIG' mock closes over — tests tweak fields per case.
// The `mock` prefix is what lets the hoisted jest.mock factory reference it.
const mockQAAuth = {
    API_ROOT: 'https://qa.example.com/',
    TEAM_DOMAIN: 'team.cloudflareaccess.com',
    CLIENT_ID: 'client-123',
};

jest.mock('@src/CONFIG', () => ({__esModule: true, default: {QA_AUTH: mockQAAuth}}));

// Jest resolves getWebCrypto/index.native.ts (the throwing stub) under the jest-expo preset,
// so the provider is mocked; the default implementation is Node's real WebCrypto.
jest.mock('@libs/CloudflareAccess/getWebCrypto', () => ({
    __esModule: true,
    default: {
        getRandomValues: jest.fn(),
        sha256: jest.fn(),
    },
}));

// Lazy-require so the @src/CONFIG mock factory sees an initialized mockQAAuth — otherwise the
// hoisted import order would resolve CONFIG.default while mockQAAuth was still in the TDZ.
const {getQAOrigin, isQAAuthConfigured, isQAServerRequest} = require<typeof ConfigModule>('@libs/CloudflareAccess/Config');
const {clearPendingAuthFlow, consumePendingAuthFlow, savePendingAuthFlow} = require<typeof PendingAuthFlowStorageModule>('@libs/CloudflareAccess/PendingAuthFlowStorage');
const {buildAuthorizeURL, exchangeCode, OAuthError, refreshTokens} = require<typeof OAuthClientModule>('@libs/CloudflareAccess/OAuthClient');
const {generatePKCEPair, generateState} = require<typeof PKCEModule>('@libs/CloudflareAccess/generatePKCE');
const getWebCrypto = require<{default: {getRandomValues: jest.Mock; sha256: jest.Mock}}>('@libs/CloudflareAccess/getWebCrypto').default;

function resetQAAuthConfig() {
    mockQAAuth.API_ROOT = 'https://qa.example.com/';
    mockQAAuth.TEAM_DOMAIN = 'team.cloudflareaccess.com';
    mockQAAuth.CLIENT_ID = 'client-123';
}

beforeEach(() => {
    jest.clearAllMocks();
    resetQAAuthConfig();
    getWebCrypto.getRandomValues.mockImplementation((array: Uint8Array) => webcrypto.getRandomValues(array));
    getWebCrypto.sha256.mockImplementation((data: BufferSource) => webcrypto.subtle.digest('SHA-256', data));
});

describe('pkce', () => {
    it('produces the RFC 7636 Appendix B challenge for the Appendix B verifier', async () => {
        // The spec's worked example pins the whole encoding chain end to end
        const appendixBVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
        const appendixBChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
        const verifierBytes = Base64URL.decode(appendixBVerifier);
        getWebCrypto.getRandomValues.mockImplementation((array: Uint8Array) => {
            array.set(verifierBytes);
            return array;
        });

        const {codeVerifier, codeChallenge} = await generatePKCEPair();

        expect(codeVerifier).toBe(appendixBVerifier);
        expect(codeChallenge).toBe(appendixBChallenge);
    });

    it('generates a 43-char base64url verifier and a 22-char state', async () => {
        const {codeVerifier} = await generatePKCEPair();
        expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(generateState()).toMatch(/^[A-Za-z0-9_-]{22}$/);
    });

    it('regenerates deterministically when the challenge starts with a non-alphanumeric character', async () => {
        // Leading digest byte 248 → top 6 bits = 62 → first base64url char '-' (the CF parser quirk);
        // leading byte 65 → top 6 bits = 16 → 'Q'. A controlled sequence proves the guard, unlike a
        // probabilistic run which would let a deleted guard pass most of the time.
        const digestStartingWithDash = new Uint8Array(32);
        digestStartingWithDash[0] = 248;
        const digestStartingAlphanumeric = new Uint8Array(32);
        digestStartingAlphanumeric[0] = 65;
        // Sanity-check the premise of the test itself
        expect(Base64URL.encode(digestStartingWithDash).startsWith('-')).toBe(true);

        const firstBytes = new Uint8Array(32).fill(1);
        const secondBytes = new Uint8Array(32).fill(2);
        getWebCrypto.getRandomValues
            .mockImplementationOnce((array: Uint8Array) => {
                array.set(firstBytes);
                return array;
            })
            .mockImplementationOnce((array: Uint8Array) => {
                array.set(secondBytes);
                return array;
            });
        getWebCrypto.sha256.mockResolvedValueOnce(digestStartingWithDash.buffer).mockResolvedValueOnce(digestStartingAlphanumeric.buffer);

        const {codeVerifier, codeChallenge} = await generatePKCEPair();

        expect(getWebCrypto.sha256).toHaveBeenCalledTimes(2);
        // The regenerated pair must stay together: second verifier with the second challenge
        expect(codeVerifier).toBe(Base64URL.encode(secondBytes));
        expect(codeChallenge).toBe(Base64URL.encode(digestStartingAlphanumeric));
        expect(codeChallenge).toMatch(/^[a-zA-Z0-9]/);
    });
});

describe('config', () => {
    it.each([
        ['the exact configured origin', 'https://qa.example.com/api/OpenApp', true],
        ['a lookalike origin', 'https://evil-qa.example.com/api/OpenApp', false],
        ['the http scheme on the right host', 'http://qa.example.com/api/OpenApp', false],
        ['a different port on the right host', 'https://qa.example.com:444/api/OpenApp', false],
        ['the QA host appearing only in the path', 'https://attacker.com/qa.example.com', false],
        ['a garbage string', 'not a url at all', false],
    ])('isQAServerRequest with %s → %s', (description, url, expected) => {
        expect(isQAServerRequest(url)).toBe(expected);
    });

    it('treats an empty config as not configured', () => {
        mockQAAuth.API_ROOT = '';
        mockQAAuth.TEAM_DOMAIN = '';
        mockQAAuth.CLIENT_ID = '';
        expect(isQAAuthConfigured()).toBe(false);
        expect(isQAServerRequest('https://qa.example.com/api/OpenApp')).toBe(false);
    });

    it('treats a partial config as not configured — missing API root', () => {
        mockQAAuth.API_ROOT = '';
        expect(isQAAuthConfigured()).toBe(false);
        expect(isQAServerRequest('https://qa.example.com/api/OpenApp')).toBe(false);
    });

    it('treats a partial config as not configured — missing client ID', () => {
        mockQAAuth.CLIENT_ID = '';
        expect(isQAAuthConfigured()).toBe(false);
        expect(isQAServerRequest('https://qa.example.com/api/OpenApp')).toBe(false);
    });

    it('rejects an http API root even when every value is present', () => {
        mockQAAuth.API_ROOT = 'http://qa.example.com/';
        expect(isQAAuthConfigured()).toBe(false);
        expect(isQAServerRequest('http://qa.example.com/api/OpenApp')).toBe(false);
    });

    it.each([
        ['a scheme', 'https://team.cloudflareaccess.com'],
        ['a trailing slash', 'team.cloudflareaccess.com/'],
        ['a single label', 'localhost'],
    ])('rejects a team domain with %s', (description, teamDomain) => {
        mockQAAuth.TEAM_DOMAIN = teamDomain;
        expect(isQAAuthConfigured()).toBe(false);
        expect(isQAServerRequest('https://qa.example.com/api/OpenApp')).toBe(false);
    });

    it('derives the RFC 8707 resource in origin form (no trailing slash)', () => {
        expect(getQAOrigin()).toBe('https://qa.example.com');
    });
});

describe('oAuthClient', () => {
    // Wire-format bodies are built from entries throughout: the OAuth protocol mandates snake_case
    // keys, which the naming-convention lint rule forbids as object-literal property names
    const VALID_TOKEN_ENTRIES: Array<[string, unknown]> = [
        ['access_token', 'oauth:access'],
        ['refresh_token', 'oauth:refresh'],
        ['expires_in', 900],
        ['token_type', 'bearer'],
        ['scope', ''],
        ['resource', 'https://qa.example.com'],
    ];

    function tokenBody(overrides: Array<[string, unknown]> = []): Record<string, unknown> {
        return Object.fromEntries([...VALID_TOKEN_ENTRIES, ...overrides]);
    }

    type CapturedRequest = {url: string; init: RequestInit};

    /** Parses a captured form-encoded body; the implementation always posts a string, so non-strings parse as empty */
    function bodyParams(init: RequestInit | undefined): Record<string, string> {
        const body = init?.body;
        return Object.fromEntries(new URLSearchParams(typeof body === 'string' ? body : '').entries());
    }

    /** Mocks global fetch; the typed implementation captures arguments so assertions never touch `mock.calls` (any-typed) */
    function mockTokenEndpoint(status: number, body: unknown): CapturedRequest[] {
        const captured: CapturedRequest[] = [];
        global.fetch = jest.fn().mockImplementation((url: string, init: RequestInit) => {
            captured.push({url, init});
            return Promise.resolve({
                ok: status >= 200 && status < 300,
                status,
                json: () => (body === undefined ? Promise.reject(new SyntaxError('Unexpected end of JSON input')) : Promise.resolve(body)),
            });
        });
        return captured;
    }

    it('maps an OAuth error response to an OAuthError with the protocol code', async () => {
        mockTokenEndpoint(
            400,
            Object.fromEntries([
                ['error', 'invalid_grant'],
                ['error_description', 'refresh token is invalid'],
            ]),
        );
        const result = refreshTokens('oauth:spent-refresh-token');
        await expect(result).rejects.toBeInstanceOf(OAuthError);
        await expect(result).rejects.toMatchObject({code: 'invalid_grant', message: 'refresh token is invalid'});
    });

    it('maps a non-OAuth failure to a plain error, not an OAuthError', async () => {
        mockTokenEndpoint(502, undefined);
        const result = refreshTokens('oauth:refresh');
        await expect(result).rejects.toThrow('Token endpoint failed with HTTP 502');
        await expect(result).rejects.not.toBeInstanceOf(OAuthError);
    });

    it.each([
        ['a missing refresh_token', tokenBody([['refresh_token', undefined]])],
        ['an empty access_token', tokenBody([['access_token', '']])],
        ['a non-numeric expires_in', tokenBody([['expires_in', '900']])],
        ['a missing token_type', tokenBody([['token_type', undefined]])],
        ['a non-bearer token_type', tokenBody([['token_type', 'mac']])],
        ['a non-object body', 'not-json-object'],
    ])('rejects a 2xx with %s as a terminal invalid_response', async (description, body) => {
        mockTokenEndpoint(200, body);
        await expect(refreshTokens('oauth:refresh')).rejects.toMatchObject({code: 'invalid_response'});
    });

    it('accepts token_type case-insensitively and maps the response into a session', async () => {
        mockTokenEndpoint(200, tokenBody([['token_type', 'Bearer']]));
        const session = await refreshTokens('oauth:refresh');
        expect(session.accessToken).toBe('oauth:access');
        expect(session.refreshToken).toBe('oauth:refresh');
        expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it('buildAuthorizeURL carries exactly the verified parameter set', () => {
        const url = new URL(buildAuthorizeURL({state: 'state-1', codeChallenge: 'challenge-1'}));
        expect(`${url.origin}${url.pathname}`).toBe('https://team.cloudflareaccess.com/cdn-cgi/access/oauth/authorization');
        expect(Object.fromEntries(url.searchParams.entries())).toEqual(
            Object.fromEntries([
                ['response_type', 'code'],
                ['client_id', 'client-123'],
                ['redirect_uri', `${window.location.origin}/oauth/callback`],
                ['state', 'state-1'],
                ['code_challenge', 'challenge-1'],
                ['code_challenge_method', 'S256'],
                ['resource', 'https://qa.example.com'],
            ]),
        );
    });

    it('exchangeCode posts the verified body with a redirect_uri byte-matching the authorize request', async () => {
        const authorizeRedirectURI = new URL(buildAuthorizeURL({state: 's', codeChallenge: 'c'})).searchParams.get('redirect_uri');
        const captured = mockTokenEndpoint(200, tokenBody());

        await exchangeCode({code: 'code-1', codeVerifier: 'verifier-1'});

        const request = captured.at(0);
        expect(request?.url).toBe('https://team.cloudflareaccess.com/cdn-cgi/access/oauth/token');
        expect(request?.init.method).toBe('POST');
        expect(request?.init.credentials).toBe('omit');
        expect(request?.init.headers).toEqual([['Content-Type', 'application/x-www-form-urlencoded']]);
        expect(bodyParams(request?.init)).toEqual(
            Object.fromEntries([
                ['grant_type', 'authorization_code'],
                ['code', 'code-1'],
                ['code_verifier', 'verifier-1'],
                ['redirect_uri', authorizeRedirectURI],
                ['client_id', 'client-123'],
                ['resource', 'https://qa.example.com'],
            ]),
        );
    });

    it('refreshTokens posts the verified body and omits resource', async () => {
        const captured = mockTokenEndpoint(200, tokenBody());

        await refreshTokens('oauth:refresh-1');

        expect(bodyParams(captured.at(0)?.init)).toEqual(
            Object.fromEntries([
                ['grant_type', 'refresh_token'],
                ['refresh_token', 'oauth:refresh-1'],
                ['client_id', 'client-123'],
            ]),
        );
    });
});

describe('pendingAuthFlowStorage', () => {
    const STORAGE_KEY = 'QA_AUTH_REDIRECT_FLOW';
    const FLOW = {state: 'state-1', codeVerifier: 'verifier-1', returnURL: 'http://localhost/settings/troubleshoot', createdAt: 1_700_000_000_000};

    let nowSpy: jest.SpyInstance;

    beforeEach(() => {
        window.sessionStorage.clear();
        nowSpy = jest.spyOn(Date, 'now').mockReturnValue(FLOW.createdAt);
    });

    afterEach(() => {
        nowSpy.mockRestore();
        // Storage.prototype spies below must not survive into the next test, whether or not it asserted cleanly
        jest.restoreAllMocks();
        window.sessionStorage.clear();
    });

    it('round-trips the flow record', () => {
        savePendingAuthFlow(FLOW);
        expect(consumePendingAuthFlow()).toEqual(FLOW);
    });

    it('is single-use: the record is removed even before it is validated', () => {
        savePendingAuthFlow(FLOW);
        consumePendingAuthFlow();
        expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
        // A replayed callback URL finds nothing — the verifier can never be reused
        expect(consumePendingAuthFlow()).toBeNull();
    });

    it('treats an expired record as absent, so a stale verifier is never exchanged', () => {
        savePendingAuthFlow(FLOW);
        nowSpy.mockReturnValue(FLOW.createdAt + 11 * 60 * 1000);
        expect(consumePendingAuthFlow()).toBeNull();
    });

    it.each([
        ['unparseable JSON', 'not json'],
        ['a missing verifier', JSON.stringify({state: 's', returnURL: '/', createdAt: FLOW.createdAt})],
        ['an empty state', JSON.stringify({...FLOW, state: ''})],
    ])('returns null for %s, and still clears it', (_label, raw) => {
        window.sessionStorage.setItem(STORAGE_KEY, raw);
        expect(consumePendingAuthFlow()).toBeNull();
        expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('clearPendingAuthFlow drops a pending record', () => {
        savePendingAuthFlow(FLOW);
        clearPendingAuthFlow();
        expect(consumePendingAuthFlow()).toBeNull();
    });

    it('reports the record absent when reading it throws, rather than taking down the boot it runs in', () => {
        // A hardened configuration hands back a usable Storage whose methods still throw SecurityError
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });
        jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });

        expect(consumePendingAuthFlow()).toBeNull();
    });

    it('throws when the write fails, so the caller refuses to navigate away without a stored verifier', () => {
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

        expect(() => savePendingAuthFlow(FLOW)).toThrow('QuotaExceededError');

        Object.defineProperty(window, 'sessionStorage', {value: realSessionStorage, writable: true, configurable: true});
    });
});
