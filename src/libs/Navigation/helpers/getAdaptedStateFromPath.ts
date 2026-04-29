import type {NavigationState, PartialState, getStateFromPath as RNGetStateFromPath, Route} from '@react-navigation/native';
import pick from 'lodash/pick';
import getInitialSplitNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import {RHP_TO_DOMAIN, RHP_TO_HOME, RHP_TO_SEARCH, RHP_TO_SETTINGS, RHP_TO_SIDEBAR, RHP_TO_WORKSPACE, RHP_TO_WORKSPACES_LIST} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {NavigationPartialRoute, RootNavigatorParamList} from '@libs/Navigation/types';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {getSearchParamFromPath} from '@libs/Url';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route as RoutePath} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Screen} from '@src/SCREENS';
import findMatchingDynamicSuffix from './dynamicRoutesUtils/findMatchingDynamicSuffix';
import getDynamicRouteAdaptedState from './dynamicRoutesUtils/getDynamicRouteAdaptedState';
import getPathWithoutDynamicSuffix from './dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import isDynamicRouteScreen from './dynamicRoutesUtils/isDynamicRouteScreen';
import findFocusedRouteWithOnyxTabGuard from './findFocusedRouteWithOnyxTabGuard';
import getMatchingNewRoute from './getMatchingNewRoute';
import getParamsFromRoute from './getParamsFromRoute';
import getStateFromPath from './getStateFromPath';
import {isFullScreenName} from './isNavigatorName';
import normalizePath from './normalizePath';
import replacePathInNestedState from './replacePathInNestedState';

type GetAdaptedStateReturnType = ReturnType<typeof getStateFromPath>;

type GetAdaptedStateFromPath = (...args: [...Parameters<typeof RNGetStateFromPath>, shouldReplacePathInNestedState?: boolean]) => GetAdaptedStateReturnType;

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

/** All tab routes derived from the shared TAB_SCREENS constant. */
const TAB_NAVIGATOR_ROUTES: NavigationPartialRoute[] = TAB_SCREENS.map((name) => ({name}));

/**
 * Builds TabNavigator state with all tabs and the correct selected tab.
 * Tab navigators require all routes in the state for proper rendering.
 */
function getTabNavigatorState(selectedTabRoute: NavigationPartialRoute): NavigationPartialRoute {
    const tabIndex = TAB_NAVIGATOR_ROUTES.findIndex((r) => r.name === selectedTabRoute.name);
    const index = tabIndex >= 0 ? tabIndex : 0;

    const routes = TAB_NAVIGATOR_ROUTES.map((route, i) => {
        if (i === index && selectedTabRoute.state) {
            return {...route, state: selectedTabRoute.state, params: selectedTabRoute.params};
        }
        return {...route};
    });

    return {name: NAVIGATORS.TAB_NAVIGATOR, state: {routes, index}};
}

function isRouteWithBackToParam(route: NavigationPartialRoute): route is Route<string, {backTo: string}> {
    return route.params !== undefined && 'backTo' in route.params && typeof route.params.backTo === 'string';
}

function isRouteWithReportID(route: NavigationPartialRoute): route is Route<string, {reportID: string}> {
    return route.params !== undefined && 'reportID' in route.params && typeof route.params.reportID === 'string';
}

/**
 * Get the appropriate screen name for RHP_TO_SEARCH lookup.
 * Split tabs (amount, percentage, date) are nested routes within SPLIT_EXPENSE/SPLIT_EXPENSE_SEARCH.
 * When a split tab route is accessed from search context (path contains '/search'),
 * we use SPLIT_EXPENSE_SEARCH for the mapping lookup instead of the tab name.
 */
function getSearchScreenNameForRoute(route: NavigationPartialRoute): string {
    const splitTabNames = Object.values(CONST.TAB.SPLIT) as string[];
    const isSplitTabRoute = splitTabNames.includes(route.name);

    if (isSplitTabRoute && route.path?.includes('/search')) {
        return SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_SEARCH;
    }

    return route.name;
}

