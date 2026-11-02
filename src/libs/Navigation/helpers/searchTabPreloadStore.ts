import {isTabRoutePreloaded} from './tabNavigatorUtils';

// State of the Spend tab preloaded at idle, shared between the tab button and the tab's navigator, which sit in different trees.

// Whether the pointer rests on the Spend tab button. The preloaded tab is frozen once built, and unfreezes while hovered so it
// catches up on the data changes it skipped before the click, instead of after it.
let isSearchTabHovered = false;
const hoverListeners = new Set<() => void>();

// Whether the preloaded Spend tab has its first content on screen, so a tap on it only reveals a built screen.
let isContentReady = false;

// Key of the Spend tab route the idle preload marked, unset once the tab is opened.
let idlePreloadedRouteKey: string | undefined;

function setIsSearchTabHovered(isHovered: boolean) {
    if (isSearchTabHovered === isHovered) {
        return;
    }
    isSearchTabHovered = isHovered;
    for (const listener of hoverListeners) {
        listener();
    }
}

function getIsSearchTabHovered() {
    return isSearchTabHovered;
}

function subscribeToSearchTabHover(listener: () => void) {
    hoverListeners.add(listener);
    return () => {
        hoverListeners.delete(listener);
    };
}

function markSearchTabContentReady() {
    isContentReady = true;
}

function clearSearchTabContentReady() {
    isContentReady = false;
}

function isSearchTabContentReady() {
    return isContentReady;
}

function setIdlePreloadedSearchTabRouteKey(routeKey: string) {
    idlePreloadedRouteKey = routeKey;
}

function clearIdlePreloadedSearchTabRouteKey() {
    idlePreloadedRouteKey = undefined;
}

/** Whether the Spend tab route has the idle preload's mark and was not opened since. */
function isIdlePreloadedSearchTabRoute(tabState: {routes: unknown[]; preloadedRouteKeys?: string[]}, routeKey: string) {
    return idlePreloadedRouteKey === routeKey && isTabRoutePreloaded(tabState, routeKey);
}

export {
    clearIdlePreloadedSearchTabRouteKey,
    clearSearchTabContentReady,
    getIsSearchTabHovered,
    isIdlePreloadedSearchTabRoute,
    isSearchTabContentReady,
    markSearchTabContentReady,
    setIdlePreloadedSearchTabRouteKey,
    setIsSearchTabHovered,
    subscribeToSearchTabHover,
};
