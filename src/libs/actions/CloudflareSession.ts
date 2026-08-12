/**
 * Owns the Cloudflare Access OAuth session for the QA server: Onyx-backed cache, the same-tab redirect
 * flow, and the single-flight refresh. Web-only until native claims Universal/App Links.
 */
import {isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import {generatePKCEPair, generateState} from '@libs/CloudflareAccess/generatePKCE';
import {buildAuthorizeURL, exchangeCode, OAuthError, refreshTokens} from '@libs/CloudflareAccess/OAuthClient';
import {clearPendingAuthFlow, savePendingAuthFlow} from '@libs/CloudflareAccess/PendingAuthFlowStorage';
import {registerSessionCleanupCallback} from '@libs/SessionCleanup';

import ONYXKEYS from '@src/ONYXKEYS';
import type CloudflareSession from '@src/types/onyx/CloudflareSession';

import Onyx from 'react-native-onyx';

/** Refresh proactively when the access token has less lifetime left than this */
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60_000;

/** `undefined` = Onyx not read yet, `null` = read and absent — NetworkStore's hydration convention */
let sessionCache: CloudflareSession | null | undefined;

// Definite assignment: the Promise executor runs synchronously, so this is set before anything reads it
let resolveHydration!: () => void;
const hydrationPromise = new Promise<void>((resolve) => {
    resolveHydration = resolve;
});

// Gated: this module loads on every app start, so an unconfigured build must not pay for a subscription
// and a sign-out callback it can never use
if (isQAAuthConfigured()) {
    // We have used `connectWithoutView` here because this module-level cache is not connected to any UI component
    Onyx.connectWithoutView({
        key: ONYXKEYS.CF_SESSION,
        callback: (value) => {
            sessionCache = value ?? null;
            resolveHydration();
        },
    });

    // Onyx.clear wipes the key but its callback is async, so drop the cache synchronously. Cache only:
    // clearing the in-flight refs below wouldn't cancel the work, it would just let a second flight overlap.
    registerSessionCleanupCallback(() => {
        sessionCache = null;
        clearPendingAuthFlow();
    });
} else {
    // Nothing will ever hydrate the cache, so a waiter must not block forever
    sessionCache = null;
    resolveHydration();
}

function getCloudflareSession(): CloudflareSession | null | undefined {
    return sessionCache;
}

function waitForCloudflareSessionHydration(): Promise<void> {
    return hydrationPromise;
}

function isSessionNearExpiry(session: CloudflareSession): boolean {
    return session.expiresAt - Date.now() < ACCESS_TOKEN_EXPIRY_BUFFER_MS;
}

let isRedirectInFlight = false;

/**
 * Navigates this tab to Cloudflare to start the authorize round trip. Never settles once the navigation is
 * requested — the page is leaving, so callers must run nothing after it. Rejects only if the flow couldn't
 * be stored, since navigating away without the verifier would strand the exchange.
 */
async function beginCloudflareAuthRedirect(returnURL: string = window.location.href): Promise<never> {
    if (isRedirectInFlight) {
        // A second press while the first navigation is settling must not overwrite the stored flow
        return new Promise<never>(() => {});
    }
    isRedirectInFlight = true;
    try {
        const pkce = await generatePKCEPair();
        const state = generateState();
        // Must be stored before the navigation — module memory does not survive the unload
        savePendingAuthFlow({state, codeVerifier: pkce.codeVerifier, returnURL, createdAt: Date.now()});
        window.location.assign(buildAuthorizeURL({state, codeChallenge: pkce.codeChallenge}));
    } catch (error) {
        isRedirectInFlight = false;
        throw error;
    }
    return new Promise<never>(() => {});
}

/** Single-flight: a caller joining mid-exchange must not burn the single-use authorization code twice */
let redirectCompletionPromise: Promise<void> | null = null;

function completeCloudflareAuthRedirect({code, codeVerifier}: {code: string; codeVerifier: string}): Promise<void> {
    redirectCompletionPromise ??= exchangeCode({code, codeVerifier})
        .then((session) => {
            // Cache first: a request fired during this boot must see the token before disk I/O settles. If
            // Onyx.set rejects, the cache keeps the (real, usable) session and a reload self-heals.
            sessionCache = session;
            return Onyx.set(ONYXKEYS.CF_SESSION, session);
        })
        .finally(() => {
            redirectCompletionPromise = null;
        });
    return redirectCompletionPromise;
}

/** Non-null only mid-exchange, so callers join it instead of starting a second redirect */
function getPendingCloudflareAuthCompletion(): Promise<void> | null {
    return redirectCompletionPromise;
}

type CloudflareRefreshResult = 'refreshed' | 'skipped-newer-token' | 'reauth-required';

let refreshPromise: Promise<CloudflareRefreshResult> | null = null;

/**
 * Single-flight refresh; the rotated pair is persisted before it resolves. Resolves `'reauth-required'` only
 * for terminal failures (session already cleared) — transient ones reject and keep the session alive. Pass
 * the token a 401 was seen with to get `'skipped-newer-token'` when rotation already happened.
 */
function refreshCloudflareSession(staleAccessToken?: string): Promise<CloudflareRefreshResult> {
    // Join before the staleness shortcut: resolution guarantees the rotated pair already hit Onyx
    if (refreshPromise) {
        return refreshPromise;
    }
    const current = sessionCache;
    if (!current?.refreshToken) {
        return Promise.resolve('reauth-required');
    }
    // Rotation already completed while this caller's request was in flight — retry with the new token
    if (staleAccessToken && current.accessToken !== staleAccessToken) {
        return Promise.resolve('skipped-newer-token');
    }
    refreshPromise = refreshTokens(current.refreshToken)
        .then((session) => {
            sessionCache = session;
            return Onyx.set(ONYXKEYS.CF_SESSION, session).then((): CloudflareRefreshResult => 'refreshed');
        })
        .catch((error): Promise<CloudflareRefreshResult> => {
            if (error instanceof OAuthError && (error.code === 'invalid_grant' || error.code === 'invalid_response')) {
                // Both mean the stored refresh token is spent (invalid_response = a 2xx arrived, so CF rotated
                // even though the new pair was unreadable). Keeping it would trap every future attempt in the
                // refresh branch instead of reaching the no-session redirect.
                return clearCloudflareSession().then(() => 'reauth-required');
            }
            throw error;
        })
        .finally(() => {
            refreshPromise = null;
        });
    return refreshPromise;
}

function clearCloudflareSession(): Promise<void> {
    sessionCache = null; // synchronous — a probe pressed right after Clear must not read the dead session
    return Onyx.set(ONYXKEYS.CF_SESSION, null);
}

/**
 * Drops a session that still got 401 after a refresh, so the next attempt starts a fresh authorize round
 * trip. Guarded on the rejected token so a concurrently established session isn't collateral damage.
 */
function markCloudflareSessionRejected(rejectedAccessToken: string): Promise<void> {
    if (sessionCache?.accessToken !== rejectedAccessToken) {
        return Promise.resolve();
    }
    return clearCloudflareSession();
}

export {
    beginCloudflareAuthRedirect,
    clearCloudflareSession,
    completeCloudflareAuthRedirect,
    getCloudflareSession,
    getPendingCloudflareAuthCompletion,
    isSessionNearExpiry,
    markCloudflareSessionRejected,
    refreshCloudflareSession,
    waitForCloudflareSessionHydration,
};
export type {CloudflareRefreshResult};
