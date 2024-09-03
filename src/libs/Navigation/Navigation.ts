import {findFocusedRoute} from '@react-navigation/core';
import type {EventArg, NavigationContainerEventMap} from '@react-navigation/native';
import {CommonActions, getPathFromState, StackActions} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import {isCentralPaneName, removePolicyIDParamFromState} from '@libs/NavigationUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import ROUTES, {HYBRID_APP_ROUTES} from '@src/ROUTES';
import {PROTECTED_SCREENS} from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import originalCloseRHPFlow from './closeRHPFlow';
import originalDismissModal from './dismissModal';
import originalDismissModalWithReport from './dismissModalWithReport';
import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import originalGetTopmostReportActionId from './getTopmostReportActionID';
import originalGetTopmostReportId from './getTopmostReportId';
import isReportOpenInRHP from './isReportOpenInRHP';
import linkingConfig from './linkingConfig';
import getMatchingBottomTabRouteForState from './linkingConfig/getMatchingBottomTabRouteForState';
import navigationRef from './navigationRef';
import linkTo from './newLinkTo';
import setNavigationActionToMicrotaskQueue from './setNavigationActionToMicrotaskQueue';
import switchPolicyID from './switchPolicyID';
import type {NavigationStateRoute, RootStackParamList, State, StateOrRoute, SwitchPolicyIDParams} from './types';

let resolveNavigationIsReadyPromise: () => void;
const navigationIsReadyPromise = new Promise<void>((resolve) => {
    resolveNavigationIsReadyPromise = resolve;
});

let pendingRoute: Route | null = null;

let shouldPopAllStateOnUP = false;

/**
 * Inform the navigation that next time user presses UP we should pop all the state back to LHN.
 */
function setShouldPopAllStateOnUP(shouldPopAllStateFlag: boolean) {
    shouldPopAllStateOnUP = shouldPopAllStateFlag;
}

function canNavigate(methodName: string, params: Record<string, unknown> = {}): boolean {
    if (navigationRef.isReady()) {
        return true;
    }
    Log.hmmm(`[Navigation] ${methodName} failed because navigation ref was not yet ready`, params);
    return false;
}

// Re-exporting the getTopmostReportId here to fill in default value for state. The getTopmostReportId isn't defined in this file to avoid cyclic dependencies.
const getTopmostReportId = (state = navigationRef.getState()) => originalGetTopmostReportId(state);

// Re-exporting the getTopmostReportActionID here to fill in default value for state. The getTopmostReportActionID isn't defined in this file to avoid cyclic dependencies.
const getTopmostReportActionId = (state = navigationRef.getState()) => originalGetTopmostReportActionId(state);

// Re-exporting the dismissModal here to fill in default value for navigationRef. The dismissModal isn't defined in this file to avoid cyclic dependencies.
const dismissModal = (reportID?: string, ref = navigationRef) => {
    if (!reportID) {
        originalDismissModal(ref);
        return;
    }
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    originalDismissModalWithReport({reportID, ...report}, ref);
};
// Re-exporting the closeRHPFlow here to fill in default value for navigationRef. The closeRHPFlow isn't defined in this file to avoid cyclic dependencies.
const closeRHPFlow = (ref = navigationRef) => originalCloseRHPFlow(ref);

// Re-exporting the dismissModalWithReport here to fill in default value for navigationRef. The dismissModalWithReport isn't defined in this file to avoid cyclic dependencies.
// This method is needed because it allows to dismiss the modal and then open the report. Within this method is checked whether the report belongs to a specific workspace. Sometimes the report we want to check, hasn't been added to the Onyx yet.
// Then we can pass the report as a param without getting it from the Onyx.
const dismissModalWithReport = (report: OnyxEntry<Report>, ref = navigationRef) => originalDismissModalWithReport(report, ref);

