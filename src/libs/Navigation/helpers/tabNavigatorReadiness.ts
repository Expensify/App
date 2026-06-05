/**
 * Tracks whether TAB_NAVIGATOR's child router is currently mounted.
 *
 * `routeNames` on the root navigator includes TAB_NAVIGATOR as soon as the authenticated RootStack
 * renders, but the navigator is loaded lazily via `getComponent`, so there is a window where the
 * screen is declared while its child router has not run `useNavigationBuilder` yet. Dispatching a
 * nested NAVIGATE during that window throws an unhandled-action error.
 *
 * The signal is driven by TabNavigator's mount/unmount lifecycle rather than inferred from the shape
 * of the navigation state, so it reliably reflects the current mount — including across a
 * logout → login cycle where the navigator unmounts and remounts — and never gets stuck waiting on
 * a state event that does not arrive on a quiet cold start.
 *
 * More than one TAB_NAVIGATOR can be mounted on the root stack at once (e.g. a cross-tab PUSH or the
 * workspace/domain split handler stacks a new TAB_NAVIGATOR over an existing one). The signal is
 * therefore ref-counted across mounted instances: it stays ready while any instance is mounted and
 * only re-arms once the last one unmounts, so popping a pushed navigator never strands a deep link
 * waiting on a promise that the still-mounted navigator would not resolve.
 */

let mountedCount = 0;
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
    mountedCount += 1;
    // Only the first mounted instance transitions the signal from not-ready to ready.
    if (mountedCount > 1) {
        return;
    }
    resolveReady();
}

/** Called from TabNavigator's unmount cleanup (e.g. on logout) so the next mount is awaited again. */
function setTabNavigatorUnmounted() {
    if (mountedCount === 0) {
        return;
    }
    mountedCount -= 1;
    // Re-arm only when the last mounted instance unmounts; other instances keep the signal ready.
    if (mountedCount > 0) {
        return;
    }
    resetReadyPromise();
}

/** Whether any TAB_NAVIGATOR's child router is mounted right now. */
function isTabNavigatorMounted(): boolean {
    return mountedCount > 0;
}

/** Resolves immediately if a TAB_NAVIGATOR is mounted, otherwise when one next mounts. */
function whenTabNavigatorReady(): Promise<void> {
    return mountedCount > 0 ? Promise.resolve() : readyPromise;
}

export {setTabNavigatorMounted, setTabNavigatorUnmounted, isTabNavigatorMounted, whenTabNavigatorReady};
