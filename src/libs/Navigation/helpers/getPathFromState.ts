import Log from '@libs/Log';
import {config, normalizedConfigs, screensWithOnyxTabNavigator} from '@libs/Navigation/linkingConfig/config';
import type {State} from '@libs/Navigation/types';
import {hasKey} from '@libs/ObjectUtils';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {getPathFromState as RNGetPathFromState} from '@react-navigation/native';

import getDynamicRouteQueryParams from './dynamicRoutesUtils/getDynamicRouteQueryParams';
import isDynamicRouteScreen from './dynamicRoutesUtils/isDynamicRouteScreen';
import splitPathAndQuery from './dynamicRoutesUtils/splitPathAndQuery';
import findFocusedRouteWithOnyxTabGuard from './findFocusedRouteWithOnyxTabGuard';

/**
 * Resolves a single path segment: if it's a `:param` placeholder, replaces it
 * with the URL-encoded value from `params`; otherwise returns the segment as-is.
 * Returns an empty string when a param value is missing or not a string/number.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function resolveSegment(segment: string, params: Record<string, unknown> | undefined): string {
    if (segment.startsWith(':')) {
        const paramName = segment.endsWith('?') ? segment.slice(1, -1) : segment.slice(1);
        const value = params?.[paramName];

        if (typeof value === 'string' || typeof value === 'number') {
            return encodeURIComponent(String(value));
        }

        return '';
    }
    return segment;
}

/**
 * Builds a concrete URL suffix from a dynamic route pattern by replacing `:param`
 * placeholders with actual values and appending configured query parameters.
 *
 * @param pattern - The route path pattern (e.g., 'flag/:reportID/:reportActionID' or 'country')
 * @param params - Route params to fill placeholders and query values from
 * @returns The resolved suffix string (e.g., 'flag/456/abc' or 'country?country=US')
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function buildSuffixFromPattern(pattern: string, params: Record<string, unknown> | undefined): string {
    const pathPart = pattern
        .split('/')
        .map((segment) => resolveSegment(segment, params))
        // filter(Boolean) is used to remove empty segments
        .filter(Boolean)
        .join('/');

    const queryParamKeys = getDynamicRouteQueryParams(pattern);
    if (queryParamKeys && queryParamKeys.length > 0 && params) {
        const queryParts: string[] = [];
        for (const key of queryParamKeys) {
            const value = params[key];
            if ((typeof value === 'string' || typeof value === 'number') && value !== '') {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            }
        }
        if (queryParts.length > 0) {
            return `${pathPart}?${queryParts.join('&')}`;
        }
    }

    return pathPart;
}

/**
 * Pops the deepest focused route from a navigation state tree.
 * Returns the reduced state, or undefined if the tree becomes empty.
 *
 * @param state - The navigation state tree to pop from
 * @returns The reduced state, or undefined if the tree becomes empty
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function popFocusedRoute(state: NavigationState): NavigationState | undefined;
function popFocusedRoute(state: PartialState<NavigationState>): PartialState<NavigationState> | undefined;
function popFocusedRoute(state: State): State | undefined;
function popFocusedRoute(state: State): State | undefined {
    const index = state.index ?? state.routes.length - 1;
    const focusedRoute = state.routes[index];

    // no focused route exists at this level - nothing to pop.
    if (!focusedRoute) {
        return undefined;
    }

    // the focused route has nested state - try to pop from deeper levels first,
    // unless it hosts an OnyxTabNavigator (treat it as a leaf).
    if (focusedRoute.state && focusedRoute.name && !screensWithOnyxTabNavigator.has(focusedRoute.name)) {
        // Rebuild from the narrowed state to preserve full and partial route categories.
        if (state.stale === false) {
            const nestedResult = popFocusedRoute(focusedRoute.state);
            const fullFocusedRoute = state.routes.at(index);
            if (nestedResult && fullFocusedRoute) {
                const newRoutes = [...state.routes];
                newRoutes[index] = {...fullFocusedRoute, state: nestedResult};
                return {...state, routes: newRoutes, index};
            }
        } else {
            const partialFocusedRoute = state.routes.at(index);
            const nestedResult = partialFocusedRoute?.state ? popFocusedRoute(partialFocusedRoute.state) : undefined;
            if (nestedResult && partialFocusedRoute) {
                const newRoutes = [...state.routes];
                newRoutes[index] = {...partialFocusedRoute, state: nestedResult};
                return {...state, routes: newRoutes, index};
            }
        }
    }

    // remove the focused route itself if siblings remain.
    if (state.routes.length > 1) {
        if (state.stale === false) {
            const newRoutes = state.routes.filter((_, i) => i !== index);
            return {...state, routes: newRoutes, index: newRoutes.length - 1};
        }
        const newRoutes = state.routes.filter((_, i) => i !== index);
        return {...state, routes: newRoutes, index: newRoutes.length - 1};
    }

    // Only one route at this level and nothing deeper to pop — signal the parent to remove this level entirely.
    return undefined;
}

/**
 * Builds a URL path for a dynamic route screen.
 * Recursively peels off dynamic suffixes and resolves the base path underneath.
 *
 * @param state - The navigation state tree to build the path from
 * @returns The resolved path for the focused dynamic route screen
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function getPathFromStateWithDynamicRoute(state: State): string {
    const focusedRoute = findFocusedRouteWithOnyxTabGuard(state);
    const screenName = focusedRoute?.name ?? '';
    const suffixPattern = hasKey(normalizedConfigs, screenName) ? normalizedConfigs[screenName]?.path : undefined;

    if (!suffixPattern) {
        return RNGetPathFromState(state, config);
    }

    let actualSuffix = buildSuffixFromPattern(suffixPattern, focusedRoute?.params ? {...focusedRoute.params} : undefined);

    // If this dynamic screen hosts a tab navigator, append the focused tab's path segment.
    if (screensWithOnyxTabNavigator.has(screenName)) {
        const tabState = focusedRoute?.state;
        if (tabState) {
            const tabIndex = tabState.index ?? tabState.routes.length - 1;
            const focusedTab = tabState.routes[tabIndex];
            const tabPath = focusedTab && hasKey(normalizedConfigs, focusedTab.name) ? normalizedConfigs[focusedTab.name]?.path : undefined;
            if (tabPath) {
                const [suffixPathOnly, suffixQueryOnly] = splitPathAndQuery(actualSuffix);
                actualSuffix = `${suffixPathOnly}/${tabPath}${suffixQueryOnly ? `?${suffixQueryOnly}` : ''}`;
            }
        }
    }

    const reducedState = popFocusedRoute(state);

    if (!reducedState) {
        return `/${actualSuffix}`;
    }

    const basePath = getPathFromState(reducedState);
    const [basePathWithoutQuery, baseQuery] = splitPathAndQuery(basePath);
    const [suffixPath, suffixQuery] = splitPathAndQuery(actualSuffix);

    const mergedParams = new URLSearchParams(baseQuery ?? '');
    const suffixParams = new URLSearchParams(suffixQuery ?? '');
    for (const [key, value] of suffixParams) {
        mergedParams.set(key, value);
    }
    const queryString = mergedParams.toString();

    // Mirror the root-base join in `createDynamicRoute.ts` so a `/` base yields `/suffix`, never `//suffix`.
    const combinedPath = basePathWithoutQuery === '/' ? `/${suffixPath}` : `${basePathWithoutQuery}/${suffixPath}`;

    // Safety net for this hand-built dynamic branch: guarantee exactly one leading slash and no internal `//`,
    // so the browser never parses a segment as a host and `history.pushState` can't throw a SecurityError.
    // React Navigation's own `getPathFromState` already normalizes slashes, so the standard-screen branch
    // doesn't need this.
    const normalizedPath = `/${combinedPath}`.replaceAll(/\/{2,}/g, '/');
    if (normalizedPath !== combinedPath) {
        // Log `screenName` only - the path can carry sensitive query params that shouldn't be shared.
        Log.alert('[Navigation] getPathFromStateWithDynamicRoute produced a malformed path', {screenName});
    }

    return `${normalizedPath}${queryString ? `?${queryString}` : ''}`;
}

function getPathFromState(state: State): string {
    const focusedRoute = findFocusedRouteWithOnyxTabGuard(state);
    const screenName = focusedRoute?.name ?? '';

    return hasKey(normalizedConfigs, screenName) && isDynamicRouteScreen(screenName) ? getPathFromStateWithDynamicRoute(state) : RNGetPathFromState(state, config);
}

export default getPathFromState;
