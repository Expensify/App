/**
 * Remembers when the Reports tab preload was dispatched, so ManualNavigateToInboxTab can report how long the preloaded
 * tab waited before the tap. Kept here because the navigation state records that a tab is preloaded, but not when.
 */
type PreloadDispatch = {
    tabNavigatorKey: string;
    dispatchedAt: number;
};

let lastPreloadDispatch: PreloadDispatch | undefined;

function markReportsTabPreloadDispatched(tabNavigatorKey: string) {
    lastPreloadDispatch = {tabNavigatorKey, dispatchedAt: performance.now()};
}

/** Undefined when the last preload went to another tab navigator, e.g. one pushed by a cross-tab deep link. */
function getMsSinceReportsTabPreload(tabNavigatorKey: string | undefined): number | undefined {
    if (!lastPreloadDispatch || lastPreloadDispatch.tabNavigatorKey !== tabNavigatorKey) {
        return undefined;
    }
    return Math.round(performance.now() - lastPreloadDispatch.dispatchedAt);
}

export {getMsSinceReportsTabPreload, markReportsTabPreloadDispatched};
