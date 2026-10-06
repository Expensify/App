import getInitialSplitNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import type {NavigationPartialRoute, NavigationRoute, RootNavigatorParamList} from '@libs/Navigation/types';
import {getReportOrDraftReport} from '@libs/ReportUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route as RoutePath} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Screen} from '@src/SCREENS';

import type {NavigationState, PartialState, getStateFromPath as RNGetStateFromPath, Route} from '@react-navigation/native';

import getDynamicRouteAdaptedState from './dynamicRoutesUtils/getDynamicRouteAdaptedState';
import isDynamicRouteScreen from './dynamicRoutesUtils/isDynamicRouteScreen';
import findFocusedRouteWithOnyxTabGuard from './findFocusedRouteWithOnyxTabGuard';
import getMatchingFullScreenRoute, {getRoutesWithIndex, getTabNavigatorState} from './getMatchingFullScreenRoute';
import getMatchingNewRoute from './getMatchingNewRoute';
import getStateFromPath from './getStateFromPath';
import {isFullScreenName} from './isNavigatorName';
import normalizePath from './normalizePath';
import replacePathInNestedState from './replacePathInNestedState';

type GetAdaptedStateReturnType = ReturnType<typeof getStateFromPath>;

type GetAdaptedStateFromPath = (...args: [...Parameters<typeof RNGetStateFromPath>, shouldReplacePathInNestedState?: boolean]) => GetAdaptedStateReturnType;

/**
 * Standalone full-screen public pages registered in PublicScreens (unauthenticated navigator) that
 * should NOT have TabNavigator prepended — they render on their own, with no tab navigator underneath.
 *
 * Keep in sync with the screens registered in PublicScreens.tsx (excluding TAB_NAVIGATOR, which hosts
 * the SignInPage at the root, and the other navigator entries).
 */
const PUBLIC_SCREENS = new Set<string>([
    SCREENS.VALIDATE_LOGIN,
    SCREENS.TRANSITION_BETWEEN_APPS,
    SCREENS.CONNECTION_COMPLETE,
    SCREENS.BANK_CONNECTION_COMPLETE,
    SCREENS.UNLINK_LOGIN,
    SCREENS.SAML_SIGN_IN,
]);

function isRouteWithReportID(route: NavigationRoute): route is Route<string, {reportID: string}> {
    return route.params !== undefined && 'reportID' in route.params && typeof route.params.reportID === 'string';
}

