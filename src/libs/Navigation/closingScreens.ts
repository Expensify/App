/**
 * Tracks which screens are in the middle of closing, so UI drawn outside the screens can react to a pop while it
 * is still running. Navigation state only changes once a pop commits, which on an interactive iOS swipe is the
 * moment the gesture ends, far too late for anything that has to travel with the screen.
 */
const closingRouteKeys = new Set<string>();
const listeners = new Set<() => void>();

function emit() {
    for (const listener of listeners) {
        listener();
    }
}

function subscribeToClosingScreens(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getIsAnyScreenClosing(): boolean {
    return closingRouteKeys.size > 0;
}

function markScreenClosing(routeKey: string) {
    if (closingRouteKeys.has(routeKey)) {
        return;
    }
    closingRouteKeys.add(routeKey);
    emit();
}

/** Called when the screen settles, which covers a finished pop as much as a gesture the user aborted. */
function markScreenSettled(routeKey: string) {
    if (!closingRouteKeys.delete(routeKey)) {
        return;
    }
    emit();
}

export {subscribeToClosingScreens, getIsAnyScreenClosing, markScreenClosing, markScreenSettled};
