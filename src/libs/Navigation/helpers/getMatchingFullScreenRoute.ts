/**
 * Finds the full screen route to render under a given route.
 * Split from getAdaptedStateFromPath so linkTo and Navigation can import it without pulling in ReportUtils.
 * Do not import ReportUtils or anything that imports Navigation here, or Navigation rejoins the import/no-cycle graph.
 */
import getInitialSplitNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import {
    RHP_TO_DOMAIN,
    RHP_TO_HOME,
    RHP_TO_SEARCH,
    RHP_TO_SEARCH_DEEPLINK,
    RHP_TO_SETTINGS,
    RHP_TO_SIDEBAR,
    RHP_TO_WORKSPACE,
    RHP_TO_WORKSPACES_LIST,
} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {NavigationPartialRoute, NavigationRoute} from '@libs/Navigation/types';
import {getSearchParamFromPath} from '@libs/Url';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route as RoutePath} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Screen} from '@src/SCREENS';

import type {NavigationState, PartialState, Route} from '@react-navigation/native';

import pick from 'lodash/pick';

import buildTabNavigatorNestedState from './buildTabNavigatorNestedState';
import findAllMatchingDynamicSuffixes from './dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from './dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import isDynamicRouteScreen from './dynamicRoutesUtils/isDynamicRouteScreen';
import findFocusedRouteWithOnyxTabGuard from './findFocusedRouteWithOnyxTabGuard';
import getDefaultDeeplinkSearchQuery from './getDefaultDeeplinkSearchQuery';
import getParamsFromRoute from './getParamsFromRoute';
import getStateFromPath from './getStateFromPath';
import {isFullScreenName} from './isNavigatorName';
import normalizePath from './normalizePath';

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

/**
 * Builds TabNavigator state with all tabs and the correct selected tab.
 * Tab navigators require all routes in the state for proper rendering.
 */
function getTabNavigatorState(selectedTabRoute: NavigationPartialRoute): NavigationPartialRoute {
    return {
        name: NAVIGATORS.TAB_NAVIGATOR,
        state: buildTabNavigatorNestedState(selectedTabRoute),
    };
}

function isRouteWithBackToParam(route: NavigationRoute): route is Route<string, {backTo: string}> {
    return route.params !== undefined && 'backTo' in route.params && typeof route.params.backTo === 'string';
}

/**
 * @param route - The (focused) route to find a full screen route for.
 * @param isDeeplink - Whether the state is being built from a path (deeplink / browser refresh / cold
 *   load) as opposed to in-app navigation. When true, deeplink-only relations (e.g. RHP_TO_SEARCH_DEEPLINK)
 *   are also considered so an RHP can get a sensible default fullscreen underneath it. In-app callers
 *   (linkTo, swapBackgroundTabForRHPTarget) leave this false so the same RHP can open over any fullscreen
 *   without changing the page currently underneath.
 */
