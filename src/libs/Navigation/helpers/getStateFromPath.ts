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

/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path: Route): PartialState<NavigationState> {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const normalizedPathAfterRedirection = getMatchingNewRoute(normalizedPath) ?? normalizedPath;

    const suffixMatch = findMatchingDynamicSuffix(normalizedPathAfterRedirection);
    if (suffixMatch) {
        const {pattern, actualSuffix, pathParams} = suffixMatch;
        const pathWithoutDynamicSuffix = getPathWithoutDynamicSuffix(normalizedPathAfterRedirection, actualSuffix, pattern);

        type DynamicRouteKey = keyof typeof DYNAMIC_ROUTES;
        const dynamicRouteKeys = Object.keys(DYNAMIC_ROUTES) as DynamicRouteKey[];

        // Find the DYNAMIC_ROUTES config key whose path matches the extracted pattern.
        const dynamicRoute = dynamicRouteKeys.find((key) => DYNAMIC_ROUTES[key].path === pattern) ?? '';

        // Recursively parse the base path (without suffix) to determine which screen is "underneath".
        // The focused route tells us which screen the user is on, so we can verify it's allowed
        // to open this dynamic route (via entryScreens).
        const focusedRoute = findFocusedRouteWithOnyxTabGuard(getStateFromPath(pathWithoutDynamicSuffix) ?? {});
        const entryScreens: ReadonlyArray<Screen | '*'> = DYNAMIC_ROUTES[dynamicRoute as DynamicRouteKey]?.entryScreens ?? [];

        if (focusedRoute?.name) {
            if (entryScreens.some((s) => s === '*' || s === focusedRoute.name)) {
                // Merge the base route's params with
                // params extracted from the dynamic suffix.
                // This gives the dynamic route screen access to all context it needs.
                const mergedParams = {
                    ...(focusedRoute?.params as Record<string, unknown> | undefined),
                    ...pathParams,
                };
                const dynamicRouteState = getStateForDynamicRoute(normalizedPath, dynamicRoute as DynamicRouteKey, mergedParams);
                return dynamicRouteState;
            }

            // Fallback: if the base path is empty
            // there's no underlying screen - show Not Found.
            if (!pathWithoutDynamicSuffix) {
                const state = {routes: [{name: SCREENS.NOT_FOUND, path: normalizedPathAfterRedirection}]};

                return state;
            }

            Log.warn(`[getStateFromPath.ts][DynamicRoute] Focused route ${focusedRoute.name} is not allowed to access dynamic route with suffix ${pattern}`);
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
