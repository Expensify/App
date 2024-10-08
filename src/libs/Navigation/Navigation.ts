import {getActionFromState} from '@react-navigation/core';
import type {EventArg, NavigationAction, NavigationContainerEventMap} from '@react-navigation/native';
import {CommonActions, getPathFromState, StackActions} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Writable} from 'type-fest';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import {removePolicyIDParamFromState} from '@libs/NavigationUtils';
import {shallowCompare} from '@libs/ObjectUtils';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import ROUTES, {HYBRID_APP_ROUTES} from '@src/ROUTES';
import SCREENS, {PROTECTED_SCREENS} from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import originalCloseRHPFlow from './closeRHPFlow';
import getPolicyIDFromState from './getPolicyIDFromState';
import getStateFromPath from './getStateFromPath';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import originalGetTopmostReportActionId from './getTopmostReportActionID';
import originalGetTopmostReportId from './getTopmostReportId';
import isReportOpenInRHP from './isReportOpenInRHP';
import linkingConfig from './linkingConfig';
import createSplitNavigator from './linkingConfig/createSplitNavigator';
import linkTo from './linkTo';
import getMinimalAction from './linkTo/getMinimalAction';
import navigationRef from './navigationRef';
import setNavigationActionToMicrotaskQueue from './setNavigationActionToMicrotaskQueue';
import type {NavigationPartialRoute, NavigationStateRoute, RootStackParamList, SplitNavigatorLHNScreen, SplitNavigatorParamListType, State, StateOrRoute} from './types';

const SPLIT_NAVIGATOR_TO_SIDEBAR_MAP: Record<keyof SplitNavigatorParamListType, SplitNavigatorLHNScreen> = {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: SCREENS.HOME,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: SCREENS.SETTINGS.ROOT,
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: SCREENS.WORKSPACE.INITIAL,
};

function getSidebarScreenParams(splitNavigatorRoute: NavigationStateRoute) {
    if (splitNavigatorRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
        return splitNavigatorRoute.state?.routes?.at(0)?.params;
    }

    return undefined;
}

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

// Re-exporting the closeRHPFlow here to fill in default value for navigationRef. The closeRHPFlow isn't defined in this file to avoid cyclic dependencies.
const closeRHPFlow = (ref = navigationRef) => originalCloseRHPFlow(ref);

// Re-exporting the dismissModalWithReport here to fill in default value for navigationRef. The dismissModalWithReport isn't defined in this file to avoid cyclic dependencies.
// This method is needed because it allows to dismiss the modal and then open the report. Within this method is checked whether the report belongs to a specific workspace. Sometimes the report we want to check, hasn't been added to the Onyx yet.
// Then we can pass the report as a param without getting it from the Onyx.

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
        (stateOrRoute.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR || stateOrRoute.name === NAVIGATORS.LEFT_MODAL_NAVIGATOR || stateOrRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR)
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
function getDistanceFromPathInRootNavigator(state: State, path?: string): number {
    let currentState = {...state};

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

function doesRouteMatchToMinimalActionPayload(route: NavigationStateRoute | NavigationPartialRoute, minimalAction: Writable<NavigationAction>) {
    if (!minimalAction.payload) {
        return false;
    }

    if (!('name' in minimalAction.payload)) {
        return false;
    }

    const areRouteNamesEqual = route.name === minimalAction.payload.name;

    if (!areRouteNamesEqual) {
        return false;
    }

    if (!('params' in minimalAction.payload)) {
        return false;
    }

    // @TODO: Fix params comparison. When comparing split navigators params, it may happen that first one has parameters with the initial settings and the second one does not.
    return shallowCompare(route.params as Record<string, string | undefined>, minimalAction.payload.params as Record<string, string | undefined>);
}

function goUp(fallbackRoute: Route) {
    if (!canNavigate('goBack')) {
        return;
    }

    if (!navigationRef.current) {
        Log.hmmm('[Navigation] Unable to go up');
        return;
    }

    const rootState = navigationRef.current.getRootState();
    const stateFromPath = getStateFromPath(fallbackRoute);
    const action = getActionFromState(stateFromPath, linkingConfig.config);

    if (!action) {
        return;
    }

    const {action: minimalAction, targetState} = getMinimalAction(action, rootState);

    if (minimalAction.type !== CONST.NAVIGATION.ACTION_TYPE.NAVIGATE || !targetState) {
        return;
    }

    const indexOfFallbackRoute = targetState.routes.findLastIndex((route) => doesRouteMatchToMinimalActionPayload(route, minimalAction));

    if (indexOfFallbackRoute === -1) {
        const replaceAction = {...minimalAction, type: 'REPLACE'} as NavigationAction;
        navigationRef.current.dispatch(replaceAction);
        return;
    }

    const distanceToPop = targetState.routes.length - indexOfFallbackRoute - 1;
    navigationRef.current.dispatch({...StackActions.pop(distanceToPop), target: targetState.key});
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

    if (fallbackRoute) {
        goUp(fallbackRoute);
        return;
    }

    const rootState = navigationRef.current?.getRootState();
    const lastRoute = rootState?.routes.at(-1);

    const canGoBack = navigationRef.current?.canGoBack();

    if (!canGoBack && lastRoute?.name.endsWith('SplitNavigator') && lastRoute?.state?.routes?.length === 1) {
        const splitNavigatorName = lastRoute?.name as keyof SplitNavigatorParamListType;
        const name = SPLIT_NAVIGATOR_TO_SIDEBAR_MAP[splitNavigatorName];
        const params = getSidebarScreenParams(lastRoute);
        navigationRef.dispatch({
            type: 'REPLACE',
            payload: {
                name,
                params,
            },
        });
        return;
    }

    if (!canGoBack) {
        Log.hmmm('[Navigation] Unable to go back');
        return;
    }

    navigationRef.current?.goBack();
}

/**
 * Reset the navigation state to Home page
 */
function resetToHome() {
    const isNarrowLayout = getIsNarrowLayout();
    const rootState = navigationRef.getRootState();
    navigationRef.dispatch({...StackActions.popToTop(), target: rootState.key});
    const splitNavigatorMainScreen = !isNarrowLayout
        ? {
              name: SCREENS.REPORT,
          }
        : undefined;
    const payload = createSplitNavigator({name: SCREENS.HOME}, splitNavigatorMainScreen);
    navigationRef.dispatch({payload, type: 'REPLACE', target: rootState.key});
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

function getTopMostCentralPaneRouteFromRootState() {
    return getTopmostCentralPaneRoute(navigationRef.getRootState() as State<RootStackParamList>);
}

function switchPolicyID(policyID?: string) {
    navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID, payload: {policyID}});
}

