import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
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

function findQueryParamsForPattern(pattern: string): readonly string[] | undefined {
    for (const entry of Object.values(DYNAMIC_ROUTES)) {
        if (entry.path === pattern && 'queryParams' in entry) {
            return entry.queryParams as readonly string[];
        }
    }
    return undefined;
}

/**
 * Reconstructs the actual URL suffix from a dynamic route pattern and route params.
 * Fills :param placeholders with values from params, and appends query params
 * based on the DYNAMIC_ROUTES[].queryParams config.
 *
 * Example: pattern 'flag/:reportID/:reportActionID' + params {reportID: '456', reportActionID: 'abc'}
 *          --> 'flag/456/abc'
 * Example: pattern 'country' + params {country: 'US'} + queryParams config ['country']
 *          --> 'country?country=US'
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
        .join('/');

    const queryParamKeys = findQueryParamsForPattern(pattern);
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
 * Removes the deepest focused route from the state tree.
 * Descends through routes[index] at each level until reaching a leaf route,
 * then removes it. If removing the route empties the navigator, cascades
 * removal upward by returning undefined to the parent.
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
 * Fallback path builder for dynamic route screens that lack a `path` property.
 * Peels off the dynamic suffix from the focused route, pops it from the state,
 * and recursively calls getPathFromState on the reduced state. This naturally
 * handles stacked dynamic routes (each recursion peels off one suffix).
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
