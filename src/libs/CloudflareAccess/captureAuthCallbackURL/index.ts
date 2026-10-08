/**
 * Cloudflare delivers the authorization code as this document's own location, and no app route lives at
 * the redirect path, so the URL has to be rewritten before anything can resolve a route from it.
 */
import {getOAuthRedirectURI, isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import {OAuthError} from '@libs/CloudflareAccess/OAuthClient';
import {consumePendingAuthFlow, sweepExpiredPendingAuthFlows} from '@libs/CloudflareAccess/PendingAuthFlowStorage';

import type {CapturedAuthCallback, CaptureCloudflareAuthCallbackURL, GetCapturedCloudflareAuthCallback} from './types';

let captured: CapturedAuthCallback = {outcome: 'not-a-callback'};

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

function runCapture(): CapturedAuthCallback {
    if (!isQAAuthConfigured()) {
        return {outcome: 'not-a-callback'};
    }

    sweepExpiredPendingAuthFlows();

    let callbackPath: string;
    try {
        callbackPath = new URL(getOAuthRedirectURI()).pathname;
    } catch {
        return {outcome: 'not-a-callback'};
    }

    if (window.location.pathname !== callbackPath) {
        return {outcome: 'not-a-callback'};
    }

    const params = new URL(window.location.href).searchParams;
    const state = params.get('state');
    const flow = state ? consumePendingAuthFlow(state) : null;

    window.history.replaceState(null, '', toSafeReturnPath(flow?.returnURL));

    if (!flow) {
        return {outcome: 'no-pending-flow', errorMessage: 'No pending QA auth flow matches this callback. Start the sign-in again'};
    }

    const oauthError = params.get('error');
    if (oauthError) {
        return {outcome: 'provider-error', errorMessage: new OAuthError(oauthError, params.get('error_description') ?? undefined).message};
    }

    const code = params.get('code');
    if (!code) {
        return {outcome: 'invalid-callback', errorMessage: 'OAuth callback is missing the authorization code'};
    }

    return {outcome: 'code-captured', exchange: {code, codeVerifier: flow.codeVerifier}};
}

const captureCloudflareAuthCallbackURL: CaptureCloudflareAuthCallbackURL = () => {
    captured = runCapture();
};

const getCapturedCloudflareAuthCallback: GetCapturedCloudflareAuthCallback = () => captured;

export {captureCloudflareAuthCallbackURL, getCapturedCloudflareAuthCallback};
