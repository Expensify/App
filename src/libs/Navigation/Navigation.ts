import {findFocusedRoute, getActionFromState} from '@react-navigation/core';
import type {EventArg, NavigationAction, NavigationContainerEventMap} from '@react-navigation/native';
import {CommonActions, getPathFromState, StackActions} from '@react-navigation/native';
// eslint-disable-next-line you-dont-need-lodash-underscore/omit
import omit from 'lodash/omit';
import type {OnyxEntry} from 'react-native-onyx';
import type {Writable} from 'type-fest';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import {isSplitNavigatorName} from '@libs/NavigationUtils';
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
import type {Screen} from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import originalCloseRHPFlow from './closeRHPFlow';
import getPolicyIDFromState from './getPolicyIDFromState';
import getStateFromPath from './getStateFromPath';
import originalGetTopmostReportActionId from './getTopmostReportActionID';
import originalGetTopmostReportId from './getTopmostReportId';
import isReportOpenInRHP from './isReportOpenInRHP';
import linkingConfig from './linkingConfig';
import createSplitNavigator from './linkingConfig/createSplitNavigator';
import linkTo from './linkTo';
import convertReportPath from './linkTo/helpers/convertReportPath';
import getMinimalAction from './linkTo/helpers/getMinimalAction';
import shouldConvertReportPath from './linkTo/helpers/shouldConvertReportPath';
import type {LinkToOptions} from './linkTo/types';
import navigationRef from './navigationRef';
import setNavigationActionToMicrotaskQueue from './setNavigationActionToMicrotaskQueue';
import type {NavigationPartialRoute, NavigationStateRoute, RootStackParamList, SplitNavigatorLHNScreen, SplitNavigatorParamListType, State} from './types';

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
function navigate(route: Route = ROUTES.HOME, options?: LinkToOptions) {
    if (!canNavigate('navigate', {route})) {
        // Store intended route if the navigator is not yet available,
        // we will try again after the NavigationContainer is ready
        Log.hmmm(`[Navigation] Container not yet ready, storing route as pending: ${route}`);
        pendingRoute = route;
        return;
    }
    // linkTo(navigationRef.current, route, type, isActiveRoute(route));
    linkTo(navigationRef.current, route, options);
}

const routeParamsIgnore = ['path', 'initial', 'params', 'state', 'screen', 'policyID'];

// If we use destructuring, we will get an error if any of the ignored properties are not present in the object.
function getRouteParamsToCompare(routeParams: Record<string, string | undefined>) {
    return omit(routeParams, routeParamsIgnore);
}

function doesRouteMatchToMinimalActionPayload(route: NavigationStateRoute | NavigationPartialRoute, minimalAction: Writable<NavigationAction>, compareParams: boolean) {
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

    if (!compareParams) {
        return true;
    }

    if (!('params' in minimalAction.payload)) {
        return false;
    }

    const routeParams = getRouteParamsToCompare(route.params as Record<string, string | undefined>);
    const minimalActionParams = getRouteParamsToCompare(minimalAction.payload.params as Record<string, string | undefined>);

    return shallowCompare(routeParams, minimalActionParams);
}

type GoUpOptions = {
    /** If we should compare params when searching for a route in state to go up to.
     * There are situations where we want to compare params when going up e.g. goUp to a specific report.
     * Sometimes we want to go up and update params of screen e.g. country picker.
     * In that case we want to goUp to a country picker with any params so we don't compare them. */
    compareParams?: boolean;
};

const defaultGoUpOptions: Required<GoUpOptions> = {
    compareParams: true,
};

function isRootNavigatorState(state: State): state is State<RootStackParamList> {
    return state.key === navigationRef.current?.getRootState().key;
}

