/**
 * Test-tool probe: drives the session decision tree and fires one authenticated request at the QA origin.
 * Nothing in the app routes to QA yet, so this is the only way to exercise the whole flow end to end.
 */
import fetchWithQAAuth, {CF_REAUTH_REQUIRED} from '@libs/CloudflareAccess/fetchWithQAAuth';
import {isRecord} from '@libs/ObjectUtils';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

import {
    CF_SIGN_IN_ABANDONED,
    redirectToCloudflareSignIn,
    getCloudflareCodeExchangeError,
    getCloudflareSession,
    getPendingCloudflareCodeExchange,
    isSessionNearExpiry,
    refreshCloudflareSession,
    waitForCloudflareSessionHydration,
} from './CloudflareSession';

type CloudflareAuthProbeStatus = 'success' | 'reauthRequired' | 'signInFailed' | 'error';

type CloudflareAuthProbeResult = {
    /** Semantic outcome. The UI translates these */
    status: CloudflareAuthProbeStatus;

    /** Raw diagnostic (server echo / error text), deliberately untranslated */
    detail?: string;
};

type CloudflareAuthProbeOptions = {
    /** A press made after seeing reauthRequired. It consents to navigation, so a terminal refresh failure redirects instead of reporting again */
    shouldRedirectOnReauthRequired?: boolean;

    /** A press made after seeing signInFailed. It consents to a fresh round trip */
    shouldRedirectOnSignInFailed?: boolean;
};

function isSignInAbandoned(error: unknown): boolean {
    return error instanceof Error && error.message === CF_SIGN_IN_ABANDONED;
}

/**
 * Never rejects. Every failure comes back as a semantic result, so the UI consumes it with `.then` only.
 * With no session (or on a consented re-auth, see the options) it may navigate the tab away.
 * If Back restores the page, it resolves null: no round trip happened.
 */
async function runCloudflareAuthProbe({
    shouldRedirectOnReauthRequired = false,
    shouldRedirectOnSignInFailed = false,
}: CloudflareAuthProbeOptions = {}): Promise<CloudflareAuthProbeResult | null> {
    if (!CONFIG.QA_AUTH.CHECK_PATH) {
        return {status: 'error', detail: 'QA_AUTH_CHECK_PATH is not set'};
    }

    try {
        await waitForCloudflareSessionHydration();
        // A callback boot may still be exchanging the code. Join it instead of starting a second round trip
        const pendingCompletion = getPendingCloudflareCodeExchange();
        if (pendingCompletion) {
            try {
                await pendingCompletion;
            } catch (error) {
                return {status: 'signInFailed', detail: error instanceof Error ? error.message : undefined};
            }
        }

        const session = getCloudflareSession();
        if (!session) {
            const exchangeError = getCloudflareCodeExchangeError();
            if (exchangeError !== undefined && !shouldRedirectOnSignInFailed) {
                return {status: 'signInFailed', detail: exchangeError};
            }
            await redirectToCloudflareSignIn();
        } else if (isSessionNearExpiry(session)) {
            const refreshResult = await refreshCloudflareSession(session.accessToken);
            if (refreshResult === 'reauth-required') {
                if (shouldRedirectOnReauthRequired) {
                    await redirectToCloudflareSignIn();
                }
                return {status: 'reauthRequired'};
            }
        }

        const response = await fetchWithQAAuth(`${CONFIG.QA_AUTH.API_ROOT}${CONFIG.QA_AUTH.CHECK_PATH}`, {method: CONST.NETWORK.METHOD.POST});
        if (!response.ok) {
            return {status: 'error', detail: `HTTP ${response.status}`};
        }
        // Diagnostic echo of how the request authenticated. Read loosely
        const body: unknown = await response.json().catch(() => null);
        const authenticatedVia = isRecord(body) && typeof body.authenticatedVia === 'string' ? body.authenticatedVia : null;
        return {status: 'success', detail: `authenticatedVia: ${authenticatedVia ?? 'null'}`};
    } catch (error) {
        if (isSignInAbandoned(error)) {
            return null;
        }
        if (error instanceof Error && error.message === CF_REAUTH_REQUIRED) {
            if (shouldRedirectOnReauthRequired) {
                try {
                    await redirectToCloudflareSignIn();
                } catch (redirectError) {
                    if (isSignInAbandoned(redirectError)) {
                        return null;
                    }
                    return {status: 'error', detail: redirectError instanceof Error ? redirectError.message : undefined};
                }
            }
            return {status: 'reauthRequired'};
        }
        return {status: 'error', detail: error instanceof Error ? error.message : undefined};
    }
}

export {runCloudflareAuthProbe};
export type {CloudflareAuthProbeResult, CloudflareAuthProbeStatus};