type NavigateToReportWithPolicyCheckPayload = {report?: OnyxEntry<Report>; reportID?: string; reportActionID?: string; referrer?: string; policyIDToCheck?: string};

function navigateToReportWithPolicyCheck({report, reportID, reportActionID, referrer, policyIDToCheck}: NavigateToReportWithPolicyCheckPayload, ref = navigationRef) {
    const targetReport = reportID ? ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] : report;
    if (!targetReport) {
        return;
    }

    const policyID = policyIDToCheck ?? getPolicyIDFromState(navigationRef.getRootState() as State<RootStackParamList>);
    const policyMemberAccountIDs = getPolicyEmployeeAccountIDs(policyID);
    const shouldOpenAllWorkspace = isEmptyObject(targetReport) ? true : !ReportUtils.doesReportBelongToWorkspace(targetReport, policyMemberAccountIDs, policyID);

    if ((shouldOpenAllWorkspace && !policyID) || !shouldOpenAllWorkspace) {
        linkTo(ref.current, ROUTES.REPORT_WITH_ID.getRoute(targetReport.reportID, reportActionID, referrer));
        return;
    }

    const params: Record<string, string> = {
        reportID: targetReport.reportID,
    };

    if (reportActionID) {
        params.reportActionID = reportActionID;
    }

    if (referrer) {
        params.referrer = referrer;
    }

    ref.dispatch(
        StackActions.push(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {
            policyID: null,
            screen: SCREENS.REPORT,
            params,
        }),
    );
}

const dismissModal = (reportID?: string, ref = navigationRef) => {
    ref.dispatch({type: 'DISMISS_MODAL'});
    if (!reportID) {
        return;
    }
    navigateToReportWithPolicyCheck({reportID});
};
const dismissModalWithReport = (report: OnyxEntry<Report>) => {
    dismissModal();
    navigateToReportWithPolicyCheck({report});
};

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
    goBack,
    isNavigationReady,
    setIsNavigationReady,
    getTopmostReportId,
    getRouteNameFromStateEvent,
    getTopmostReportActionId,
    waitForProtectedRoutes,
    parseHybridAppUrl,
    switchPolicyID,
    resetToHome,
    closeRHPFlow,
    setNavigationActionToMicrotaskQueue,
    getTopMostCentralPaneRouteFromRootState,
    navigateToReportWithPolicyCheck,
    goUp,
};

export {navigationRef};
