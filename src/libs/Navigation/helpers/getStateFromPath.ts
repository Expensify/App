import Log from '@libs/Log';
import {linkingConfig} from '@libs/Navigation/linkingConfig';

import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';

import findAllMatchingDynamicSuffixes from './dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
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

    // Collect all syntactic matches and validate each one against entryScreens.
    // This prevents false-positive greedy matches where a user-defined name (e.g. a tag
    // named "gl-code") coincides with a registered static suffix like WORKSPACE_CATEGORY_GL_CODE.
    const allSuffixMatches = findAllMatchingDynamicSuffixes(normalizedPathAfterRedirection);

    type DynamicRouteKey = keyof typeof DYNAMIC_ROUTES;
    const dynamicRouteKeys = Object.keys(DYNAMIC_ROUTES) as DynamicRouteKey[];

    for (const suffixMatch of allSuffixMatches) {
        const {pattern, actualSuffix, pathParams, pathUsedForMatching, strippedTabPath} = suffixMatch;
        const pathWithoutDynamicSuffix = getPathWithoutDynamicSuffix(pathUsedForMatching, actualSuffix, pattern);

        // Find the DYNAMIC_ROUTES config key whose path matches the extracted pattern.
        const dynamicRoute = dynamicRouteKeys.find((key) => DYNAMIC_ROUTES[key].path === pattern) ?? '';

        // Recursively parse the base path (without suffix) to determine which screen is "underneath".
        // The focused route tells us which screen the user is on, so we can verify it's allowed
        // to open this dynamic route (via entryScreens).
        const focusedRoute = findFocusedRouteWithOnyxTabGuard(getStateFromPath(pathWithoutDynamicSuffix) ?? {});
        const entryScreens: ReadonlyArray<Screen | '*'> = DYNAMIC_ROUTES[dynamicRoute as DynamicRouteKey]?.entryScreens ?? [];

        if (focusedRoute?.name && entryScreens.some((s) => s === '*' || s === focusedRoute.name)) {
            // Merge the base route's params with params extracted from the dynamic suffix.
            // This gives the dynamic route screen access to all context it needs.
            const mergedParams = {
                ...(focusedRoute?.params as Record<string, unknown> | undefined),
                ...pathParams,
            };
            return getStateForDynamicRoute(normalizedPath, dynamicRoute as DynamicRouteKey, mergedParams, strippedTabPath);
        }

        // If the base path is empty there's no underlying screen - show Not Found immediately.
        if (!pathWithoutDynamicSuffix) {
            const state = {routes: [{name: SCREENS.NOT_FOUND, path: normalizedPathAfterRedirection}]};

            return state;
        }
    }

    // All syntactic candidates failed entryScreens validation - log for debugging.
    if (allSuffixMatches.length > 0) {
        Log.warn(
            `[getStateFromPath.ts][DynamicRoute] None of the ${allSuffixMatches.length} dynamic suffix candidate(s) passed entryScreens validation for path: ${normalizedPathAfterRedirection} (tried patterns: ${allSuffixMatches.map((m) => m.pattern).join(', ')})`,
        );
    }

    // This function is used in the linkTo function where we want to use default getStateFromPath function.
    const state = RNGetStateFromPath(normalizedPathAfterRedirection, linkingConfig.config);

    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }
    return state;
}

export default getStateFromPath;
