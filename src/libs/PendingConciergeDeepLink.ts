/**
 * Tracks whether a logged-out user opened a /concierge deep link so the app can
 * route them to Concierge after sign-up/onboarding. sessionStorage keeps the
 * tab-scoped intent across page reloads while sign-out/consume paths clear it.
 */
const PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY = 'PENDING_CONCIERGE_DEEP_LINK';
let hasPendingConciergeDeepLink = false;

function getSessionStorage() {
    try {
        return typeof window === 'undefined' ? undefined : window.sessionStorage;
    } catch {
        return undefined;
    }
}

function hasStoredPendingConciergeDeepLink() {
    try {
        return getSessionStorage()?.getItem(PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

function setPendingConciergeDeepLink() {
    hasPendingConciergeDeepLink = true;
    try {
        getSessionStorage()?.setItem(PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY, 'true');
    } catch {
        // Ignore storage failures and keep the in-memory intent for the current page lifecycle.
    }
}

function consumePendingConciergeDeepLink() {
    const shouldNavigateToConcierge = hasPendingConciergeDeepLink || hasStoredPendingConciergeDeepLink();
    clearPendingConciergeDeepLink();
    return shouldNavigateToConcierge;
}

function clearPendingConciergeDeepLink() {
    hasPendingConciergeDeepLink = false;
    try {
        getSessionStorage()?.removeItem(PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY);
    } catch {
        // Ignore storage failures since clearing the in-memory flag is still enough for this page lifecycle.
    }
}

export {setPendingConciergeDeepLink, consumePendingConciergeDeepLink, clearPendingConciergeDeepLink};
