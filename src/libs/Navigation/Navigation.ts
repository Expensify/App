import {getActionFromState} from '@react-navigation/core';
import type {EventArg, NavigationAction, NavigationContainerEventMap} from '@react-navigation/native';
import {CommonActions, getPathFromState, StackActions} from '@react-navigation/native';
// eslint-disable-next-line you-dont-need-lodash-underscore/omit
import omit from 'lodash/omit';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {Writable} from 'type-fest';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import {shallowCompare} from '@libs/ObjectUtils';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import {doesReportBelongToWorkspace, generateReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import ROUTES, {HYBRID_APP_ROUTES} from '@src/ROUTES';
import SCREENS, {PROTECTED_SCREENS} from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getInitialSplitNavigatorState from './AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import originalCloseRHPFlow from './helpers/closeRHPFlow';
import getPolicyIDFromState from './helpers/getPolicyIDFromState';
import getStateFromPath from './helpers/getStateFromPath';
import getTopmostReportParams from './helpers/getTopmostReportParams';
import isReportOpenInRHP from './helpers/isReportOpenInRHP';
import isSideModalNavigator from './helpers/isSideModalNavigator';
import linkTo from './helpers/linkTo';
import getMinimalAction from './helpers/linkTo/getMinimalAction';
import type {LinkToOptions} from './helpers/linkTo/types';
import replaceWithSplitNavigator from './helpers/replaceWithSplitNavigator';
import setNavigationActionToMicrotaskQueue from './helpers/setNavigationActionToMicrotaskQueue';
import switchPolicyID from './helpers/switchPolicyID';
import {linkingConfig} from './linkingConfig';
import navigationRef from './navigationRef';
import type {NavigationPartialRoute, NavigationRoute, NavigationStateRoute, RootNavigatorParamList, State} from './types';

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

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

/**
 * Checks if the navigationRef is ready to perform a method.
 */
function canNavigate(methodName: string, params: Record<string, unknown> = {}): boolean {
    if (navigationRef.isReady()) {
        return true;
    }
    Log.hmmm(`[Navigation] ${methodName} failed because navigation ref was not yet ready`, params);
    return false;
}

/**
 * Extracts from the topmost report its id.
 */
const getTopmostReportId = (state = navigationRef.getState()) => getTopmostReportParams(state)?.reportID;

/**
 * Extracts from the topmost report its action id.
 */
const getTopmostReportActionId = (state = navigationRef.getState()) => getTopmostReportParams(state)?.reportActionID;

/**
 * Re-exporting the closeRHPFlow here to fill in default value for navigationRef. The closeRHPFlow isn't defined in this file to avoid cyclic dependencies.
 */
const closeRHPFlow = (ref = navigationRef) => originalCloseRHPFlow(ref);

/**
 * Function that generates dynamic urls from paths passed from OldDot.
 */
function parseHybridAppUrl(url: HybridAppRoute | Route): Route {
    switch (url) {
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, generateReportID());
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, generateReportID());
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE:
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, generateReportID());
        default:
            return url;
    }
}

/**
 * Returns the current active route.
 */
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
/**
 * Returns the route of a report opened in RHP.
 */
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
 * Navigates to a specified route.
 * Main navigation method for redirecting to a route.
 *
 * @param route - The route to navigate to.
 * @param options - Optional navigation options.
 * @param options.forceReplace - If true, the navigation action will replace the current route instead of pushing a new one.
 */
function navigate(route: Route, options?: LinkToOptions) {
    if (!canNavigate('navigate', {route})) {
        // Store intended route if the navigator is not yet available,
        // we will try again after the NavigationContainer is ready
        Log.hmmm(`[Navigation] Container not yet ready, storing route as pending: ${route}`);
        pendingRoute = route;
        return;
    }

    linkTo(navigationRef.current, route, options);
}

/**
 * When routes are compared to determine whether the fallback route passed to the goUp function is in the state,
 * these parameters shouldn't be included in the comparison.
 */
const routeParamsIgnore = ['path', 'initial', 'params', 'state', 'screen', 'policyID'];

/**
 * @private
 * If we use destructuring, we will get an error if any of the ignored properties are not present in the object.
 */
function getRouteParamsToCompare(routeParams: Record<string, string | undefined>) {
    return omit(routeParams, routeParamsIgnore);
}

/**
 * @private
 * Private method used in goUp to determine whether a target route is present in the navigation state.
 */
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

/**
 * @private
 * Checks whether the given state is the root navigator state
 */
function isRootNavigatorState(state: State): state is State<RootNavigatorParamList> {
    return state.key === navigationRef.current?.getRootState().key;
}

