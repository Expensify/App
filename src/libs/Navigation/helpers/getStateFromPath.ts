import type {NavigationState, PartialState} from '@react-navigation/native';
import {getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';
import Log from '@libs/Log';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';
import findMatchingDynamicSuffix from './dynamicRoutesUtils/findMatchingDynamicSuffix';
import getPathWithoutDynamicSuffix from './dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import getStateForDynamicRoute from './dynamicRoutesUtils/getStateForDynamicRoute';
import findFocusedRouteWithOnyxTabGuard from './findFocusedRouteWithOnyxTabGuard';
import getMatchingNewRoute from './getMatchingNewRoute';
import getRedirectedPath from './getRedirectedPath';

/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path: Route): PartialState<NavigationState> {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const redirectedPath = getRedirectedPath(normalizedPath);
    const normalizedPathAfterRedirection = getMatchingNewRoute(redirectedPath) ?? redirectedPath;

    const dynamicRouteSuffix = findMatchingDynamicSuffix(normalizedPathAfterRedirection);
    if (dynamicRouteSuffix) {
        const pathWithoutDynamicSuffix = getPathWithoutDynamicSuffix(normalizedPathAfterRedirection, dynamicRouteSuffix);

        type DynamicRouteKey = keyof typeof DYNAMIC_ROUTES;
        const dynamicRouteKeys = Object.keys(DYNAMIC_ROUTES) as DynamicRouteKey[];

        // Find the dynamic route key that matches the extracted suffix
        const dynamicRoute: string = dynamicRouteKeys.find((key) => DYNAMIC_ROUTES[key].path === dynamicRouteSuffix) ?? '';

        // Get the currently focused route from the base path to check permissions
        const focusedRoute = findFocusedRouteWithOnyxTabGuard(getStateFromPath(pathWithoutDynamicSuffix) ?? {});
        const entryScreens: ReadonlyArray<Screen | '*'> = DYNAMIC_ROUTES[dynamicRoute as DynamicRouteKey]?.entryScreens ?? [];

        // Check if the focused route is allowed to access this dynamic route
        if (focusedRoute?.name) {
            if (entryScreens.some((s) => s === '*' || s === focusedRoute.name)) {
                // Generate navigation state for the dynamic route
                const dynamicRouteState = getStateForDynamicRoute(normalizedPath, dynamicRoute as DynamicRouteKey, focusedRoute?.params as Record<string, unknown> | undefined);
                return dynamicRouteState;
            }

            // Fallback to not found page so users can't land on dynamic suffix directly.
            if (!pathWithoutDynamicSuffix) {
                const state = {routes: [{name: SCREENS.NOT_FOUND, path: normalizedPathAfterRedirection}]};

                return state;
            }

            // Log an error to quickly identify and add forgotten screens to the Dynamic Routes configuration
            Log.warn(`[getStateFromPath.ts][DynamicRoute] Focused route ${focusedRoute.name} is not allowed to access dynamic route with suffix ${dynamicRouteSuffix}`);
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
