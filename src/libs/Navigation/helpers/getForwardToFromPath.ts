import {findFocusedRoute} from '@react-navigation/native';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import getLastSuffixFromPath from './getLastSuffixFromPath';
import getStateFromPath from './getStateFromPath';

/**
 * Extracts the base path from a URL containing a dynamic route suffix.
 *
 * Currently returns the path without the dynamic route suffix as a default value.
 * In the future, this function will contain mappings of absolute paths to their
 * corresponding forwardTo destinations to determine the next navigation step.
 *
 * @param path - The full URL path containing a dynamic route suffix
 * @throws Error if path is empty, doesn't contain a dynamic route, or screen name is missing
 */
function getForwardToFromPath(path: string): Route {
    const pathWithoutParams = path.split('?').at(0);

    if (!pathWithoutParams) {
        throw new Error('Failed to parse the path, path is empty');
    }

    const lastSuffix = getLastSuffixFromPath(path);
    const dynamicRouteKey = Object.keys(DYNAMIC_ROUTES).find((key) => DYNAMIC_ROUTES[key].path === lastSuffix);

    if (!dynamicRouteKey) {
        throw new Error("Provided path doesn't contain dynamic route");
    }

    const pathWithoutDynamicRoute = pathWithoutParams.replace(`/${lastSuffix}`, '');

    const screenName = findFocusedRoute(getStateFromPath(pathWithoutDynamicRoute as Route) ?? {});

    if (!screenName?.name) {
        throw new Error('Failed to parse the path, screen name is missing');
    }

    return pathWithoutDynamicRoute as Route;
}

export default getForwardToFromPath;
