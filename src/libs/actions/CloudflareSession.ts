/**
 * Owns the Cloudflare Access OAuth session for the QA server: Onyx-backed cache, the same-tab redirect
 * flow, and the single-flight refresh. Web-only until native claims Universal/App Links.
 */
import {isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import {generatePKCEPair, generateState} from '@libs/CloudflareAccess/generatePKCE';
import {buildAuthorizeURL, exchangeCode, OAuthError, refreshTokens} from '@libs/CloudflareAccess/OAuthClient';
import {clearPendingAuthFlow, savePendingAuthFlow} from '@libs/CloudflareAccess/PendingAuthFlowStorage';
import Log from '@libs/Log';
import {registerSessionCleanupCallback} from '@libs/SessionCleanup';

import ONYXKEYS from '@src/ONYXKEYS';
import type CloudflareSession from '@src/types/onyx/CloudflareSession';

import Onyx from 'react-native-onyx';

/** Refresh proactively when the access token has less lifetime left than this */
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60_000;

/** `undefined` = Onyx not read yet, `null` = read and absent — NetworkStore's hydration convention */
let sessionCache: CloudflareSession | null | undefined;

/**
 * Bumped by sign-out. The async flows below cannot be cancelled, so each captures this at the start and
 * re-checks it after awaits — a mismatch makes the late result inert.
 */
let sessionGeneration = 0;

// Definite assignment: the Promise executor runs synchronously, so this is set before anything reads it
let resolveHydration!: () => void;
const hydrationPromise = new Promise<void>((resolve) => {
    resolveHydration = resolve;
});

// This module loads on every app start — an unconfigured build must not pay for the subscription
if (isQAAuthConfigured()) {
    // We have used `connectWithoutView` here because this module-level cache is not connected to any UI component
    Onyx.connectWithoutView({
        key: ONYXKEYS.CF_SESSION,
        callback: (value) => {
            sessionCache = value ?? null;
            resolveHydration();
        },
    });

    // Onyx.clear wipes the key but its callback is async, so drop the cache synchronously. Clearing the
    // in-flight refs wouldn't cancel their work — the generation bump is what makes late results inert.
    registerSessionCleanupCallback(() => {
        sessionGeneration++;
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
 * Navigates this tab to Cloudflare to start the authorize round trip. Never settles once navigation is
 * requested — the page is leaving. Rejects only if the flow record couldn't be stored.
 */
async function beginCloudflareAuthRedirect(returnURL: string = window.location.href): Promise<never> {
    if (isRedirectInFlight) {
        // A second press while the first navigation is settling must not overwrite the stored flow
        return new Promise<never>(() => {});
    }
    isRedirectInFlight = true;
    const generation = sessionGeneration;
    try {
        const pkce = await generatePKCEPair();
        const state = generateState();
        if (generation !== sessionGeneration) {
            // Signed out while the key material was generated — do not navigate a signed-out tab
            throw new Error('Cloudflare auth flow was cancelled by sign-out');
        }
        // Must be stored before the navigation — module memory does not survive the unload
        savePendingAuthFlow({state, codeVerifier: pkce.codeVerifier, returnURL, createdAt: Date.now()});
        window.location.assign(buildAuthorizeURL({state, codeChallenge: pkce.codeChallenge}));
    } catch (error) {
        isRedirectInFlight = false;
        throw error;
    }
    return new Promise<never>(() => {});
}

let redirectCompletionPromise: Promise<void> | null = null;

function completeCloudflareAuthRedirect({code, codeVerifier}: {code: string; codeVerifier: string}): Promise<void> {
    const generation = sessionGeneration;
    // Single-flight: a caller joining mid-exchange must not burn the single-use authorization code twice
    redirectCompletionPromise ??= exchangeCode({code, codeVerifier})
        .then((session) => {
            if (generation !== sessionGeneration) {
                // Signed out mid-exchange: these tokens were minted for the session that was just torn down
                return;
            }
            // Cache first: a request fired during this boot must see the token before disk I/O settles. A
            // failed persist is logged, not surfaced — the cache keeps the usable session, a reload self-heals.
            sessionCache = session;
            return Onyx.set(ONYXKEYS.CF_SESSION, session).catch((error: unknown) => {
                Log.warn('[CloudflareSession] Failed to persist the exchanged session', {error});
            });
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
 * Cloudflare rotates the refresh token on every call, so two tabs refreshing at once each spend a token the
 * other still needs. Web Locks serialize the read-refresh-persist across the origin's tabs; where the API
 * is missing, the in-context single-flight and the guards in performCloudflareRefresh are what remain.
 */
function withCrossTabRefreshLock(callback: () => Promise<CloudflareRefreshResult>): Promise<CloudflareRefreshResult> {
    if (!navigator.locks) {
        return callback();
    }
    // The name is origin-scoped, so it serializes across every tab of this app
    return navigator.locks.request('cloudflareSessionRefresh', callback);
}

/**
 * Runs with the cross-tab lock held, so everything it read before queueing may have changed: the session is
 * re-read here rather than captured by the caller.
 */
async function performCloudflareRefresh(staleAccessToken: string | undefined): Promise<CloudflareRefreshResult> {
    // Captured with the lock held, so the checks below only have to detect a sign-out landing mid round trip
    const generation = sessionGeneration;
    const current = sessionCache;
    if (!current?.refreshToken) {
        // Signed out, or another tab's rotation already left this tab without a usable session
        return 'reauth-required';
    }
    // Rotation already completed — here or in another tab — while this caller's request was in flight
    if (staleAccessToken && current.accessToken !== staleAccessToken) {
        return 'skipped-newer-token';
    }

    const submittedRefreshToken = current.refreshToken;
    try {
        const session = await refreshTokens(submittedRefreshToken);
        if (generation !== sessionGeneration) {
            // Signed out mid-refresh: persisting the rotated pair would resurrect the dead session
            return 'reauth-required';
        }
        sessionCache = session;
        await Onyx.set(ONYXKEYS.CF_SESSION, session);
        return 'refreshed';
    } catch (error) {
        // A failed persist is not a spent token, so it falls through here and rethrows
        if (!(error instanceof OAuthError) || (error.code !== 'invalid_grant' && error.code !== 'invalid_response')) {
            throw error;
        }
        if (generation !== sessionGeneration) {
            // Signed out during the round trip — terminal rather than skipped, so the caller stops retrying
            return 'reauth-required';
        }
        if (sessionCache?.refreshToken !== submittedRefreshToken) {
            // Another tab already rotated the token this call submitted — the caller retries with the newer one
            return 'skipped-newer-token';
        }
        // Both codes mean the submitted token is spent (invalid_response = CF rotated but the new pair was
        // unreadable). Never delete the shared session here — another tab may hold a working rotation.
        return 'reauth-required';
    }
}

/**
 * Single-flight refresh, serialized across tabs; the rotated pair is persisted before it resolves. Terminal
 * failures resolve 'reauth-required' (recovery is a fresh authorize round trip), transient ones reject with
 * the session intact. Pass the token a 401 was seen with to get 'skipped-newer-token' after a rotation.
 */
function refreshCloudflareSession(staleAccessToken?: string): Promise<CloudflareRefreshResult> {
    // Joining guarantees the rotated pair already hit Onyx; preconditions are re-checked inside the lock
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = withCrossTabRefreshLock(() => performCloudflareRefresh(staleAccessToken)).finally(() => {
        refreshPromise = null;
    });
    return refreshPromise;
}

/** Deletes the session for every tab. Only the test tool's Clear-session button calls this — failure paths recover by replacement */
function clearCloudflareSession(): Promise<void> {
    sessionCache = null; // synchronous — a probe pressed right after Clear must not read the dead session
    return Onyx.set(ONYXKEYS.CF_SESSION, null);
}

export {
    beginCloudflareAuthRedirect,
    clearCloudflareSession,
    completeCloudflareAuthRedirect,
    getCloudflareSession,
    getPendingCloudflareAuthCompletion,
    isSessionNearExpiry,
    refreshCloudflareSession,
    waitForCloudflareSessionHydration,
};
export type {CloudflareRefreshResult};