type GoBackOptions = {
    /**
     * If we should compare params when searching for a route in state to go up to.
     * There are situations where we want to compare params when going up e.g. goUp to a specific report.
     * Sometimes we want to go up and update params of screen e.g. country picker.
     * In that case we want to goUp to a country picker with any params so we don't compare them.
     */
    compareParams?: boolean;

    /**
     * Specifies whether goBack should pop to top when invoked.
     * Additionaly, to execute popToTop, set the value of the global variable ShouldPopAllStateOnUP to true using the setShouldPopAllStateOnUP function.
     */
    shouldPopToTop?: boolean;
};

const defaultGoBackOptions: Required<GoBackOptions> = {
    compareParams: true,
    shouldPopToTop: false,
};

/**
 * @private
 * Navigate to the given backToRoute taking into account whether it is possible to go back to this screen. Within one nested navigator, we can go back by any number
 * of screens, but if as a result of going back we would have to remove more than one screen from the rootState,
 * replace is performed so as not to lose the visited pages.
 * If backToRoute is not found in the state, replace is also called then.
 *
 * @param backToRoute - The route to go up.
 * @param options - Optional configuration that affects navigation logic, such as parameter comparison.
 */
function goUp(backToRoute: Route, options?: GoBackOptions) {
    if (!canNavigate('goUp') || !navigationRef.current) {
        Log.hmmm(`[Navigation] Unable to go up. Can't navigate.`);
        return;
    }

    const compareParams = options?.compareParams ?? defaultGoBackOptions.compareParams;

    const rootState = navigationRef.current.getRootState();
    const stateFromPath = getStateFromPath(backToRoute);

    const action = getActionFromState(stateFromPath, linkingConfig.config);

    if (!action) {
        Log.hmmm(`[Navigation] Unable to go up. Action is undefined.`);
        return;
    }

    const {action: minimalAction, targetState} = getMinimalAction(action, rootState);

    if (minimalAction.type !== CONST.NAVIGATION.ACTION_TYPE.NAVIGATE || !targetState) {
        Log.hmmm('[Navigation] Unable to go up. Minimal action type is wrong.');
        return;
    }

    const indexOfBackToRoute = targetState.routes.findLastIndex((route) => doesRouteMatchToMinimalActionPayload(route, minimalAction, compareParams));
    const distanceToPop = targetState.routes.length - indexOfBackToRoute - 1;

    // If we need to pop more than one route from rootState, we replace the current route to not lose visited routes from the navigation state
    if (indexOfBackToRoute === -1 || (isRootNavigatorState(targetState) && distanceToPop > 1)) {
        const replaceAction = {...minimalAction, type: CONST.NAVIGATION.ACTION_TYPE.REPLACE} as NavigationAction;
        navigationRef.current.dispatch(replaceAction);
        return;
    }

    /**
     * If we are not comparing params, we want to use navigate action because it will replace params in the route already existing in the state if necessary.
     * This part will need refactor after migrating to react-navigation 7. We will use popTo instead.
     */
    if (!compareParams) {
        navigationRef.current.dispatch(minimalAction);
        return;
    }

    navigationRef.current.dispatch({...StackActions.pop(distanceToPop), target: targetState.key});
}

/**
 * @param backToRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param options - Optional configuration that affects navigation logic
 */
function goBack(backToRoute?: Route, options?: GoBackOptions) {
    if (!canNavigate('goBack')) {
        return;
    }

    if (options?.shouldPopToTop) {
        if (shouldPopAllStateOnUP) {
            shouldPopAllStateOnUP = false;
            navigationRef.current?.dispatch(StackActions.popToTop());
            return;
        }
    }

    if (backToRoute) {
        goUp(backToRoute, options);
        return;
    }

    if (!navigationRef.current?.canGoBack()) {
        Log.hmmm('[Navigation] Unable to go back');
        return;
    }

    navigationRef.current?.goBack();
}

/**
 * Reset the navigation state to Home page.
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
    const payload = getInitialSplitNavigatorState({name: SCREENS.HOME}, splitNavigatorMainScreen);
    navigationRef.dispatch({payload, type: CONST.NAVIGATION.ACTION_TYPE.REPLACE, target: rootState.key});
}

/**
 * The goBack function doesn't support recursive pop e.g. pop route from root and then from nested navigator.
 * There is only one case where recursive pop is needed which is going back to home.
 * This function will cover this case.
 * We will implement recursive pop if more use cases will appear.
 */
