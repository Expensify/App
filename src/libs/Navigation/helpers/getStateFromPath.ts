import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import getLastSuffixFromPath from './getLastSuffixFromPath';
import getMatchingNewRoute from './getMatchingNewRoute';
import getStateForDynamicRoute from './getStateForDynamicRoute';
import isDynamicRouteSuffix from './isDynamicRouteSuffix';

/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path: Route): PartialState<NavigationState> {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const normalizedPathAfterRedirection = getMatchingNewRoute(normalizedPath) ?? normalizedPath;

    const dynamicRouteSuffix = getLastSuffixFromPath(path);
    if (isDynamicRouteSuffix(dynamicRouteSuffix)) {
        const pathWithoutDynamicSuffix = path.replace(`/${dynamicRouteSuffix}`, '');

        type DynamicRouteKey = keyof typeof DYNAMIC_ROUTES;

        // Find the dynamic route key that matches the extracted suffix
        const dynamicRoute: string = Object.keys(DYNAMIC_ROUTES).find((key) => DYNAMIC_ROUTES[key as DynamicRouteKey].path === dynamicRouteSuffix) ?? '';

        // Get the currently focused route from the base path to check permissions
        const focusedRoute = findFocusedRoute(getStateFromPath(pathWithoutDynamicSuffix as Route) ?? {});
        const entryScreens: Screen[] = DYNAMIC_ROUTES[dynamicRoute as DynamicRouteKey]?.entryScreens ?? [];

        // Check if the focused route is allowed to access this dynamic route
        if (focusedRoute?.name && entryScreens.includes(focusedRoute.name as Screen)) {
            // Generate navigation state for the dynamic route
            const verifyAccountState = getStateForDynamicRoute(normalizedPath, dynamicRoute as DynamicRouteKey);
            return verifyAccountState;
        }
    }

    // This function is used in the linkTo function where we want to use default getStateFromPath function.
    const state = RNGetStateFromPath(normalizedPathAfterRedirection, linkingConfig.config);

    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }

    return state;
}

export default getStateFromPath;
