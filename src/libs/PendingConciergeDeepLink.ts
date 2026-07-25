import ROUTES from '@src/ROUTES';

import isPublicScreenRoute from './isPublicScreenRoute';
import normalizePath from './Navigation/helpers/normalizePath';

/**
 * Tracks whether a logged-out user opened a /concierge deep link so the app can
 * route them to Concierge after sign-up/onboarding. sessionStorage keeps the
 * tab-scoped intent across page reloads, while localStorage lets any explicit
 * non-Concierge deep link in another tab cancel older Concierge intents for the same browser.
 */
const PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY = 'PENDING_CONCIERGE_DEEP_LINK';
const PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN_AT_SET_STORAGE_KEY = 'PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN_AT_SET';
const PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN_STORAGE_KEY = 'PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN';
const PENDING_HOME_DEEP_LINK_STORAGE_KEY = 'PENDING_HOME_DEEP_LINK';
const LEGACY_PERFORMANCE_NAVIGATION_KEY = 'navigation';
const LEGACY_PERFORMANCE_NAVIGATION_TYPE_KEY = 'type';
const LEGACY_PERFORMANCE_NAVIGATION_TYPE_RELOAD = 1;
let hasPendingConciergeDeepLink = false;
let hasPendingHomeDeepLink = false;
let pendingConciergeCancelTokenAtSet = '';

function getSessionStorage() {
    try {
        return typeof window === 'undefined' ? undefined : window.sessionStorage;
    } catch {
        return undefined;
    }
}

function getLocalStorage() {
    try {
        return typeof window === 'undefined' ? undefined : window.localStorage;
    } catch {
        return undefined;
    }
}

function getStoredValue(key: string, getStorage: () => Storage | undefined) {
    try {
        return getStorage()?.getItem(key);
    } catch {
        return undefined;
    }
}

function setStoredValue(key: string, value: string, getStorage: () => Storage | undefined) {
    try {
        getStorage()?.setItem(key, value);
    } catch {
        // Ignore storage failures and keep the in-memory intent for the current page lifecycle.
    }
}

function clearStoredValue(key: string, getStorage: () => Storage | undefined) {
    try {
        getStorage()?.removeItem(key);
    } catch {
        // Ignore storage failures since clearing the in-memory flag is still enough for this page lifecycle.
    }
}

function hasStoredFlag(key: string) {
    return getStoredValue(key, getSessionStorage) === 'true';
}

function setStoredFlag(key: string) {
    setStoredValue(key, 'true', getSessionStorage);
}

function clearStoredFlag(key: string) {
    clearStoredValue(key, getSessionStorage);
}

function getCancelToken() {
    return getStoredValue(PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN_STORAGE_KEY, getLocalStorage) ?? '';
}

function setCancelToken() {
    setStoredValue(PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN_STORAGE_KEY, `${Date.now()}-${Math.random()}`, getLocalStorage);
}

function setPendingConciergeCancelTokenAtSet() {
    pendingConciergeCancelTokenAtSet = getCancelToken();
    setStoredValue(PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN_AT_SET_STORAGE_KEY, pendingConciergeCancelTokenAtSet, getSessionStorage);
}

function clearPendingConciergeCancelTokenAtSet() {
    pendingConciergeCancelTokenAtSet = '';
    clearStoredValue(PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN_AT_SET_STORAGE_KEY, getSessionStorage);
}

function hasPendingConciergeDeepLinkFlag() {
    return hasPendingConciergeDeepLink || hasStoredFlag(PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY);
}

function hasCancelTokenChangedSinceConciergeWasSet() {
    if (!hasPendingConciergeDeepLinkFlag()) {
        return false;
    }

    // A newer cancel token means another tab opened a non-Concierge route after this tab stored /concierge.
    return getCancelToken() !== (getStoredValue(PENDING_CONCIERGE_DEEP_LINK_CANCEL_TOKEN_AT_SET_STORAGE_KEY, getSessionStorage) ?? pendingConciergeCancelTokenAtSet);
}

