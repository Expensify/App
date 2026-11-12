import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

import findFocusedRouteWithOnyxTabGuard from './findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from './getStateFromPath';

type GetValidDynamicRouteBasePathParams = {
    entryScreens: ReadonlyArray<Screen | '*'>;
    fallbackPath: Route;
};

/** Returns the active route when it can host a dynamic route, or a known-valid fallback. */
function getValidDynamicRouteBasePath({entryScreens, fallbackPath}: GetValidDynamicRouteBasePathParams): Route {
    const activeRoute = Navigation.getActiveRoute();
    if (!activeRoute) {
        return fallbackPath;
    }

    try {
        // Navigation builds this path from the current navigation state, so it is a valid app route.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const activeRoutePath = activeRoute as Route;
        const focusedRouteName = findFocusedRouteWithOnyxTabGuard(getStateFromPath(activeRoutePath) ?? {})?.name;
        if (focusedRouteName && entryScreens.some((entryScreen) => entryScreen === '*' || entryScreen === focusedRouteName)) {
            return activeRoutePath;
        }
    } catch (error) {
        Log.warn('[Navigation] Failed to resolve a dynamic route base path', {activeRoute, error});
    }

    return fallbackPath;
}

export default getValidDynamicRouteBasePath;
