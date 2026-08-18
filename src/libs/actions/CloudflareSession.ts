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

/**
 * Bumped by sign-out. None of the async work below can be cancelled — a PKCE generation, a code exchange and
 * a token refresh all run to completion — so the generation they captured at the start is what makes their
 * late results inert instead of navigating a signed-out tab or writing the old account's session back.
 */
let sessionGeneration = 0;

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

    // Onyx.clear wipes the key but its callback is async, so drop the cache synchronously. The in-flight refs
    // below are deliberately left alone — clearing them wouldn't cancel the work, it would just let a second
    // flight overlap; the generation bump is what neutralises whatever is still running.
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
    const generation = sessionGeneration;
    try {
        const pkce = await generatePKCEPair();
        const state = generateState();
        if (generation !== sessionGeneration) {
            // Signed out while the key material was being generated: navigating now would take the tab
            // through Cloudflare and back onto a returnURL belonging to an account that is already gone
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
 * `refreshPromise` only deduplicates this JS context, but the session is shared across tabs through Onyx and
 * Cloudflare rotates the refresh token on every call — so two tabs refreshing at once each spend a token the
 * other still needs, and the loser's `invalid_grant` would clear the winner's freshly persisted session.
 *
 * Web Locks serialise the read-refresh-persist across the tabs of this origin, which also leaves the second
 * tab a full network round trip for Onyx's (event-driven, hence async) cross-tab update to reach its cache
 * before it re-reads it. Where the API is missing the in-context single-flight and the guards in
 * `performCloudflareRefresh` are what remain.
 */
function withCrossTabRefreshLock(callback: () => Promise<CloudflareRefreshResult>): Promise<CloudflareRefreshResult> {
    if (!navigator.locks) {
        return callback();
    }
    // The name is origin-scoped, so it serialises across every tab of this app
    return navigator.locks.request('cloudflareSessionRefresh', callback);
}

/**
 * Runs with the cross-tab lock held, so everything it read before queueing may have changed: the session is
 * re-read here rather than captured by the caller.
 */
async function performCloudflareRefresh(staleAccessToken: string | undefined): Promise<CloudflareRefreshResult> {
    // Captured with the lock held: a sign-out that landed while this call queued has already nulled the cache,
    // so the checks below only have to detect one that lands during the round trip
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
            // Sign-out already dropped the session; there is nothing left to clear
            return 'reauth-required';
        }
        if (sessionCache?.refreshToken !== submittedRefreshToken) {
            // The token we submitted is no longer the stored one, so another tab rotated it and this failure
            // is about a token that is already spent. Clearing here would destroy that tab's session; the
            // caller retries with the newer one instead.
            return 'skipped-newer-token';
        }
        // Both codes mean the token we submitted is spent (invalid_response = a 2xx arrived, so CF rotated
        // even though the new pair was unreadable). Keeping it would trap every future attempt in the
        // refresh branch instead of reaching the no-session redirect.
        await clearCloudflareSession();
        return 'reauth-required';
    }
}

/**
 * Single-flight refresh, serialised across tabs; the rotated pair is persisted before it resolves. Resolves
 * `'reauth-required'` only for terminal failures (session already cleared) — transient ones reject and keep
 * the session alive. Pass the token a 401 was seen with to get `'skipped-newer-token'` when rotation already
 * happened, in this tab or another one.
 */
function refreshCloudflareSession(staleAccessToken?: string): Promise<CloudflareRefreshResult> {
    // Join before anything else: resolution guarantees the rotated pair already hit Onyx. Every other
    // precondition is checked inside the lock, where the session has been re-read.
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = withCrossTabRefreshLock(() => performCloudflareRefresh(staleAccessToken)).finally(() => {
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