function getMatchingFullScreenRoute(route: NavigationRoute, isDeeplink = false) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- route names in navigation state are typed as string
    const isDynamicScreen = isDynamicRouteScreen(route.name as Screen);

    // Check for backTo param. One screen with different backTo value may need different screens visible under the overlay.
    // Dynamic screens are skipped here because they never carry their own backTo - they only
    // inherit it from the screen underneath. Letting backTo dictate the full-screen route for
    // a dynamic screen would resolve the wrong page.
    if (isRouteWithBackToParam(route) && !isDynamicScreen) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- backTo is a path string read from route params
        const stateForBackTo = getStateFromPath(route.params.backTo as RoutePath);

        // This may happen if the backTo url is invalid.
        const lastRoute = stateForBackTo?.routes.at(-1);
        if (!stateForBackTo || !lastRoute || lastRoute.name === SCREENS.NOT_FOUND) {
            return undefined;
        }

        const isLastRouteFullScreen = isFullScreenName(lastRoute.name);

        // If the state for back to last route is a full screen route, we can use it
        if (isLastRouteFullScreen) {
            return lastRoute;
        }

        const focusedStateForBackToRoute = findFocusedRouteWithOnyxTabGuard(stateForBackTo);

        if (!focusedStateForBackToRoute) {
            return undefined;
        }
        // If not, get the matching full screen route for the back to state.
        return getMatchingFullScreenRoute(focusedStateForBackToRoute, isDeeplink);
    }

    // Deeplink-only relations provide a default search screen underneath the RHP when the state is
    // built from a path. They are ignored for in-app navigation so the RHP can open over any fullscreen.
    const matchingSearchScreen = RHP_TO_SEARCH[route.name];
    const matchingDeeplinkSearchScreen = isDeeplink ? RHP_TO_SEARCH_DEEPLINK[route.name] : undefined;
    const resolvedSearchScreen = matchingSearchScreen ?? matchingDeeplinkSearchScreen;
    if (resolvedSearchScreen) {
        const paramsFromRoute = getParamsFromRoute(resolvedSearchScreen);
        const copiedParams = paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : {};
        let queryParam: Record<string, string> = {};
        if (route.path) {
            const query = getSearchParamFromPath(route.path, 'q');
            if (query) {
                queryParam = {q: query};
            }
        }

        // Deeplink-only defaults (e.g. create flows) land on SCREENS.SEARCH.ROOT, which carries no path
        // params and no `q`. Without an explicit query, SearchQueryProvider falls back to the previous
        // defined query and can reveal a stale search when the RHP closes. Seed the canned expenses query
        // so these deeplinks resolve to Spend > Expenses.
        if (!queryParam.q && !matchingSearchScreen && matchingDeeplinkSearchScreen) {
            queryParam = {q: getDefaultDeeplinkSearchQuery()};
        }

        const searchRoute = {
            name: resolvedSearchScreen,
            params: Object.keys({...copiedParams, ...queryParam}).length > 0 ? {...copiedParams, ...queryParam} : undefined,
        };
        const searchState = getRoutesWithIndex([searchRoute]);
        return getTabNavigatorState({name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, state: searchState});
    }

    if (RHP_TO_HOME[route.name]) {
        return {
            ...getTabNavigatorState({name: SCREENS.HOME}),
            path: normalizePath(ROUTES.HOME),
        };
    }

    if (RHP_TO_WORKSPACES_LIST[route.name]) {
        return getTabNavigatorState({
            name: NAVIGATORS.WORKSPACE_NAVIGATOR,
            state: getRoutesWithIndex([
                {
                    name: SCREENS.WORKSPACES_LIST,
                    // prepending a slash to ensure closing the RHP after refreshing the page
                    // replaces the whole path with "/workspaces", instead of just replacing the last url segment ("/x/y/workspaces")
                    path: normalizePath(ROUTES.WORKSPACES_LIST.route),
                },
            ]),
        });
    }

    if (RHP_TO_WORKSPACE[route.name]) {
        const paramsFromRoute = getParamsFromRoute(RHP_TO_WORKSPACE[route.name]);

        const workspaceSplitRoute = getInitialSplitNavigatorState(
            {
                name: SCREENS.WORKSPACE.INITIAL,
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
            {
                name: RHP_TO_WORKSPACE[route.name],
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
        );

        return getTabNavigatorState({
            name: NAVIGATORS.WORKSPACE_NAVIGATOR,
            state: getRoutesWithIndex([{name: SCREENS.WORKSPACES_LIST}, workspaceSplitRoute]),
        });
    }

    if (RHP_TO_SETTINGS[route.name]) {
        const paramsFromRoute = getParamsFromRoute(RHP_TO_SETTINGS[route.name]);

        const settingsState = getInitialSplitNavigatorState(
            {name: SCREENS.SETTINGS.ROOT},
            {
                name: RHP_TO_SETTINGS[route.name],
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
        );
        return getTabNavigatorState(settingsState);
    }

    if (RHP_TO_DOMAIN[route.name]) {
        const paramsFromRoute = getParamsFromRoute(RHP_TO_DOMAIN[route.name]);

        const domainSplitRoute = getInitialSplitNavigatorState(
            {
                name: SCREENS.DOMAIN.INITIAL,
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
            {
                name: RHP_TO_DOMAIN[route.name],
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
        );

        return getTabNavigatorState({
            name: NAVIGATORS.WORKSPACE_NAVIGATOR,
            state: getRoutesWithIndex([{name: SCREENS.WORKSPACES_LIST}, domainSplitRoute]),
        });
    }

    // Fallback: if no specific central screen RELATION matched, check if the RHP screen
    // maps to a sidebar. This shows the split navigator with just the sidebar (no central screen).
    if (RHP_TO_SIDEBAR[route.name]) {
        const splitState = getInitialSplitNavigatorState({
            name: RHP_TO_SIDEBAR[route.name],
        });
        return getTabNavigatorState(splitState);
    }

    // Handle dynamic routes: find the appropriate full screen route.
    // Iterate all candidates so that a false-positive first match (e.g. a tag named "gl-code"
    // colliding with the registered static suffix) does not produce a NOT_FOUND state.
    if (route.path) {
        const allSuffixMatches = findAllMatchingDynamicSuffixes(route.path);
        for (const suffixMatch of allSuffixMatches) {
            const pathWithoutDynamicSuffix = getPathWithoutDynamicSuffix(suffixMatch.pathUsedForMatching, suffixMatch.actualSuffix, suffixMatch.pattern);

            if (!pathWithoutDynamicSuffix) {
                continue;
            }

            // Parse the base path (without dynamic suffix) into a navigation state
            // to determine which full-screen route should be visible underneath the overlay.
            const stateUnderDynamicRoute = getStateFromPath(pathWithoutDynamicSuffix);
            const lastRoute = stateUnderDynamicRoute?.routes.at(-1);

            if (!stateUnderDynamicRoute || !lastRoute || lastRoute.name === SCREENS.NOT_FOUND) {
                continue;
            }

            const isLastRouteFullScreen = isFullScreenName(lastRoute.name);

            if (isLastRouteFullScreen) {
                return lastRoute;
            }

            const focusedRouteUnderDynamicRoute = findFocusedRouteWithOnyxTabGuard(stateUnderDynamicRoute);

            if (!focusedRouteUnderDynamicRoute) {
                continue;
            }

            // Recursively find the matching full screen route for the focused dynamic route
            return getMatchingFullScreenRoute(focusedRouteUnderDynamicRoute, isDeeplink);
        }
    }

    return undefined;
}

export default getMatchingFullScreenRoute;
export {getRoutesWithIndex, getTabNavigatorState};