function hasPendingConciergeDeepLinkIntent() {
    return hasPendingConciergeDeepLinkFlag() && !hasCancelTokenChangedSinceConciergeWasSet();
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
    clearPendingConciergeCancelTokenAtSet();
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
    setCancelToken();
    setPendingHomeDeepLink();
}

function setPendingConciergeDeepLink() {
    clearPendingHomeDeepLink();
    hasPendingConciergeDeepLink = true;
    setStoredFlag(PENDING_CONCIERGE_DEEP_LINK_STORAGE_KEY);
    setPendingConciergeCancelTokenAtSet();
}

function cancelPendingConciergeDeepLinkFromExplicitRoute() {
    // Share explicit non-Concierge route intent across tabs so stale /concierge signup flows are canceled everywhere.
    setCancelToken();
    clearPendingConciergeDeepLink();
}

function getNormalizedRouteWithoutParams(route: string) {
    const [routeWithoutParams] = normalizePath(route).split(/[?#]/, 1);
    return routeWithoutParams.replace(/\/$/, '') || '/';
}

function isOnboardingRoute(normalizedRoute: string) {
    // Onboarding URLs are generated by the guided setup flow, so they should not replace the original signup deep-link intent.
    return normalizedRoute === normalizePath(ROUTES.ONBOARDING_ROOT.route) || normalizedRoute.startsWith(`${normalizePath(ROUTES.ONBOARDING_ROOT.route)}/`);
}

// Keep pending signup deep-link intent consistent across initial URL handling and later Linking URL events.
function updatePendingConciergeDeepLinkForRoute(route: string, isAuthenticated: boolean) {
    const normalizedRoute = getNormalizedRouteWithoutParams(route);
    const routeForPublicScreen = normalizedRoute === '/' ? '' : normalizedRoute.slice(1);
    if (isAuthenticated) {
        // Authenticated URL events can arrive after signup but before onboarding consumes the pending route intent.
        if (normalizedRoute === '/') {
            // Root can be opened after signup but before onboarding finishes, so keep it as an explicit Home intent.
            setPendingHomeDeepLinkForRoot();
        } else if (isOnboardingRoute(normalizedRoute)) {
            // Refreshing during onboarding should not replace the original signup deep-link intent.
            return;
        } else if (normalizedRoute !== normalizePath(ROUTES.CONCIERGE) && normalizedRoute !== normalizePath(ROUTES.HOME) && !isPublicScreenRoute(routeForPublicScreen)) {
            cancelPendingConciergeDeepLinkFromExplicitRoute();
        }
        return;
    }

    if (normalizedRoute === normalizePath(ROUTES.CONCIERGE)) {
        setPendingConciergeDeepLink();
    } else if (normalizedRoute === '/') {
        // Root is an explicit normal signup intent, so it cancels Concierge unless it is a reload replay.
        setPendingHomeDeepLinkForRoot();
    } else if (normalizedRoute === normalizePath(ROUTES.HOME)) {
        // /home can be generated during auth/startup reloads, so keep an existing Concierge intent if one is already stored.
        setPendingHomeDeepLinkIfNoPendingConcierge();
    } else if (!isPublicScreenRoute(routeForPublicScreen)) {
        // A different protected/internal deep link should not inherit an older Concierge redirect.
        cancelPendingConciergeDeepLinkFromExplicitRoute();
    }
}

function consumePendingHomeDeepLink() {
    const shouldNavigateHome = hasPendingHomeDeepLinkIntent() || hasCancelTokenChangedSinceConciergeWasSet();
    clearPendingHomeDeepLink();
    if (shouldNavigateHome) {
        clearPendingConciergeDeepLink();
    }
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
    updatePendingConciergeDeepLinkForRoute,
    consumePendingConciergeDeepLink,
    consumePendingHomeDeepLink,
    clearPendingConciergeDeepLink,
};