function goUp(fallbackRoute: Route, options?: GoUpOptions) {
    const compareParams = options?.compareParams ?? defaultGoUpOptions.compareParams;

    if (!canNavigate('goBack')) {
        return;
    }

    if (!navigationRef.current) {
        Log.hmmm('[Navigation] Unable to go up');
        return;
    }

    const rootState = navigationRef.current.getRootState();
    const stateFromPath = getStateFromPath(fallbackRoute);

    const currentFocusedRoute = findFocusedRoute(rootState);
    const focusedRouteFromPath = findFocusedRoute(stateFromPath);

    if (currentFocusedRoute && focusedRouteFromPath && shouldConvertReportPath(currentFocusedRoute, focusedRouteFromPath)) {
        goUp(convertReportPath(focusedRouteFromPath));
        return;
    }

    const action = getActionFromState(stateFromPath, linkingConfig.config);

    if (!action) {
        return;
    }

    const {action: minimalAction, targetState} = getMinimalAction(action, rootState);

    if (minimalAction.type !== CONST.NAVIGATION.ACTION_TYPE.NAVIGATE || !targetState) {
        return;
    }

    const indexOfFallbackRoute = targetState.routes.findLastIndex((route) => doesRouteMatchToMinimalActionPayload(route, minimalAction, compareParams));

    const distanceToPop = targetState.routes.length - indexOfFallbackRoute - 1;

    // If we need to pop more than one route from rootState, we replace the current route to not lose visited routes from the navigation state
    if (indexOfFallbackRoute === -1 || (isRootNavigatorState(targetState) && distanceToPop > 1)) {
        const replaceAction = {...minimalAction, type: CONST.NAVIGATION.ACTION_TYPE.REPLACE} as NavigationAction;
        navigationRef.current.dispatch(replaceAction);
        return;
    }

    // If we are not comparing params, we want to use navigate action because it will replace params in the route already existing in the state if necessary.
    // This part will need refactor after migrating to react-navigation 7. We will use popTo instead.
    if (!compareParams) {
        navigationRef.current.dispatch(minimalAction);
        return;
    }

    navigationRef.current.dispatch({...StackActions.pop(distanceToPop), target: targetState.key});
}

/**
 * @param fallbackRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param shouldPopToTop - Should we navigate to LHN on back press
 */
function goBack(fallbackRoute?: Route, shouldPopToTop = false) {
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

    if (!canGoBack && isSplitNavigatorName(lastRoute?.name) && lastRoute?.state?.routes?.length === 1) {
        const name = SPLIT_NAVIGATOR_TO_SIDEBAR_MAP[lastRoute.name];
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

function switchPolicyID(policyID?: string) {
    navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID, payload: {policyID}});
}

type NavigateToReportWithPolicyCheckPayload = {report?: OnyxEntry<Report>; reportID?: string; reportActionID?: string; referrer?: string; policyIDToCheck?: string};

function navigateToReportWithPolicyCheck({report, reportID, reportActionID, referrer, policyIDToCheck}: NavigateToReportWithPolicyCheckPayload, ref = navigationRef) {
    const targetReport = reportID ? {reportID, ...ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]} : report;
    const policyID = policyIDToCheck ?? getPolicyIDFromState(navigationRef.getRootState() as State<RootStackParamList>);
    const policyMemberAccountIDs = getPolicyEmployeeAccountIDs(policyID);
    const shouldOpenAllWorkspace = isEmptyObject(targetReport) ? true : !ReportUtils.doesReportBelongToWorkspace(targetReport, policyMemberAccountIDs, policyID);

    if ((shouldOpenAllWorkspace && !policyID) || !shouldOpenAllWorkspace) {
        linkTo(ref.current, ROUTES.REPORT_WITH_ID.getRoute(targetReport?.reportID ?? '-1', reportActionID, referrer));
        return;
    }

    const params: Record<string, string> = {
        reportID: targetReport?.reportID ?? '-1',
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

// @TODO In places where we use dismissModal with report arg we should do dismiss modal and then navigate to the report.
// @TODO There should be a way to not use as string.
// We left it here to limit the number of changed files.
const dismissModal = (reportID?: string, ref = navigationRef) => {
    ref.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL as string});
    if (!reportID) {
        return;
    }
    isNavigationReady().then(() => navigateToReportWithPolicyCheck({reportID}));
};
const dismissModalWithReport = (report: OnyxEntry<Report>) => {
    dismissModal();
    isNavigationReady().then(() => navigateToReportWithPolicyCheck({report}));
};

function removeScreenFromNavigationState(screen: Screen) {
    isNavigationReady().then(() => {
        navigationRef.dispatch((state) => {
            const routes = state.routes?.filter((item) => item.name !== screen);

            return CommonActions.reset({
                ...state,
                routes,
                index: routes.length < state.routes.length ? state.index - 1 : state.index,
            });
        });
    });
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
    navigateToReportWithPolicyCheck,
    goUp,
    removeScreenFromNavigationState,
};

export {navigationRef};
