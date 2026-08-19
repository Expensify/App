/**
 * The boot-time callback handler: the gate table keeping a callback that fails provenance away from the
 * token exchange, plus the URL rewrite that keeps the boot off the redirect path.
 *
 * Requires the web implementation explicitly — jest resolves platform-split modules to their native variant.
 */
import type * as AuthRedirectCallbackModule from '@libs/CloudflareAccess/handleAuthRedirectCallback/index.ts';
import type * as PendingAuthFlowStorageModule from '@libs/CloudflareAccess/PendingAuthFlowStorage';

import type * as SessionActionsModule from '@userActions/CloudflareSession';

const mockQAAuth = {
    API_ROOT: 'https://qa.example.com/',
    TEAM_DOMAIN: 'team.cloudflareaccess.com',
    CLIENT_ID: 'client-123',
};

jest.mock('@src/CONFIG', () => ({__esModule: true, default: {QA_AUTH: mockQAAuth}}));

jest.mock('@userActions/CloudflareSession', () => ({
    __esModule: true,
    completeCloudflareAuthRedirect: jest.fn(() => Promise.resolve()),
}));

const RETURN_URL = 'http://localhost/settings/troubleshoot';
const FLOW = {state: 'state-1', codeVerifier: 'verifier-1', returnURL: RETURN_URL, createdAt: 1_700_000_000_000};

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
    window.sessionStorage.clear();
    realLocation = window.location;
    mockQAAuth.CLIENT_ID = 'client-123';
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(FLOW.createdAt);
    replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    pendingAuthFlowStorage = require<typeof PendingAuthFlowStorageModule>('@libs/CloudflareAccess/PendingAuthFlowStorage');
    sessionActions = require<typeof SessionActionsModule>('@userActions/CloudflareSession');
    authRedirectCallback = require<typeof AuthRedirectCallbackModule>('@libs/CloudflareAccess/handleAuthRedirectCallback/index.ts');
});

afterEach(() => {
    replaceStateSpy.mockRestore();
    nowSpy.mockRestore();
    Object.defineProperty(window, 'location', {value: realLocation, writable: true, configurable: true});
});

describe('handleCloudflareAuthRedirectCallback', () => {
    it('is a no-op off the callback path — every normal boot runs this', () => {
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);
        Object.defineProperty(window, 'location', {
            value: {origin: 'http://localhost', href: RETURN_URL, pathname: '/settings/troubleshoot'},
            writable: true,
            configurable: true,
        });

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('not-a-callback');
        expect(replaceStateSpy).not.toHaveBeenCalled();
        expect(sessionActions.completeCloudflareAuthRedirect).not.toHaveBeenCalled();
        // A pending flow from another tab's round trip must survive an unrelated boot
        expect(pendingAuthFlowStorage.consumePendingAuthFlow()).not.toBeNull();
    });

    it('is a no-op when QA auth is not configured', () => {
        mockQAAuth.CLIENT_ID = '';
        arrangeCallbackURL('?code=auth-code-1&state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('not-a-callback');
        expect(sessionActions.completeCloudflareAuthRedirect).not.toHaveBeenCalled();
    });

    it('exchanges the code and restores the URL before the exchange resolves', () => {
        arrangeCallbackURL('?code=auth-code-1&state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('exchanging');
        // Synchronous, and before React Navigation reads window.location
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/settings/troubleshoot');
        expect(sessionActions.completeCloudflareAuthRedirect).toHaveBeenCalledWith({code: 'auth-code-1', codeVerifier: FLOW.codeVerifier});
    });

    it('records a rejected exchange as the observable exchange-failed outcome', async () => {
        arrangeCallbackURL('?code=auth-code-1&state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);
        jest.mocked(sessionActions.completeCloudflareAuthRedirect).mockReturnValue(Promise.reject(new Error('invalid_grant')));

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('exchanging');
        // The rejection handler runs on a later microtask — asserting synchronously would still read 'exchanging'
        await Promise.resolve();

        expect(authRedirectCallback.getCloudflareAuthRedirectOutcome()).toEqual({outcome: 'exchange-failed', errorMessage: 'invalid_grant'});
    });

    it('validates state first: a foreign callback is discarded wholesale, even with error and code present', () => {
        arrangeCallbackURL('?state=WRONG&error=access_denied&code=evil-code');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('invalid-callback');
        expect(sessionActions.completeCloudflareAuthRedirect).not.toHaveBeenCalled();
        expect(authRedirectCallback.getCloudflareAuthRedirectOutcome().errorMessage).toBe('OAuth callback state mismatch');
        // Still rescued off the redirect path, which has no app route
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/settings/troubleshoot');
    });

    it('surfaces a provider refusal without exchanging', () => {
        arrangeCallbackURL('?state=state-1&error=access_denied&error_description=User+refused');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('provider-error');
        expect(sessionActions.completeCloudflareAuthRedirect).not.toHaveBeenCalled();
        expect(authRedirectCallback.getCloudflareAuthRedirectOutcome().errorMessage).toBe('User refused');
    });

    it('rejects a callback with no authorization code', () => {
        arrangeCallbackURL('?state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('invalid-callback');
        expect(sessionActions.completeCloudflareAuthRedirect).not.toHaveBeenCalled();
    });

    it('refuses a callback with no stored flow, and lands on a safe route', () => {
        // A replayed callback URL, or one opened in a tab that never started the flow
        arrangeCallbackURL('?code=auth-code-1&state=state-1');

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('no-pending-flow');
        expect(sessionActions.completeCloudflareAuthRedirect).not.toHaveBeenCalled();
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
    });

    it('never navigates to a foreign origin, even though the returnURL is our own storage', () => {
        arrangeCallbackURL('?code=auth-code-1&state=state-1');
        pendingAuthFlowStorage.savePendingAuthFlow({...FLOW, returnURL: 'https://evil.example.com/steal'});

        expect(authRedirectCallback.handleCloudflareAuthRedirectCallback()).toBe('exchanging');
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
    });

    it('consumes the flow record even when the callback is rejected, so it can never be replayed', () => {
        arrangeCallbackURL('?state=WRONG&code=evil-code');
        pendingAuthFlowStorage.savePendingAuthFlow(FLOW);

        authRedirectCallback.handleCloudflareAuthRedirectCallback();
        expect(pendingAuthFlowStorage.consumePendingAuthFlow()).toBeNull();
    });
});
