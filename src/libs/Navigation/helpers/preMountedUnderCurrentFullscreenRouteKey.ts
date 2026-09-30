import NAVIGATORS from '@src/NAVIGATORS';

// Key of the TAB_NAVIGATOR that the wide-layout submit flow pre-mounted directly under the current one. Root history is
// built from routes, so this route is skipped there until it is revealed, or the browser would get an entry for it.
// Router handlers write it because history is built during that same dispatch. Setting it from Navigation is too late.
let preMountedUnderCurrentFullscreenRouteKey: string | undefined;

const PRE_MOUNTED_ROUTE_KEY_PREFIX = `${NAVIGATORS.TAB_NAVIGATOR}-pre-mount-`;

// A revealed pre-mount becomes the visible navigator but keeps its key, so it must never count as stale.
const revealedPreMountedRouteKeys = new Set<string>();

function createPreMountedUnderCurrentFullscreenRouteKey(): string {
    return `${PRE_MOUNTED_ROUTE_KEY_PREFIX}${Date.now()}`;
}

function setPreMountedUnderCurrentFullscreenRouteKey(key: string) {
    preMountedUnderCurrentFullscreenRouteKey = key;
}

function clearPreMountedUnderCurrentFullscreenRouteKey() {
    preMountedUnderCurrentFullscreenRouteKey = undefined;
}

function isPreMountedUnderCurrentFullscreenRouteKey(key: string | undefined): boolean {
    return !!key && key === preMountedUnderCurrentFullscreenRouteKey;
}

function markPreMountedRouteKeyRevealed(key: string) {
    revealedPreMountedRouteKeys.add(key);
}

/** True for a pre-mount that was neither revealed nor still live, e.g. restored from a saved browser history entry. */
function isStalePreMountedRouteKey(key: string | undefined): boolean {
    return !!key && key.startsWith(PRE_MOUNTED_ROUTE_KEY_PREFIX) && key !== preMountedUnderCurrentFullscreenRouteKey && !revealedPreMountedRouteKeys.has(key);
}

export {
    createPreMountedUnderCurrentFullscreenRouteKey,
    setPreMountedUnderCurrentFullscreenRouteKey,
    clearPreMountedUnderCurrentFullscreenRouteKey,
    isPreMountedUnderCurrentFullscreenRouteKey,
    isStalePreMountedRouteKey,
    markPreMountedRouteKeyRevealed,
};
