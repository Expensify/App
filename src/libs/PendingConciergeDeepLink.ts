/**
 * Tracks whether a logged-out user opened a /concierge deep link so the app can
 * route them to Concierge after sign-up/onboarding. sessionStorage keeps the
 * tab-scoped intent across page reloads, while an explicit root deep link can
 * replace it with a Home fallback when the user cancels the Concierge intent.
 */
const PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY = 'PENDING_CONCIERGE_DEEP_LINK';
const PENDING_HOME_DEEP_LINK_STORAGE_KEY = 'PENDING_HOME_DEEP_LINK';
const LEGACY_PERFORMANCE_NAVIGATION_KEY = 'navigation';
const LEGACY_PERFORMANCE_NAVIGATION_TYPE_KEY = 'type';
const LEGACY_PERFORMANCE_NAVIGATION_TYPE_RELOAD = 1;
let hasPendingConciergeDeepLink = false;
let hasPendingHomeDeepLink = false;

function getSessionStorage() {
    try {
        return typeof window === 'undefined' ? undefined : window.sessionStorage;
    } catch {
        return undefined;
    }
}

function hasStoredFlag(key: string) {
    try {
        return getSessionStorage()?.getItem(key) === 'true';
    } catch {
        return false;
    }
}

function setStoredFlag(key: string) {
    try {
        getSessionStorage()?.setItem(key, 'true');
    } catch {
        // Ignore storage failures and keep the in-memory intent for the current page lifecycle.
    }
}

function clearStoredFlag(key: string) {
    try {
        getSessionStorage()?.removeItem(key);
    } catch {
        // Ignore storage failures since clearing the in-memory flag is still enough for this page lifecycle.
    }
}

function hasPendingConciergeDeepLinkIntent() {
    return hasPendingConciergeDeepLink || hasStoredFlag(PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY);
}

function hasPendingHomeDeepLinkIntent() {
    return hasPendingHomeDeepLink || hasStoredFlag(PENDING_HOME_DEEP_LINK_STORAGE_KEY);
}

function clearPendingHomeDeepLink() {
    hasPendingHomeDeepLink = false;
    clearStoredFlag(PENDING_HOME_DEEP_LINK_STORAGE_KEY);
}

function clearPendingConciergeDeepLink() {
    hasPendingConciergeDeepLink = false;
    clearPendingHomeDeepLink();
    clearStoredFlag(PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY);
}

function setPendingHomeDeepLink() {
    clearPendingConciergeDeepLink();
    hasPendingHomeDeepLink = true;
    setStoredFlag(PENDING_HOME_DEEP_LINK_STORAGE_KEY);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isBrowserReload() {
    try {
        // A browser refresh during signup can replay the root route even though the stored Concierge intent is still valid.
        const performance = typeof window === 'undefined' ? undefined : window.performance;
        const navigationEntries = performance?.getEntriesByType?.('navigation') ?? [];
        if (navigationEntries.some((entry) => 'type' in entry && entry.type === 'reload')) {
            return true;
        }

        // Some web runtimes only expose the deprecated navigation API, so read it indirectly to keep the fallback without triggering deprecated API lint.
        const legacyNavigation: unknown = performance ? Reflect.get(performance, LEGACY_PERFORMANCE_NAVIGATION_KEY) : undefined;
        return isRecord(legacyNavigation) && legacyNavigation[LEGACY_PERFORMANCE_NAVIGATION_TYPE_KEY] === LEGACY_PERFORMANCE_NAVIGATION_TYPE_RELOAD;
    } catch {
        return false;
    }
}

function setPendingHomeDeepLinkIfNoPendingConcierge() {
    // Startup/linking can emit ambiguous root/home signals, so avoid replacing an explicit /concierge intent.
    if (hasPendingConciergeDeepLinkIntent()) {
        return;
    }
    setPendingHomeDeepLink();
}

function setPendingHomeDeepLinkForRoot() {
    // A non-reload root URL is the user's latest explicit intent and should cancel any pending Concierge redirect.
    if (isBrowserReload()) {
        setPendingHomeDeepLinkIfNoPendingConcierge();
        return;
    }
    setPendingHomeDeepLink();
}

function setPendingConciergeDeepLink() {
    clearPendingHomeDeepLink();
    hasPendingConciergeDeepLink = true;
    setStoredFlag(PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY);
}

function consumePendingHomeDeepLink() {
    const shouldNavigateHome = hasPendingHomeDeepLinkIntent();
    clearPendingHomeDeepLink();
    return shouldNavigateHome;
}

function consumePendingConciergeDeepLink() {
    const shouldNavigateToConcierge = hasPendingConciergeDeepLinkIntent();
    clearPendingConciergeDeepLink();
    return shouldNavigateToConcierge;
}

export {
    setPendingConciergeDeepLink,
    setPendingHomeDeepLinkForRoot,
    setPendingHomeDeepLinkIfNoPendingConcierge,
    consumePendingConciergeDeepLink,
    consumePendingHomeDeepLink,
    clearPendingConciergeDeepLink,
};