/** Method for finding on which index in stack we are. */
function getActiveRouteIndex(stateOrRoute: StateOrRoute, index?: number): number | undefined {
    if ('routes' in stateOrRoute && stateOrRoute.routes) {
        const childActiveRoute = stateOrRoute.routes[stateOrRoute.index ?? 0];
        return getActiveRouteIndex(childActiveRoute, stateOrRoute.index ?? 0);
    }

    if ('state' in stateOrRoute && stateOrRoute.state?.routes) {
        const childActiveRoute = stateOrRoute.state.routes[stateOrRoute.state.index ?? 0];
        return getActiveRouteIndex(childActiveRoute, stateOrRoute.state.index ?? 0);
    }

    if (
        'name' in stateOrRoute &&
        (stateOrRoute.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR || stateOrRoute.name === NAVIGATORS.LEFT_MODAL_NAVIGATOR || stateOrRoute.name === NAVIGATORS.WORKSPACE_NAVIGATOR)
    ) {
        return 0;
    }

    return index;
}

/**
 * Function that generates dynamic urls from paths passed from OldDot
 */
function parseHybridAppUrl(url: HybridAppRoute | Route): Route {
    switch (url) {
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, ReportUtils.generateReportID());
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, ReportUtils.generateReportID());
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE:
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, ReportUtils.generateReportID());
        default:
            return url;
    }
}

/**
 * Gets distance from the path in root navigator. In other words how much screen you have to pop to get to the route with this path.
 * The search is limited to 5 screens from the top for performance reasons.
 * @param path - Path that you are looking for.
 * @return - Returns distance to path or -1 if the path is not found in root navigator.
 */
function getDistanceFromPathInRootNavigator(path?: string): number {
    let currentState = navigationRef.getRootState();

    for (let index = 0; index < 5; index++) {
        if (!currentState.routes.length) {
            break;
        }

        // When comparing path and pathFromState, the policyID parameter isn't included in the comparison
        const currentStateWithoutPolicyID = removePolicyIDParamFromState(currentState as State<RootStackParamList>);
        const pathFromState = getPathFromState(currentStateWithoutPolicyID, linkingConfig.config);
        if (path === pathFromState.substring(1)) {
            return index;
        }

        currentState = {...currentState, routes: currentState.routes.slice(0, -1), index: currentState.index - 1};
    }

    return -1;
}

/** Returns the current active route */
function getActiveRoute(): string {
    const currentRoute = navigationRef.current && navigationRef.current.getCurrentRoute();
    if (!currentRoute?.name) {
        return '';
    }

    const routeFromState = getPathFromState(navigationRef.getRootState(), linkingConfig.config);

    if (routeFromState) {
        return routeFromState;
    }

    return '';
}

function getReportRHPActiveRoute(): string {
    if (isReportOpenInRHP(navigationRef.getRootState())) {
        return getActiveRoute();
    }
    return '';
}

/**
 * Check whether the passed route is currently Active or not.
 *
 * Building path with getPathFromState since navigationRef.current.getCurrentRoute().path
 * is undefined in the first navigation.
 *
 * @param routePath Path to check
 * @return is active
 */
function isActiveRoute(routePath: Route): boolean {
    let activeRoute = getActiveRoute();
    activeRoute = activeRoute.startsWith('/') ? activeRoute.substring(1) : activeRoute;

    // We remove redundant (consecutive and trailing) slashes from path before matching
    return activeRoute === routePath.replace(CONST.REGEX.ROUTES.REDUNDANT_SLASHES, (match, p1) => (p1 ? '/' : ''));
}

/**
 * Main navigation method for redirecting to a route.
 * @param [type] - Type of action to perform. Currently UP is supported.
 */
function navigate(route: Route = ROUTES.HOME, type?: string) {
    if (!canNavigate('navigate', {route})) {
        // Store intended route if the navigator is not yet available,
        // we will try again after the NavigationContainer is ready
        Log.hmmm(`[Navigation] Container not yet ready, storing route as pending: ${route}`);
        pendingRoute = route;
        return;
    }
    // linkTo(navigationRef.current, route, type, isActiveRoute(route));
    linkTo(navigationRef.current, route, type, isActiveRoute(route));
}

/**
 * @param fallbackRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param shouldEnforceFallback - Enforces navigation to fallback route
 * @param shouldPopToTop - Should we navigate to LHN on back press
 */
