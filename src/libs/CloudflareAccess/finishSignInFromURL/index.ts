/**
 * Callback-boot half of the same-tab OAuth redirect: Cloudflare delivers the authorization code as this
 * document's own location, so it is picked up during boot, before any render, and the URL is rewritten
 * back to where the user came from (no app route lives at the redirect path).
 */
import {getOAuthRedirectURI, isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import {OAuthError} from '@libs/CloudflareAccess/OAuthClient';
import {consumePendingAuthFlow} from '@libs/CloudflareAccess/PendingAuthFlowStorage';

import {exchangeCodeForCloudflareSession} from '@userActions/CloudflareSession';

import type {CloudflareSignInOutcome, FinishCloudflareSignInFromURL, GetCloudflareSignInOutcome} from './types';

let lastOutcome: CloudflareSignInOutcome = 'not-a-callback';
let lastErrorMessage: string | undefined;

/** Same-origin only: this is the one stored field fed back into navigation, so it is treated as tainted */
function toSafeReturnPath(returnURL: string | undefined): string {
    if (!returnURL) {
        return '/';
    }
    try {
        const parsed = new URL(returnURL, window.location.origin);
        if (parsed.origin !== window.location.origin) {
            return '/';
        }
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return '/';
    }
}

const finishCloudflareSignInFromURL: FinishCloudflareSignInFromURL = () => {
    lastErrorMessage = undefined;

    if (!isQAAuthConfigured()) {
        lastOutcome = 'not-a-callback';
        return lastOutcome;
    }

    let callbackPath: string;
    try {
        callbackPath = new URL(getOAuthRedirectURI()).pathname;
    } catch {
        lastOutcome = 'not-a-callback';
        return lastOutcome;
    }

    if (window.location.pathname !== callbackPath) {
        lastOutcome = 'not-a-callback';
        return lastOutcome;
    }

    // Params read before the rewrite, flow consumed before any validation: the record is single-use, so a
    // replayed callback finds nothing however this call ends.
    const params = new URL(window.location.href).searchParams;
    const flow = consumePendingAuthFlow();

    // Unconditional: even an invalid callback must leave the user on a real route
    window.history.replaceState(null, '', toSafeReturnPath(flow?.returnURL));

    if (!flow) {
        lastOutcome = 'no-pending-flow';
        lastErrorMessage = 'No pending QA auth flow in this tab — start the sign-in again';
        return lastOutcome;
    }

    // State first: a callback that fails provenance is discarded wholesale, its other params untrusted
    if (params.get('state') !== flow.state) {
        lastOutcome = 'invalid-callback';
        lastErrorMessage = 'OAuth callback state mismatch';
        return lastOutcome;
    }

    const oauthError = params.get('error');
    if (oauthError) {
        // e.g. access_denied, never attempt the exchange
        lastOutcome = 'provider-error';
        lastErrorMessage = new OAuthError(oauthError, params.get('error_description') ?? undefined).message;
        return lastOutcome;
    }

    const code = params.get('code');
    if (!code) {
        lastOutcome = 'invalid-callback';
        lastErrorMessage = 'OAuth callback is missing the authorization code';
        return lastOutcome;
    }

    // Fire and forget. The catch records the failure as the observable outcome, since the completion promise
    // clears as it settles. It runs a microtask later, so it always lands after the synchronous 'exchanging'.
    exchangeCodeForCloudflareSession({code, codeVerifier: flow.codeVerifier}).catch((error: unknown) => {
        lastOutcome = 'exchange-failed';
        lastErrorMessage = error instanceof Error ? error.message : String(error);
    });

    lastOutcome = 'exchanging';
    return lastOutcome;
};

const getCloudflareSignInOutcome: GetCloudflareSignInOutcome = () => ({outcome: lastOutcome, errorMessage: lastErrorMessage});

export {finishCloudflareSignInFromURL, getCloudflareSignInOutcome};
