import isSideModalNavigator from './isSideModalNavigator';

/**
 * Counts the root routes that fill the screen. A side modal (RHP) is drawn on top of the full screen route
 * instead of replacing it, so it is not counted.
 */
function getFullScreenRootRouteCount(rootState: {routes: Array<{name: string}>} | undefined): number {
    return rootState?.routes.filter((route) => !isSideModalNavigator(route.name)).length ?? 0;
}

export default getFullScreenRootRouteCount;
