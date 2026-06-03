/**
 * Tracks whether TAB_NAVIGATOR's child router is currently mounted.
 *
 * `routeNames` on the root navigator includes TAB_NAVIGATOR as soon as the authenticated RootStack
 * renders, but the navigator is loaded lazily via `getComponent`, so there is a window where the
 * screen is declared while its child router has not run `useNavigationBuilder` yet. Dispatching a
 * nested NAVIGATE during that window throws an unhandled-action error.
 *
 * The flag is driven by TabNavigator's mount/unmount lifecycle rather than inferred from the shape
 * of the navigation state, so it reliably reflects the current mount — including across a
 * logout → login cycle where the navigator unmounts and remounts — and never gets stuck waiting on
 * a state event that does not arrive on a quiet cold start.
 */

let isMounted = false;
let resolveReady: () => void;
let readyPromise: Promise<void>;

function resetReadyPromise() {
    readyPromise = new Promise<void>((resolve) => {
        resolveReady = resolve;
    });
}

resetReadyPromise();

/** Called from TabNavigator's mount effect once its child router has mounted. */
function setTabNavigatorMounted() {
    if (isMounted) {
        return;
    }
    isMounted = true;
    resolveReady();
}

/** Called from TabNavigator's unmount cleanup (e.g. on logout) so the next mount is awaited again. */
function setTabNavigatorUnmounted() {
    if (!isMounted) {
        return;
    }
    isMounted = false;
    resetReadyPromise();
}

/** Whether TAB_NAVIGATOR's child router is mounted right now. */
function isTabNavigatorMounted(): boolean {
    return isMounted;
}

/** Resolves immediately if TAB_NAVIGATOR is mounted, otherwise when it next mounts. */
function whenTabNavigatorReady(): Promise<void> {
    return isMounted ? Promise.resolve() : readyPromise;
}

export {setTabNavigatorMounted, setTabNavigatorUnmounted, isTabNavigatorMounted, whenTabNavigatorReady};
