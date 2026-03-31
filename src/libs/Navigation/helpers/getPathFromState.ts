import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import getDynamicRouteQueryParams from './dynamicRoutesUtils/getDynamicRouteQueryParams';
import {dynamicRoutePaths} from './dynamicRoutesUtils/isDynamicRouteSuffix';
import splitPathAndQuery from './dynamicRoutesUtils/splitPathAndQuery';

type State = NavigationState | Omit<PartialState<NavigationState>, 'stale'>;

/**
 * Checks if a screen name is a dynamic route screen
 */
function isDynamicRouteScreen(screenName: Screen): boolean {
    const screenPath = normalizedConfigs[screenName]?.path;

    if (!screenPath) {
        return false;
    }

    return dynamicRoutePaths.has(screenPath as DynamicRouteSuffix);
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
        .map((segment) => {
            if (segment.startsWith(':')) {
                const paramName = segment.endsWith('?') ? segment.slice(1, -1) : segment.slice(1);
                const value = params?.[paramName];
                if (typeof value === 'string' || typeof value === 'number') {
                    return encodeURIComponent(String(value));
                }
                return '';
            }
            return segment;
        })
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
function popFocusedRoute(state: State): State | undefined {
    const index = state.index ?? state.routes.length - 1;
    const focusedRoute = state.routes[index];

    if (!focusedRoute) {
        return undefined;
    }

    if (focusedRoute.state) {
        const nestedResult = popFocusedRoute(focusedRoute.state as State);

        if (nestedResult) {
            const newRoutes = [...state.routes] as typeof state.routes;
            // @ts-expect-error -- we're rebuilding a structurally identical route with updated nested state
            newRoutes[index] = {...focusedRoute, state: nestedResult};
            return {...state, routes: newRoutes, index} as State;
        }
    }

    if (state.routes.length > 1) {
        const newRoutes = state.routes.filter((_, i) => i !== index);
        return {...state, routes: newRoutes, index: newRoutes.length - 1} as State;
    }

    return undefined;
}

/**
 * Builds a URL path for a dynamic route screen that has no `path` in state.
 * Recursively peels off dynamic suffixes and resolves the base path underneath.
 *
 * @param state - The navigation state tree to build the path from
 * @returns The resolved path for the focused dynamic route screen
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function getPathForDynamicRoute(state: State): string {
    const focusedRoute = findFocusedRoute(state);
    const screenName = focusedRoute?.name ?? '';
    const suffixPattern = normalizedConfigs[screenName as Screen]?.path;

    if (!suffixPattern) {
        return RNGetPathFromState(state, linkingConfig.config);
    }

    const actualSuffix = buildSuffixFromPattern(suffixPattern, focusedRoute?.params as Record<string, unknown> | undefined);
    const reducedState = popFocusedRoute(state);

    if (!reducedState) {
        return `/${actualSuffix}`;
    }

    const basePath = getPathFromState(reducedState);
    const [basePathWithoutQuery] = splitPathAndQuery(basePath);

    return `${basePathWithoutQuery}/${actualSuffix}`;
}

function getPathFromState(state: State): string {
    const focusedRoute = findFocusedRoute(state);
    const screenName = focusedRoute?.name ?? '';

    if (isDynamicRouteScreen(screenName as Screen)) {
        if (focusedRoute?.path) {
            return focusedRoute.path;
        }
        return getPathForDynamicRoute(state);
    }

    return RNGetPathFromState(state, linkingConfig.config);
}

export default getPathFromState;
