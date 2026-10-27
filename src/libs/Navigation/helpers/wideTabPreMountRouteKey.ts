// Key of the screen that the wide-layout submit flow pre-mounted inside the current TAB_NAVIGATOR. Stack navigators keep
// this one route attached and unfrozen while it is covered, so it is laid out and painted before the reveal shows it.
let liveRouteKey: string | undefined;

// Tab route holding the live pre-mount. Background tabs are frozen on web, so this one must stay rendered to mount the screen.
let liveTabRouteKey: string | undefined;

const ROUTE_KEY_INFIX = '-wide-pre-mount-';

type RevealedPreMount = {
    /** Key of the screen the pre-mount was mounted under in the focused tab, if any */
    coveringRouteKey?: string;

    /**
     * Key of the root modal (e.g. RHP) the pre-mount was mounted behind. Only browser history entries saved before the reveal
     * still contain it
     */
    modalRouteKey?: string;
};

// Revealed pre-mounts by key, with what covered each before the reveal. A restored state where it is still covered
// is from before the reveal, so the pre-mount is dropped from it.
const revealedRouteKeys = new Map<string, RevealedPreMount>();

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

function markWideTabPreMountRouteKeyRevealed(key: string, coveringRouteKey?: string, modalRouteKey?: string) {
    revealedRouteKeys.set(key, {coveringRouteKey, modalRouteKey});
}

/** Records the modal a revealed pre-mount was behind. Call it only once the modal is gone, or the current state would lose the pre-mount. */
function setRevealedWideTabPreMountModalRouteKey(key: string, modalRouteKey: string) {
    const revealed = revealedRouteKeys.get(key);
    if (!revealed) {
        return;
    }
    revealedRouteKeys.set(key, {...revealed, modalRouteKey});
}

/**
 * True for a pre-mount that should be dropped from a restored state: one neither live nor revealed, or a revealed one
 * that is still covered there, by the screen right above it (`nextRouteKey`) or by its modal (`rootRouteKeys`).
 */
function isStaleWideTabPreMountRouteKey(key: string | undefined, nextRouteKey?: string, rootRouteKeys?: string[]): boolean {
    if (!key || !key.includes(ROUTE_KEY_INFIX) || key === liveRouteKey) {
        return false;
    }
    const revealed = revealedRouteKeys.get(key);
    if (!revealed) {
        return true;
    }
    const isUnderCoveringRoute = !!revealed.coveringRouteKey && revealed.coveringRouteKey === nextRouteKey;
    const isBehindModal = !!revealed.modalRouteKey && !!rootRouteKeys?.includes(revealed.modalRouteKey);
    return isUnderCoveringRoute || isBehindModal;
}

function setLiveWideTabPreMountPreloadedRouteKey(key: string | undefined) {
    livePreloadedRouteKey = key;
    if (key) {
        preloadedRouteKeysAddedByPreMount.add(key);
    }
}

/** Clears every live pre-mount key once the live pre-mount ends. */
function clearLiveWideTabPreMountKeys() {
    setLiveWideTabPreMountRouteKey(undefined);
    setLiveWideTabPreMountPreloadedRouteKey(undefined);
    setLiveWideTabPreMountTabRouteKey(undefined);
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
    setRevealedWideTabPreMountModalRouteKey,
    isStaleWideTabPreMountRouteKey,
    isStaleWideTabPreMountPreloadedRouteKey,
    clearLiveWideTabPreMountKeys,
};
