/**
 * Test-tool probe: drives the session decision tree and fires one authenticated request at the QA origin.
 * Nothing in the app routes to QA yet, so this is the only way to exercise the whole flow end to end.
 */
import fetchWithQAAuth, {CF_REAUTH_REQUIRED} from '@libs/CloudflareAccess/fetchWithQAAuth';
import {isRecord} from '@libs/ObjectUtils';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

import {
    redirectToCloudflareSignIn,
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
};

/**
 * Never rejects. Every failure comes back as a semantic result, so the UI consumes it with `.then` only.
 * With no session (or on a consented re-auth, see the options) it navigates the tab away and never settles.
 */
async function runCloudflareAuthProbe({shouldRedirectOnReauthRequired = false}: CloudflareAuthProbeOptions = {}): Promise<CloudflareAuthProbeResult> {
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
            // Never settles. Nothing below runs
            await redirectToCloudflareSignIn();
        } else if (isSessionNearExpiry(session)) {
            const refreshResult = await refreshCloudflareSession();
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
        if (error instanceof Error && error.message === CF_REAUTH_REQUIRED) {
            if (shouldRedirectOnReauthRequired) {
                try {
                    await redirectToCloudflareSignIn();
                } catch (redirectError) {
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