function goBack(fallbackRoute?: Route, shouldEnforceFallback = false, shouldPopToTop = false) {
    if (!canNavigate('goBack')) {
        return;
    }

    if (shouldPopToTop) {
        if (shouldPopAllStateOnUP) {
            shouldPopAllStateOnUP = false;
            navigationRef.current?.dispatch(StackActions.popToTop());
            return;
        }
    }

    if (!navigationRef.current?.canGoBack()) {
        Log.hmmm('[Navigation] Unable to go back');
        return;
    }

    const isFirstRouteInNavigator = !getActiveRouteIndex(navigationRef.current.getState());
    if (isFirstRouteInNavigator) {
        const rootState = navigationRef.getRootState();
        const lastRoute = rootState.routes.at(-1);
        // If the user comes from a different flow (there is more than one route in ModalNavigator) we should go back to the previous flow on UP button press instead of using the fallbackRoute.
        if ((lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR || lastRoute?.name === NAVIGATORS.LEFT_MODAL_NAVIGATOR) && (lastRoute.state?.index ?? 0) > 0) {
            navigationRef.current.goBack();
            return;
        }
    }

    if (shouldEnforceFallback || (isFirstRouteInNavigator && fallbackRoute)) {
        navigate(fallbackRoute, CONST.NAVIGATION.TYPE.UP);
        return;
    }

    const isCentralPaneFocused = isCentralPaneName(findFocusedRoute(navigationRef.current.getState())?.name);
    const distanceFromPathInRootNavigator = getDistanceFromPathInRootNavigator(fallbackRoute ?? '');

    if (isCentralPaneFocused && fallbackRoute) {
        // Allow CentralPane to use UP with fallback route if the path is not found in root navigator.
        if (distanceFromPathInRootNavigator === -1) {
            navigate(fallbackRoute, CONST.NAVIGATION.TYPE.UP);
            return;
        }

        // Add possibility to go back more than one screen in root navigator if that screen is on the stack.
        if (distanceFromPathInRootNavigator > 0) {
            navigationRef.current.dispatch(StackActions.pop(distanceFromPathInRootNavigator));
            return;
        }
    }

    // If the central pane is focused, it's possible that we navigated from other central pane with different matching bottom tab.
    if (isCentralPaneFocused) {
        const rootState = navigationRef.getRootState();
        const stateAfterPop = {routes: rootState.routes.slice(0, -1)} as State<RootStackParamList>;
        const topmostCentralPaneRouteAfterPop = getTopmostCentralPaneRoute(stateAfterPop);

        const topmostBottomTabRoute = getTopmostBottomTabRoute(rootState as State<RootStackParamList>);
        const matchingBottomTabRoute = getMatchingBottomTabRouteForState(stateAfterPop);

        // If the central pane is defined after the pop action, we need to check if it's synced with the bottom tab screen.
        // If not, we need to pop to the bottom tab screen/screens to sync it with the new central pane.
        if (topmostCentralPaneRouteAfterPop && topmostBottomTabRoute?.name !== matchingBottomTabRoute.name) {
            const bottomTabNavigator = rootState.routes.find((item: NavigationStateRoute) => item.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR)?.state;

            if (bottomTabNavigator && bottomTabNavigator.index) {
                const matchingIndex = bottomTabNavigator.routes.findLastIndex((item) => item.name === matchingBottomTabRoute.name);
                const indexToPop = matchingIndex !== -1 ? bottomTabNavigator.index - matchingIndex : undefined;
                navigationRef.current.dispatch({...StackActions.pop(indexToPop), target: bottomTabNavigator?.key});
            }
        }
    }

    navigationRef.current.goBack();
}

/**
 * Close the current screen and navigate to the route.
 * If the current screen is the first screen in the navigator, we force using the fallback route to replace the current screen.
 * It's useful in a case where we want to close an RHP and navigate to another RHP to prevent any blink effect.
 */
function closeAndNavigate(route: Route) {
    if (!navigationRef.current) {
        return;
    }

    const isFirstRouteInNavigator = !getActiveRouteIndex(navigationRef.current.getState());
    if (isFirstRouteInNavigator) {
        goBack(route, true);
        return;
    }
    goBack();
    navigate(route);
}

/**
 * Reset the navigation state to Home page
 */
