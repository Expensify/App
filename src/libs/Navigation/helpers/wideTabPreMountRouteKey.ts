// Key of the screen that the wide-layout submit flow pre-mounted inside the current TAB_NAVIGATOR. Stack navigators keep
// this one route attached and unfrozen while it is covered, so it is laid out and painted before the reveal shows it.
let liveRouteKey: string | undefined;

// Tab route holding the live pre-mount. Background tabs are frozen on web, so this one must stay rendered to mount the screen.
let liveTabRouteKey: string | undefined;

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

export {
    setLiveWideTabPreMountRouteKey,
    isLiveWideTabPreMountRouteKey,
    setLiveWideTabPreMountTabRouteKey,
    isLiveWideTabPreMountTabRouteKey,
};
