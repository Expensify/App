// Key of the screen that the wide-layout submit flow pre-mounted inside the current TAB_NAVIGATOR. Stack navigators keep
// this one route attached and unfrozen while it is covered, so it is laid out and painted before the reveal shows it.
let liveRouteKey: string | undefined;

// Tab route holding the live pre-mount. Background tabs are frozen on web, so this one must stay rendered to mount the screen.
let liveTabRouteKey: string | undefined;

const ROUTE_KEY_INFIX = '-wide-pre-mount-';

// A revealed pre-mount becomes a regular screen but keeps its key. Mapped to the route it was mounted under, if any.
const revealedRouteKeys = new Map<string, string | undefined>();

// Tab route keys a pre-mount marked preloaded, so a saved browser history entry cannot keep a covered tab unfrozen forever.
const preloadedRouteKeysAddedByPreMount = new Set<string>();
let livePreloadedRouteKey: string | undefined;

function setLiveWideTabPreMountRouteKey(key: string | undefined) {
    liveRouteKey = key;
}

function isLiveWideTabPreMountRouteKey(key: string | undefined): boolean {
    return !!key && key === liveRouteKey;
}

function setLiveWideTabPreMountTabRouteKey(key: string | undefined) {
    liveTabRouteKey = key;
}

function isLiveWideTabPreMountTabRouteKey(key: string | undefined): boolean {
    return !!key && key === liveTabRouteKey;
}

function markWideTabPreMountRouteKeyRevealed(key: string, coveringRouteKey?: string) {
    revealedRouteKeys.set(key, coveringRouteKey);
}

/**
 * True for a pre-mount nobody owns, e.g. restored from a saved browser history entry. That is one neither revealed nor live,
 * or a revealed one still under the route it was mounted under (`nextRouteKey`), which only an entry saved before the reveal has.
 */
function isStaleWideTabPreMountRouteKey(key: string | undefined, nextRouteKey?: string): boolean {
    if (!key || !key.includes(ROUTE_KEY_INFIX) || key === liveRouteKey) {
        return false;
    }
    if (!revealedRouteKeys.has(key)) {
        return true;
    }
    const coveringRouteKey = revealedRouteKeys.get(key);
    return !!coveringRouteKey && coveringRouteKey === nextRouteKey;
}

function setLiveWideTabPreMountPreloadedRouteKey(key: string | undefined) {
    livePreloadedRouteKey = key;
    if (key) {
        preloadedRouteKeysAddedByPreMount.add(key);
    }
}

/** True for a tab preload that an earlier pre-mount added and the live one does not own. */
function isStaleWideTabPreMountPreloadedRouteKey(key: string): boolean {
    return preloadedRouteKeysAddedByPreMount.has(key) && key !== livePreloadedRouteKey;
}

export {
    setLiveWideTabPreMountRouteKey,
    isLiveWideTabPreMountRouteKey,
    setLiveWideTabPreMountTabRouteKey,
    isLiveWideTabPreMountTabRouteKey,
    markWideTabPreMountRouteKeyRevealed,
    isStaleWideTabPreMountRouteKey,
    setLiveWideTabPreMountPreloadedRouteKey,
    isStaleWideTabPreMountPreloadedRouteKey,
};
