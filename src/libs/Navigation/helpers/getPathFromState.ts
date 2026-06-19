import {getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {config, normalizedConfigs, screensWithOnyxTabNavigator} from '@libs/Navigation/linkingConfig/config';
import type {Screen} from '@src/SCREENS';
import getDynamicRouteQueryParams from './dynamicRoutesUtils/getDynamicRouteQueryParams';
import isDynamicRouteScreen from './dynamicRoutesUtils/isDynamicRouteScreen';
import splitPathAndQuery from './dynamicRoutesUtils/splitPathAndQuery';
import findFocusedRouteWithOnyxTabGuard from './findFocusedRouteWithOnyxTabGuard';

type State = NavigationState | Omit<PartialState<NavigationState>, 'stale'>;

function isScreen(name: string): name is Screen {
    return name in normalizedConfigs;
}

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
 * Screens listed in `isLeaf` are treated as atomic leaves - the function will
 * not recurse into their nested state (e.g. tab navigators), so the entire
 * screen is removed as a unit rather than popping an individual tab.
 *
 * @param state - The navigation state tree to pop from
 * @param isLeaf - Optional guard: return true for screen names that should be
 *                 treated as leaves (not recursed into). Used to prevent drilling
 *                 into tab navigators hosted by dynamic screens.
 * @returns The reduced state, or undefined if the tree becomes empty
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function popFocusedRoute(state: State, isLeaf?: (name: string) => boolean): State | undefined {
    const index = state.index ?? state.routes.length - 1;
    const focusedRoute = state.routes[index];

    // no focused route exists at this level - nothing to pop.
    if (!focusedRoute) {
        return undefined;
    }

    // the focused route has nested state - try to pop from deeper levels first,
    // unless it is a leaf screen (e.g. a tab-hosting dynamic screen).
    if (focusedRoute.state && !isLeaf?.(focusedRoute.name ?? '')) {
        const nestedResult = popFocusedRoute(focusedRoute.state as State, isLeaf);

        // A deeper route was successfully popped - rebuild the current level with the updated nested state.
        if (nestedResult) {
            const newRoutes = [...state.routes] as typeof state.routes;
            // @ts-expect-error -- we're rebuilding a structurally identical route with updated nested state
            newRoutes[index] = {...focusedRoute, state: nestedResult};
            return {...state, routes: newRoutes, index} as State;
        }
    }

    // remove the focused route itself if siblings remain.
    if (state.routes.length > 1) {
        const newRoutes = state.routes.filter((_, i) => i !== index);
        return {...state, routes: newRoutes, index: newRoutes.length - 1} as State;
    }

    // Only one route at this level and nothing deeper to pop — signal the parent to remove this level entirely.
    return undefined;
}

/**
 * Builds a URL path for a dynamic route screen.
 * Recursively peels off dynamic suffixes and resolves the base path underneath.
 *
 * When the focused dynamic screen hosts a tab navigator (i.e. it is in
 * `screensWithOnyxTabNavigator`), the focused tab's path segment is appended
 * to the dynamic suffix before the base path is resolved.
 *
 * @param state - The navigation state tree to build the path from
 * @returns The resolved path for the focused dynamic route screen
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function getPathFromStateWithDynamicRoute(state: State): string {
    const focusedRoute = findFocusedRouteWithOnyxTabGuard(state);
    const screenName = focusedRoute?.name ?? '';
    const suffixPattern = normalizedConfigs[screenName as Screen]?.path;

    if (!suffixPattern) {
        return RNGetPathFromState(state, config);
    }

    let actualSuffix = buildSuffixFromPattern(suffixPattern, focusedRoute?.params as Record<string, unknown> | undefined);

    // If this dynamic screen hosts a tab navigator, append the focused tab's path segment.
    if (screensWithOnyxTabNavigator.has(screenName)) {
        const tabState = focusedRoute?.state;
        if (tabState) {
            const tabIndex = tabState.index ?? tabState.routes.length - 1;
            const focusedTab = tabState.routes[tabIndex];
            const tabPath = focusedTab && isScreen(focusedTab.name) ? normalizedConfigs[focusedTab.name]?.path : undefined;
            if (tabPath) {
                actualSuffix = `${actualSuffix}/${tabPath}`;
            }
        }
    }

    const reducedState = popFocusedRoute(state, (name) => screensWithOnyxTabNavigator.has(name));

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

    return `${basePathWithoutQuery}/${suffixPath}${queryString ? `?${queryString}` : ''}`;
}

function getPathFromState(state: State): string {
    const focusedRoute = findFocusedRouteWithOnyxTabGuard(state);
    const screenName = focusedRoute?.name ?? '';

    if (isDynamicRouteScreen(screenName as Screen)) {
        return getPathFromStateWithDynamicRoute(state);
    }

    return RNGetPathFromState(state, config);
}

export default getPathFromState;