// If there is no particular matching route defined, we want to get the default route.
// It is the reports split navigator with report. If the reportID is defined in the focused route, we want to use it for the default report.
// This is separated from getMatchingFullScreenRoute because we want to use it only for the initial state.
// We don't want to make this route mandatory e.g. after deep linking or opening a specific flow.
function getDefaultFullScreenRoute(route?: NavigationRoute) {
    if (route && isRouteWithReportID(route)) {
        const reportID = route.params.reportID;

        // Only allReports should be checked here — TODO: Passing undefined in follow-up PRs of https://github.com/Expensify/App/issues/66414
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
    routes.push({
        name: onboardingRoute.name === SCREENS.ONBOARDING.WORKSPACES ? SCREENS.ONBOARDING.PERSONAL_DETAILS : SCREENS.ONBOARDING.PURPOSE,
    });
    if (onboardingRoute.name === SCREENS.ONBOARDING.ACCOUNTING) {
        routes.push({name: SCREENS.ONBOARDING.EMPLOYEES});
    }
    routes.push(onboardingRoute);

    return getRoutesWithIndex(routes);
}

function getAdaptedState(state: PartialState<NavigationState<RootNavigatorParamList>>): GetAdaptedStateReturnType {
    let currentState = state;
    const fullScreenRoute = currentState.routes.find((route) => isFullScreenName(route.name));

    if (fullScreenRoute?.name === NAVIGATORS.TAB_NAVIGATOR) {
        let tabState = fullScreenRoute.state as PartialState<NavigationState> | undefined;

        // RN's getStateFromPath emits only the tab matched by the path, so the TAB_NAVIGATOR strip may be sparse.
        // Rebuild the full strip around the active tab — consumers (e.g. REPLACE_FULLSCREEN_UNDER_RHP) expect every tab to be present.
        // Only the active tab's nested state is carried over; any other tabs in a sparse strip are placeholders without state.
        if (tabState?.routes && tabState.routes.length < TAB_SCREENS.length) {
            const activeTabRoute = tabState.routes.at(tabState.index ?? tabState.routes.length - 1);
            if (activeTabRoute) {
                tabState = getTabNavigatorState(activeTabRoute as NavigationPartialRoute).state;
                const normalizedRoutes = currentState.routes.map((r) => (r === fullScreenRoute ? {...r, state: tabState} : r));
                currentState = {...currentState, routes: normalizedRoutes};
            }
        }

        // If TAB_NAVIGATOR contains WORKSPACE_NAVIGATOR, ensure WORKSPACES_LIST is in its nested state
        const wsNavRoute = tabState?.routes?.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
        if (wsNavRoute) {
            const wsNavState = wsNavRoute.state as PartialState<NavigationState> | undefined;
            const hasWorkspacesList = wsNavState?.routes?.some((r) => r.name === SCREENS.WORKSPACES_LIST);

            if (!hasWorkspacesList && wsNavState?.routes?.length) {
                const updatedNestedState = getRoutesWithIndex([{name: SCREENS.WORKSPACES_LIST}, ...(wsNavState.routes ?? [])]);
                const updatedWsNavRoute = {...wsNavRoute, state: updatedNestedState};
                const updatedTabRoutes = (tabState?.routes ?? []).map((r) => (r.name === NAVIGATORS.WORKSPACE_NAVIGATOR ? updatedWsNavRoute : r)) as NavigationPartialRoute[];
                const updatedTabState = {...tabState, routes: updatedTabRoutes};
                const updatedFullScreenRoute = {
                    ...fullScreenRoute,
                    state: updatedTabState,
                };
                const updatedRoutes = currentState.routes.map((r) => (r.name === NAVIGATORS.TAB_NAVIGATOR ? updatedFullScreenRoute : r)) as NavigationPartialRoute[];
                return getRoutesWithIndex(updatedRoutes);
            }
        }
    }

    // If there is no full screen route in the root, we want to add it.
    if (!fullScreenRoute) {
        const focusedRoute = findFocusedRouteWithOnyxTabGuard(currentState);

        if (focusedRoute?.path && isDynamicRouteScreen(focusedRoute.name as Screen)) {
            currentState = getDynamicRouteAdaptedState(currentState, focusedRoute.path) as PartialState<NavigationState<RootNavigatorParamList>>;

            // getDynamicRouteAdaptedState may have already resolved the full screen route.
            // In that case, skip the default full screen route injection below - the state is already complete.
            const hasFullScreenRoute = currentState.routes.some((route) => isFullScreenName(route.name));
            if (hasFullScreenRoute) {
                return currentState;
            }
        }

        if (focusedRoute) {
            // getAdaptedState only runs when building navigation state from a path
            // (deeplink / browser refresh / cold load), so deeplink-only relations apply here.
            const matchingRootRoute = getMatchingFullScreenRoute(focusedRoute, true);

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

        // Public screens (e.g. ValidateLogin) exist in both PublicScreens and AuthScreens navigators.
        // Don't prepend TabNavigator because when the user is unauthenticated, PublicScreens is active
        // and TabNavigator doesn't exist — causing the RESET action to fail.
        const hasOnlyPublicScreens = currentState.routes.every((route) => PUBLIC_SCREENS.has(route.name));
        if (hasOnlyPublicScreens) {
            return currentState;
        }

        const defaultFullScreenRoute = getDefaultFullScreenRoute(focusedRoute);

        // If not, add the default full screen route.
        return getRoutesWithIndex([defaultFullScreenRoute, ...currentState.routes]);
    }

    return currentState;
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
    let normalizedPath = normalizePath(path);
    normalizedPath = getMatchingNewRoute(normalizedPath) ?? normalizedPath;

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
