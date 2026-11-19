/**
 * Holds the key of the screen a back swipe is closing over a tab root. The swipe only pops the navigation state once
 * it has finished, so the tab bar reads this to come back with the swipe instead of after it.
 */
let revealedUnderRouteKey: string | undefined;

const listeners = new Set<() => void>();

function setRevealedUnderRouteKey(routeKey: string | undefined) {
    if (revealedUnderRouteKey === routeKey) {
        return;
    }
    revealedUnderRouteKey = routeKey;
    for (const listener of listeners) {
        listener();
    }
}

function getRevealedUnderRouteKey() {
    return revealedUnderRouteKey;
}

function subscribeToRevealedUnderRouteKey(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export {setRevealedUnderRouteKey, getRevealedUnderRouteKey, subscribeToRevealedUnderRouteKey};