function goBackToHome() {
    const isNarrowLayout = getIsNarrowLayout();

    // This set the right split navigator.
    goBack(ROUTES.HOME);

    // We want to keep the report screen in the split navigator on wide layout.
    if (!isNarrowLayout) {
        return;
    }

    // This set the right route in this split navigator.
    goBack(ROUTES.HOME);
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
 * Returns the current active route without the URL params.
 */
function getActiveRouteWithoutParams(): string {
    return getActiveRoute().replace(/\?.*/, '');
}

/**
 * Returns the active route name from a state event from the navigationRef.
 */
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
 * @private
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
 * @private
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

type NavigateToReportWithPolicyCheckPayload = {report?: OnyxEntry<Report>; reportID?: string; reportActionID?: string; referrer?: string; policyIDToCheck?: string};

/**
 * Navigates to a report passed as a param (as an id or report object) and checks whether the target object belongs to the currently selected workspace.
 * If not, the current workspace is set to global.
 */
function navigateToReportWithPolicyCheck({report, reportID, reportActionID, referrer, policyIDToCheck}: NavigateToReportWithPolicyCheckPayload, ref = navigationRef) {
    const targetReport = reportID ? {reportID, ...allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]} : report;
    const policyID = policyIDToCheck ?? getPolicyIDFromState(navigationRef.getRootState() as State<RootNavigatorParamList>);
    const policyMemberAccountIDs = getPolicyEmployeeAccountIDs(policyID);
    const shouldOpenAllWorkspace = isEmptyObject(targetReport) ? true : !doesReportBelongToWorkspace(targetReport, policyMemberAccountIDs, policyID);

    if ((shouldOpenAllWorkspace && !policyID) || !shouldOpenAllWorkspace) {
        linkTo(ref.current, ROUTES.REPORT_WITH_ID.getRoute(targetReport?.reportID, reportActionID, referrer));
        return;
    }

    const params: Record<string, string | undefined> = {
        reportID: targetReport?.reportID,
    };

    if (reportActionID) {
        params.reportActionID = reportActionID;
    }

    if (referrer) {
        params.referrer = referrer;
    }

    ref.dispatch(
        StackActions.push(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {
            policyID: undefined,
            screen: SCREENS.REPORT,
            params,
        }),
    );
}

function getReportRouteByID(reportID?: string, routes: NavigationRoute[] = navigationRef.getRootState().routes): NavigationRoute | null {
    if (!reportID || !routes?.length) {
        return null;
    }
    for (const route of routes) {
        if (route.name === SCREENS.REPORT && !!route.params && 'reportID' in route.params && route.params.reportID === reportID) {
            return route;
        }
        if (route.state?.routes) {
            const partialRoute = getReportRouteByID(reportID, route.state.routes);
            if (partialRoute) {
                return partialRoute;
            }
        }
    }
    return null;
}

/**
 * Closes the modal navigator (RHP, LHP, onboarding).
 */
const dismissModal = (reportID?: string, ref = navigationRef) => {
    isNavigationReady().then(() => {
        ref.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL});
        if (!reportID) {
            return;
        }
        navigateToReportWithPolicyCheck({reportID});
    });
};

/**
 * Dismisses the modal and opens the given report.
 */
const dismissModalWithReport = (report: OnyxEntry<Report>, ref = navigationRef) => {
    isNavigationReady().then(() => {
        ref.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL});
        navigateToReportWithPolicyCheck({report});
    });
};

/**
 * Returns to the first screen in the stack, dismissing all the others, only if the global variable shouldPopAllStateOnUP is set to true.
 */
function popToTop() {
    if (!shouldPopAllStateOnUP) {
        goBack();
        return;
    }

    shouldPopAllStateOnUP = false;
    navigationRef.current?.dispatch(StackActions.popToTop());
}

function popRootToTop() {
    const rootState = navigationRef.getRootState();
    navigationRef.current?.dispatch({...StackActions.popToTop(), target: rootState.key});
}

function removeScreenFromNavigationState(screen: string) {
    isNavigationReady().then(() => {
        navigationRef.current?.dispatch((state) => {
            const routes = state.routes?.filter((item) => item.name !== screen);
            return CommonActions.reset({
                ...state,
                routes,
                index: routes.length < state.routes.length ? state.index - 1 : state.index,
            });
        });
    });
}

function isTopmostRouteModalScreen() {
    const topmostRouteName = navigationRef.getRootState()?.routes?.at(-1)?.name;
    return isSideModalNavigator(topmostRouteName);
}

function removeScreenByKey(key: string) {
    isNavigationReady().then(() => {
        navigationRef.current?.dispatch((state) => {
            const routes = state.routes?.filter((item) => item.key !== key);
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
    resetToHome,
    goBackToHome,
    closeRHPFlow,
    setNavigationActionToMicrotaskQueue,
    navigateToReportWithPolicyCheck,
    popToTop,
    popRootToTop,
    removeScreenFromNavigationState,
    removeScreenByKey,
    getReportRouteByID,
    switchPolicyID,
    replaceWithSplitNavigator,
    isTopmostRouteModalScreen,
};

export {navigationRef};
