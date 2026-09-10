/** Boot runs capture and exchange as two phases, so the tests drive both: the only combination the app ever produces */
import type * as CaptureAuthCallbackModule from '@libs/CloudflareAccess/captureAuthCallbackURL/index.ts';
import type * as ConfigModule from '@libs/CloudflareAccess/Config/index.ts';
import type * as AuthRedirectCallbackModule from '@libs/CloudflareAccess/finishSignInFromURL/index.ts';
import type * as PendingAuthFlowStorageModule from '@libs/CloudflareAccess/PendingAuthFlowStorage';

import type * as SessionActionsModule from '@userActions/CloudflareSession';

const mockQAAuth = {
    API_ROOT: 'https://qa.example.com/',
    TEAM_DOMAIN: 'team.cloudflareaccess.com',
    CLIENT_ID: 'client-123',
};

jest.mock('@src/CONFIG', () => ({__esModule: true, default: {QA_AUTH: mockQAAuth}}));

// jest resolves the platform split to the native variant, whose isQAAuthConfigured() is always false, so
// this points the module at the web implementation the handler under test runs against
jest.mock('@libs/CloudflareAccess/Config', () => jest.requireActual<typeof ConfigModule>('@libs/CloudflareAccess/Config/index.ts'));

// Same reason, and it must be this single instance: the exchange phase reads what the capture phase stored
jest.mock('@libs/CloudflareAccess/captureAuthCallbackURL', () => jest.requireActual<typeof CaptureAuthCallbackModule>('@libs/CloudflareAccess/captureAuthCallbackURL/index.ts'));

// Declared outside the factory: beforeEach resets the module registry, which would otherwise hand the module
// under test a fresh spy on every test while the assertions kept reading the first one
const mockLogWarn = jest.fn();
jest.mock('@libs/Log', () => ({__esModule: true, default: {warn: mockLogWarn}}));

jest.mock('@userActions/CloudflareSession', () => ({
    __esModule: true,
    exchangeCodeForCloudflareSession: jest.fn(() => Promise.resolve()),
}));

const RETURN_URL = 'http://localhost/settings/troubleshoot';
const FLOW = {state: 'state-1', codeVerifier: 'verifier-1', returnURL: RETURN_URL, createdAt: 1_700_000_000_000};

let captureAuthCallback: typeof CaptureAuthCallbackModule;
let authRedirectCallback: typeof AuthRedirectCallbackModule;
let pendingAuthFlowStorage: typeof PendingAuthFlowStorageModule;
let sessionActions: typeof SessionActionsModule;
let replaceStateSpy: jest.SpyInstance;
let nowSpy: jest.SpyInstance;

/** Points jsdom at the callback URL without triggering a real navigation */
function arrangeCallbackURL(search: string) {
    Object.defineProperty(window, 'location', {
        value: {origin: 'http://localhost', href: `http://localhost/oauth/callback${search}`, pathname: '/oauth/callback'},
        writable: true,
        configurable: true,
    });
}

let realLocation: Location;

beforeEach(() => {
    jest.resetModules();
    mockLogWarn.mockClear();
    window.sessionStorage.clear();
    realLocation = window.location;
    mockQAAuth.CLIENT_ID = 'client-123';
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(FLOW.createdAt);
    replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    pendingAuthFlowStorage = require<typeof PendingAuthFlowStorageModule>('@libs/CloudflareAccess/PendingAuthFlowStorage');
    captureAuthCallback = require<typeof CaptureAuthCallbackModule>('@libs/CloudflareAccess/captureAuthCallbackURL');
    sessionActions = require<typeof SessionActionsModule>('@userActions/CloudflareSession');
    authRedirectCallback = require<typeof AuthRedirectCallbackModule>('@libs/CloudflareAccess/finishSignInFromURL/index.ts');
});

afterEach(() => {
    replaceStateSpy.mockRestore();
    nowSpy.mockRestore();
    Object.defineProperty(window, 'location', {value: realLocation, writable: true, configurable: true});
});

function runBoot() {
    captureAuthCallback.captureCloudflareAuthCallbackURL();
    return authRedirectCallback.default();
}

