/**
 * Parks the in-flight authorize round trip across the page unload: navigating to Cloudflare destroys module
 * memory, so the verifier, state and return URL have to survive in storage.
 *
 * sessionStorage because it is synchronous (readable before the first render), scoped to the tab that started
 * the flow (making the state check a per-tab provenance check) and dropped when the tab closes.
 */
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

/** Cloudflare's authorization codes are short-lived anyway; an older record is treated as absent */
const PENDING_AUTH_FLOW_TTL_MS = 10 * 60 * 1000;

type PendingAuthFlow = {
    /** CSRF/provenance value echoed back by Cloudflare on the callback */
    state: string;

    /** The PKCE secret, revealed only at the token exchange */
    codeVerifier: string;

    /** Absolute URL (route plus any open RHP) the user should land back on */
    returnURL: string;

    /** Epoch ms — see PENDING_AUTH_FLOW_TTL_MS */
    createdAt: number;
};

/** Storage access itself throws in hardened browser configurations, not just the write */
function getSessionStorage(): Storage | null {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        return window.sessionStorage ?? null;
    } catch {
        return null;
    }
}

/**
 * Throws when web storage is unavailable — the caller must refuse to redirect in that case rather than
 * navigate away and lose the verifier with no way to finish the exchange.
 */
function savePendingAuthFlow(flow: PendingAuthFlow): void {
    const storage = getSessionStorage();
    if (!storage) {
        throw new Error('Session storage is unavailable — cannot start the QA auth redirect');
    }
    storage.setItem(CONST.SESSION_STORAGE_KEYS.QA_AUTH_REDIRECT_FLOW, JSON.stringify(flow));
}

/**
 * Single-use: removes the record before returning it, so a replayed callback URL finds nothing.
 * Returns null when absent, unreadable, malformed or expired.
 */
function consumePendingAuthFlow(): PendingAuthFlow | null {
    const storage = getSessionStorage();
    if (!storage) {
        return null;
    }
    const raw = storage.getItem(CONST.SESSION_STORAGE_KEYS.QA_AUTH_REDIRECT_FLOW);
    storage.removeItem(CONST.SESSION_STORAGE_KEYS.QA_AUTH_REDIRECT_FLOW);
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
        parsed.state === '' ||
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

function clearPendingAuthFlow(): void {
    getSessionStorage()?.removeItem(CONST.SESSION_STORAGE_KEYS.QA_AUTH_REDIRECT_FLOW);
}

export {clearPendingAuthFlow, consumePendingAuthFlow, savePendingAuthFlow};
export type {PendingAuthFlow};
