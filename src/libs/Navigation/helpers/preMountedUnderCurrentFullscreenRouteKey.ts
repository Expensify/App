import NAVIGATORS from '@src/NAVIGATORS';

// Key of the TAB_NAVIGATOR that the wide-layout submit flow pre-mounted directly under the current one. Root history is
// built from routes, so this route is skipped there until it is revealed, or the browser would get an entry for it.
// Router handlers write it because history is built during that same dispatch; setting it from Navigation is too late.
let preMountedUnderCurrentFullscreenRouteKey: string | undefined;

function createPreMountedUnderCurrentFullscreenRouteKey(): string {
    return `${NAVIGATORS.TAB_NAVIGATOR}-pre-mount-${Date.now()}`;
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

export {
    createPreMountedUnderCurrentFullscreenRouteKey,
    setPreMountedUnderCurrentFullscreenRouteKey,
    clearPreMountedUnderCurrentFullscreenRouteKey,
    isPreMountedUnderCurrentFullscreenRouteKey,
};
