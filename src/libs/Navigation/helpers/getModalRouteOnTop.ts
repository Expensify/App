import {isFullScreenName} from './isNavigatorName';

/** Returns the top route of the root stack when it is a modal (e.g. the RHP) rather than a fullscreen route. */
function getModalRouteOnTop<TRoute extends {name: string}>(state: {routes: readonly TRoute[]} | undefined): TRoute | undefined {
    const topRoute = state?.routes?.at(-1);
    if (!topRoute || isFullScreenName(topRoute.name)) {
        return undefined;
    }
    return topRoute;
}

export default getModalRouteOnTop;