function getMatchingFullScreenRoute(route: NavigationPartialRoute) {
    const isDynamicScreen = isDynamicRouteScreen(route.name as Screen);

    // Check for backTo param. One screen with different backTo value may need different screens visible under the overlay.
    // Dynamic screens are skipped here because they never carry their own backTo - they only
    // inherit it from the screen underneath. Letting backTo dictate the full-screen route for
    // a dynamic screen would resolve the wrong page.
    if (isRouteWithBackToParam(route) && !isDynamicScreen) {
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
        return getMatchingFullScreenRoute(focusedStateForBackToRoute);
    }

    const routeNameForLookup = getSearchScreenNameForRoute(route);
    if (RHP_TO_SEARCH[routeNameForLookup]) {
        const paramsFromRoute = getParamsFromRoute(RHP_TO_SEARCH[routeNameForLookup]);
        const copiedParams = paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : {};
        let queryParam: Record<string, string> = {};
        if (route.path) {
            const query = getSearchParamFromPath(route.path, 'q');
            if (query) {
                queryParam = {q: query};
            }
        }

        const searchRoute = {
            name: RHP_TO_SEARCH[routeNameForLookup],
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

    // Handle dynamic routes: find the appropriate full screen route
    if (route.path) {
        const suffixMatch = findMatchingDynamicSuffix(route.path);
        if (suffixMatch) {
            // Strip the suffix from the URL. For parametric routes we pass both the actual URL
            // suffix and the registered pattern so query params can be resolved correctly.
            const pathWithoutDynamicSuffix = getPathWithoutDynamicSuffix(route.path, suffixMatch.actualSuffix, suffixMatch.pattern);

            if (!pathWithoutDynamicSuffix) {
                return undefined;
            }

            // Parse the base path (without dynamic suffix) into a navigation state
            // to determine which full-screen route should be visible underneath the overlay.
            const stateUnderDynamicRoute = getStateFromPath(pathWithoutDynamicSuffix);
            const lastRoute = stateUnderDynamicRoute?.routes.at(-1);

            if (!stateUnderDynamicRoute || !lastRoute || lastRoute.name === SCREENS.NOT_FOUND) {
                return undefined;
            }

            const isLastRouteFullScreen = isFullScreenName(lastRoute.name);

            if (isLastRouteFullScreen) {
                return lastRoute;
            }

            const focusedRouteUnderDynamicRoute = findFocusedRouteWithOnyxTabGuard(stateUnderDynamicRoute);

            if (!focusedRouteUnderDynamicRoute) {
                return undefined;
            }

            // Recursively find the matching full screen route for the focused dynamic route
            return getMatchingFullScreenRoute(focusedRouteUnderDynamicRoute);
        }
    }

    return undefined;
}

// If there is no particular matching route defined, we want to get the default route.
// It is the reports split navigator with report. If the reportID is defined in the focused route, we want to use it for the default report.
// This is separated from getMatchingFullScreenRoute because we want to use it only for the initial state.
// We don't want to make this route mandatory e.g. after deep linking or opening a specific flow.
function getDefaultFullScreenRoute(route?: NavigationPartialRoute) {
    if (route && isRouteWithReportID(route)) {
        const reportID = route.params.reportID;

        // Only allReports should be checked here
        if (!getReportOrDraftReport(reportID, undefined, undefined, {})) {
            return getTabNavigatorState({name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR});
        }

        const reportsState = getInitialSplitNavigatorState({name: SCREENS.INBOX}, {name: SCREENS.REPORT, params: {reportID}});
        return getTabNavigatorState(reportsState);
    }

    return getTabNavigatorState({name: SCREENS.HOME});
}

function getOnboardingAdaptedState(state: PartialState<NavigationState>): PartialState<NavigationState> {
    const onboardingRoute = state.routes.at(0);
    if (!onboardingRoute || onboardingRoute.name === SCREENS.ONBOARDING.PURPOSE || onboardingRoute.name === SCREENS.ONBOARDING.WORK_EMAIL) {
        return state;
    }

    const routes = [];
    routes.push({name: onboardingRoute.name === SCREENS.ONBOARDING.WORKSPACES ? SCREENS.ONBOARDING.PERSONAL_DETAILS : SCREENS.ONBOARDING.PURPOSE});
    if (onboardingRoute.name === SCREENS.ONBOARDING.ACCOUNTING) {
        routes.push({name: SCREENS.ONBOARDING.EMPLOYEES});
    }
    routes.push(onboardingRoute);

    return getRoutesWithIndex(routes);
}

function getAdaptedState(state: PartialState<NavigationState<RootNavigatorParamList>>): GetAdaptedStateReturnType {
    const fullScreenRoute = state.routes.find((route) => isFullScreenName(route.name));

    // If TAB_NAVIGATOR contains WORKSPACE_NAVIGATOR, ensure WORKSPACES_LIST is in its nested state
    if (fullScreenRoute?.name === NAVIGATORS.TAB_NAVIGATOR) {
        const tabState = fullScreenRoute.state as PartialState<NavigationState> | undefined;
        const wsNavRoute = tabState?.routes?.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
        if (wsNavRoute) {
            const wsNavState = wsNavRoute.state as PartialState<NavigationState> | undefined;
            const hasWorkspacesList = wsNavState?.routes?.some((r) => r.name === SCREENS.WORKSPACES_LIST);

            if (!hasWorkspacesList && wsNavState?.routes?.length) {
                const updatedNestedState = getRoutesWithIndex([{name: SCREENS.WORKSPACES_LIST}, ...(wsNavState.routes ?? [])]);
                const updatedWsNavRoute = {...wsNavRoute, state: updatedNestedState};
                const updatedTabRoutes = (tabState?.routes ?? []).map((r) => (r.name === NAVIGATORS.WORKSPACE_NAVIGATOR ? updatedWsNavRoute : r)) as NavigationPartialRoute[];
                const updatedTabState = {...tabState, routes: updatedTabRoutes};
                const updatedFullScreenRoute = {...fullScreenRoute, state: updatedTabState};
                const updatedRoutes = state.routes.map((r) => (r.name === NAVIGATORS.TAB_NAVIGATOR ? updatedFullScreenRoute : r)) as NavigationPartialRoute[];
                return getRoutesWithIndex(updatedRoutes);
            }
        }
    }

    // If there is no full screen route in the root, we want to add it.
    if (!fullScreenRoute) {
        const focusedRoute = findFocusedRouteWithOnyxTabGuard(state);

        let currentState = state;
        if (focusedRoute?.path && isDynamicRouteScreen(focusedRoute.name as Screen)) {
            currentState = getDynamicRouteAdaptedState(state, focusedRoute.path) as PartialState<NavigationState<RootNavigatorParamList>>;

            // getDynamicRouteAdaptedState may have already resolved the full screen route.
            // In that case, skip the default full screen route injection below - the state is already complete.
            const hasFullScreenRoute = currentState.routes.some((route) => isFullScreenName(route.name));
            if (hasFullScreenRoute) {
                return currentState;
            }
        }

        if (focusedRoute) {
            const matchingRootRoute = getMatchingFullScreenRoute(focusedRoute);

            // If there is a matching root route, add it to the state.
            if (matchingRootRoute) {
                return getRoutesWithIndex([matchingRootRoute, ...currentState.routes]);
            }
        }

        const onboardingNavigator = currentState.routes.find((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);

        // The onboarding flow consists of several screens. If we open any of the screens, the previous screens from that flow should be in the state.
        if (onboardingNavigator?.state) {
            const adaptedOnboardingNavigator = {
                ...onboardingNavigator,
                state: getOnboardingAdaptedState(onboardingNavigator.state),
            };

            return getRoutesWithIndex([getTabNavigatorState({name: SCREENS.HOME}), adaptedOnboardingNavigator]);
        }

        const isRightModalNavigator = currentState.routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

        if (isRightModalNavigator) {
            return getRoutesWithIndex([getTabNavigatorState({name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}), ...currentState.routes]);
        }

        const defaultFullScreenRoute = getDefaultFullScreenRoute(focusedRoute);

        // If not, add the default full screen route.
        return getRoutesWithIndex([defaultFullScreenRoute, ...currentState.routes]);
    }

    return state;
}

/**
 * Generate a navigation state from a given path, adapting it to handle cases like onboarding flow,
 * displaying RHP screens and navigating in the Workspaces tab.
 * For detailed information about generating state from a path,
 * see the NAVIGATION.md documentation.
 *
 * @param path - The path to generate state from
 * @param options - Extra options kept for react-navigation compatibility
 * @param shouldReplacePathInNestedState - Whether to replace the path in nested state (if passing this arg, pass `undefined` for `options`, otherwise omit both)
 * @returns The adapted navigation state
 * @throws Error if unable to get state from path
 */
// We keep `options` in the signature for `linkingConfig` compatibility with react-navigation.
const getAdaptedStateFromPath: GetAdaptedStateFromPath = (path, options, shouldReplacePathInNestedState = true) => {
    let normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    normalizedPath = getMatchingNewRoute(normalizedPath) ?? normalizedPath;

    // Bing search results still link to /signin when searching for “Expensify”, but the /signin route no longer exists in our repo, so we redirect it to the home page to avoid showing a Not Found page.
    if (normalizedPath === CONST.SIGNIN_ROUTE) {
        normalizedPath = '/';
    }

    const state = getStateFromPath(normalizedPath as RoutePath) as PartialState<NavigationState<RootNavigatorParamList>>;
    if (shouldReplacePathInNestedState) {
        replacePathInNestedState(state, normalizedPath);
    }

    if (state === undefined) {
        throw new Error(`[getAdaptedStateFromPath] Unable to get state from path: ${path}`);
    }

    return getAdaptedState(state);
};

export default getAdaptedStateFromPath;
export {getMatchingFullScreenRoute, isFullScreenName};