function resetToHome() {
    const rootState = navigationRef.getRootState();
    const bottomTabKey = rootState.routes.find((item: NavigationStateRoute) => item.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR)?.state?.key;
    if (bottomTabKey) {
        navigationRef.dispatch({...StackActions.popToTop(), target: bottomTabKey});
    }
    navigationRef.dispatch({...StackActions.popToTop(), target: rootState.key});
}

/**
 * Update route params for the specified route.
 */
function setParams(params: Record<string, unknown>, routeKey = '') {
    navigationRef.current?.dispatch({
        ...CommonActions.setParams(params),
        source: routeKey,
    });
}

/**
 * Returns the current active route without the URL params
 */
function getActiveRouteWithoutParams(): string {
    return getActiveRoute().replace(/\?.*/, '');
}

/** Returns the active route name from a state event from the navigationRef  */
function getRouteNameFromStateEvent(event: EventArg<'state', false, NavigationContainerEventMap['state']['data']>): string | undefined {
    if (!event.data.state) {
        return;
    }
    const currentRouteName = event.data.state.routes.at(-1)?.name;

    // Check to make sure we have a route name
    if (currentRouteName) {
        return currentRouteName;
    }
}

/**
 * Navigate to the route that we originally intended to go to
 * but the NavigationContainer was not ready when navigate() was called
 */
function goToPendingRoute() {
    if (pendingRoute === null) {
        return;
    }
    Log.hmmm(`[Navigation] Container now ready, going to pending route: ${pendingRoute}`);
    navigate(pendingRoute);
    pendingRoute = null;
}

function isNavigationReady(): Promise<void> {
    return navigationIsReadyPromise;
}

function setIsNavigationReady() {
    goToPendingRoute();
    resolveNavigationIsReadyPromise();
}

/**
 * Checks if the navigation state contains routes that are protected (over the auth wall).
 *
 * @param state - react-navigation state object
 */
function navContainsProtectedRoutes(state: State | undefined): boolean {
    if (!state?.routeNames || !Array.isArray(state.routeNames)) {
        return false;
    }

    // If one protected screen is in the routeNames then other screens are there as well.
    return state?.routeNames.includes(PROTECTED_SCREENS.CONCIERGE);
}

/**
 * Waits for the navigation state to contain protected routes specified in PROTECTED_SCREENS constant.
 * If the navigation is in a state, where protected routes are available, the promise resolve immediately.
 *
 * @function
 * @returns A promise that resolves when the one of the PROTECTED_SCREENS screen is available in the nav tree.
 *
 * @example
 * waitForProtectedRoutes()
 *     .then(()=> console.log('Protected routes are present!'))
 */
function waitForProtectedRoutes() {
    return new Promise<void>((resolve) => {
        isNavigationReady().then(() => {
            const currentState = navigationRef.current?.getState();
            if (navContainsProtectedRoutes(currentState)) {
                resolve();
                return;
            }

            const unsubscribe = navigationRef.current?.addListener('state', ({data}) => {
                const state = data?.state;
                if (navContainsProtectedRoutes(state)) {
                    unsubscribe?.();
                    resolve();
                }
            });
        });
    });
}

function navigateWithSwitchPolicyID(params: SwitchPolicyIDParams) {
    if (!canNavigate('navigateWithSwitchPolicyID')) {
        return;
    }

    return switchPolicyID(navigationRef.current, params);
}

function getTopMostCentralPaneRouteFromRootState() {
    return getTopmostCentralPaneRoute(navigationRef.getRootState() as State<RootStackParamList>);
}

export default {
    setShouldPopAllStateOnUP,
    navigate,
    setParams,
    dismissModal,
    dismissModalWithReport,
    isActiveRoute,
    getActiveRoute,
    getActiveRouteWithoutParams,
    getReportRHPActiveRoute,
    closeAndNavigate,
    goBack,
    isNavigationReady,
    setIsNavigationReady,
    getTopmostReportId,
    getRouteNameFromStateEvent,
    getTopmostReportActionId,
    waitForProtectedRoutes,
    parseHybridAppUrl,
    navigateWithSwitchPolicyID,
    resetToHome,
    closeRHPFlow,
    setNavigationActionToMicrotaskQueue,
    getTopMostCentralPaneRouteFromRootState,
};

export {navigationRef};