describe('the boot-time QA auth callback handling', () => {
    it('is a no-op off the callback path — every normal boot runs this', () => {
        // Given a pending flow saved by another tab's in-flight round trip, while this boot sits on an ordinary app route
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);
        Object.defineProperty(window, 'location', {
            value: {origin: 'http://localhost', href: RETURN_URL, pathname: '/settings/troubleshoot'},
            writable: true,
            configurable: true,
        });

        // When the boot-time handler runs, as it does on every boot
        // Then it must be a complete no-op (no URL rewrite, no exchange), because treating an ordinary boot as a callback would corrupt unrelated state
        expect(runBoot()).toBe('not-a-callback');
        expect(replaceStateSpy).not.toHaveBeenCalled();
        expect(sessionActions.exchangeCodeForCloudflareSession).not.toHaveBeenCalled();
        // Then a pending flow from another tab's round trip must survive an unrelated boot
        expect(pendingAuthFlowStorage.consumePendingAuthFlow()).not.toBeNull();
    });

    it('is a no-op when QA auth is not configured', () => {
        // Given QA auth is not configured (no CLIENT_ID), even though the URL and a stored flow look like a real callback
        mockQAAuth.CLIENT_ID = '';
        arrangeCallbackURL('?code=auth-code-1&state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        // When the boot-time handler runs
        // Then it must treat the boot as not-a-callback: a build without QA auth configured could never have legitimately started a flow, so the code must not be exchanged
        expect(runBoot()).toBe('not-a-callback');
        expect(sessionActions.exchangeCodeForCloudflareSession).not.toHaveBeenCalled();
    });

    it('exchanges the code and restores the URL before the exchange resolves', () => {
        // Given a genuine callback: the state matches the flow this tab stored before leaving for the provider
        arrangeCallbackURL('?code=auth-code-1&state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        // When the handler picks up the code delivered as the document's own location
        expect(runBoot()).toBe('exchanging');
        // Then the URL is rewritten synchronously. Before React Navigation reads window.location, since no app route lives at the redirect path and the boot would otherwise land in /not-found
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/settings/troubleshoot');
        // Then the exchange runs with the stored verifier, the proof that this tab began the flow
        expect(sessionActions.exchangeCodeForCloudflareSession).toHaveBeenCalledWith({code: 'auth-code-1', codeVerifier: FLOW.codeVerifier});
    });

    it('reports a rejected exchange to the log', async () => {
        // Given a genuine callback whose token exchange the server will reject
        arrangeCallbackURL('?code=auth-code-1&state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);
        jest.mocked(sessionActions.exchangeCodeForCloudflareSession).mockReturnValue(Promise.reject(new Error('invalid_grant')));

        // When the handler starts the exchange
        expect(runBoot()).toBe('exchanging');
        // When the rejection lands. Its handler runs on a later microtask, so asserting synchronously would still read 'exchanging'
        await Promise.resolve();

        // Then the reason must reach the log: nothing else can ever observe the rejection
        expect(mockLogWarn).toHaveBeenCalledWith('Cloudflare code exchange failed', {errorMessage: 'invalid_grant'});
    });

    it('validates state first: a foreign callback is discarded wholesale, even with error and code present', () => {
        // Given a callback whose state fails provenance while dangling both a provider error and a code
        arrangeCallbackURL('?state=WRONG&error=access_denied&code=evil-code');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        // When the handler runs
        // Then state must be validated before anything else: a callback failing provenance is discarded wholesale with its other params untrusted, so the reported error is our mismatch rather than the attacker's
        expect(runBoot()).toBe('invalid-callback');
        expect(sessionActions.exchangeCodeForCloudflareSession).not.toHaveBeenCalled();
        expect(mockLogWarn).toHaveBeenCalledWith('Cloudflare sign-in callback did not complete', {outcome: 'invalid-callback', errorMessage: 'OAuth callback state mismatch'});
        // Then the boot is still rescued off the redirect path
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/settings/troubleshoot');
    });

    it('surfaces a provider refusal without exchanging', () => {
        // Given a provenance-valid callback carrying a provider error (the user refused consent) instead of a code
        arrangeCallbackURL('?state=state-1&error=access_denied&error_description=User+refused');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        // When the handler runs
        // Then the provider's own description is surfaced. The user said no, so there is nothing legitimate to redeem
        expect(runBoot()).toBe('provider-error');
        expect(sessionActions.exchangeCodeForCloudflareSession).not.toHaveBeenCalled();
        expect(mockLogWarn).toHaveBeenCalledWith('Cloudflare sign-in callback did not complete', {outcome: 'provider-error', errorMessage: 'User refused'});
    });

    it('rejects a callback with no authorization code', () => {
        // Given a provenance-valid callback carrying neither a code nor an error. A real provider response always includes one
        arrangeCallbackURL('?state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        // When the handler runs
        // Then with no code there is nothing to redeem, so calling the token endpoint could only fail or mislead
        expect(runBoot()).toBe('invalid-callback');
        expect(sessionActions.exchangeCodeForCloudflareSession).not.toHaveBeenCalled();
    });

    it('refuses a callback with no stored flow, and lands on a safe route', () => {
        // Given a replayed callback URL, or one opened in a tab that never started the flow, no stored flow exists to vouch for it
        arrangeCallbackURL('?code=auth-code-1&state=state-1');

        // When the handler runs
        // Then the callback is refused because nothing proves this tab initiated it, and with no stored returnURL the boot falls back to the root
        expect(runBoot()).toBe('no-pending-flow');
        expect(sessionActions.exchangeCodeForCloudflareSession).not.toHaveBeenCalled();
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
    });

    it('never navigates to a foreign origin, even though the returnURL is our own storage', () => {
        // Given a genuine callback whose stored flow carries a foreign-origin returnURL
        arrangeCallbackURL('?code=auth-code-1&state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow({...FLOW, returnURL: 'https://evil.example.com/steal'});

        // When the handler accepts the callback and starts the exchange
        expect(runBoot()).toBe('exchanging');
        // Then navigation falls back to the root: rewriting to another origin would hand out an open redirect, so a foreign returnURL is never followed
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
    });

    it('consumes the flow record even when the callback is rejected, so it can never be replayed', () => {
        // Given a stored flow and a callback that will be rejected for failing the state check
        arrangeCallbackURL('?state=WRONG&code=evil-code');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        // When the handler rejects the callback
        runBoot();
        // Then the flow record must be consumed anyway: leaving it behind would let the same verifier be replayed by a later, possibly forged, callback
        expect(pendingAuthFlowStorage.consumePendingAuthFlow()).toBeNull();
    });
});
