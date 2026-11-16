/**
 * Parks the in-flight authorize round trip across the page unload: navigating to Cloudflare destroys module
 * memory, so the verifier, state and return URL survive here. Kept in localStorage because Chrome has handed
 * a callback page an earlier page's sessionStorage copy.
 */
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

/** Cloudflare's authorization codes are short-lived anyway. An older record is treated as absent */
const PENDING_AUTH_FLOW_TTL_MS = 10 * 60 * 1000;

type PendingAuthFlow = {
    /** CSRF/provenance value echoed back by Cloudflare on the callback */
    state: string;

    /** The PKCE secret, revealed only at the token exchange */
    codeVerifier: string;

    /** Absolute URL (route plus any open RHP) the user should land back on */
    returnURL: string;

    /** Epoch ms. See PENDING_AUTH_FLOW_TTL_MS */
    createdAt: number;
};

/** Storage access itself throws in hardened browser configurations, not just the write */
function getLocalStorage(): Storage | null {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        return window.localStorage ?? null;
    } catch {
        return null;
    }
}

function getStorageKey(state: string): string {
    return `${CONST.LOCAL_STORAGE_KEYS.QA_AUTH_REDIRECT_FLOW_PREFIX}${state}`;
}

function parseUnexpiredFlow(raw: string | null): PendingAuthFlow | null {
    if (!raw) {
        return null;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }

    if (
        !isRecord(parsed) ||
        typeof parsed.state !== 'string' ||
        typeof parsed.codeVerifier !== 'string' ||
        parsed.codeVerifier === '' ||
        typeof parsed.returnURL !== 'string' ||
        typeof parsed.createdAt !== 'number'
    ) {
        return null;
    }

    if (Date.now() - parsed.createdAt > PENDING_AUTH_FLOW_TTL_MS) {
        return null;
    }

    return {state: parsed.state, codeVerifier: parsed.codeVerifier, returnURL: parsed.returnURL, createdAt: parsed.createdAt};
}

/**
 * Throws when web storage is unavailable. The caller must refuse to redirect in that case rather than
 * navigate away and lose the verifier with no way to finish the exchange.
 */
function savePendingAuthFlow(flow: PendingAuthFlow): void {
    const storage = getLocalStorage();
    if (!storage) {
        throw new Error('Local storage is unavailable, cannot start the QA auth redirect');
    }
    storage.setItem(getStorageKey(flow.state), JSON.stringify(flow));
}

/**
 * Single-use: removes the record before returning it, so a replayed callback URL finds nothing.
 * Returns null when absent, unreadable, malformed or expired.
 */
function consumePendingAuthFlow(state: string): PendingAuthFlow | null {
    const storage = getLocalStorage();
    if (!storage) {
        return null;
    }

    // A hardened configuration can hand back a Storage whose methods throw SecurityError, and this runs
    // during boot. A record that could not be removed is reported absent too, keeping it single-use.
    let raw: string | null;
    try {
        raw = storage.getItem(getStorageKey(state));
        storage.removeItem(getStorageKey(state));
    } catch {
        return null;
    }

    return parseUnexpiredFlow(raw);
}

function removeStoredFlows(shouldRemove: (raw: string | null) => boolean): void {
    const storage = getLocalStorage();
    if (!storage) {
        return;
    }
    try {
        for (const key of Object.keys(storage)) {
            if (key.startsWith(CONST.LOCAL_STORAGE_KEYS.QA_AUTH_REDIRECT_FLOW_PREFIX) && shouldRemove(storage.getItem(key))) {
                storage.removeItem(key);
            }
        }
    } catch {}
}

function sweepExpiredPendingAuthFlows(): void {
    removeStoredFlows((raw) => !parseUnexpiredFlow(raw));
}

function clearPendingAuthFlows(): void {
    removeStoredFlows(() => true);
}

export {clearPendingAuthFlows, consumePendingAuthFlow, savePendingAuthFlow, sweepExpiredPendingAuthFlows};
export type {PendingAuthFlow};
