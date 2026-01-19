import {findFocusedRoute, getActionFromState} from '@react-navigation/core';
import type {EventArg, NavigationAction, NavigationContainerEventMap, NavigationState} from '@react-navigation/native';
import {CommonActions, getPathFromState, StackActions} from '@react-navigation/native';
import {Str} from 'expensify-common';
// eslint-disable-next-line you-dont-need-lodash-underscore/omit
import omit from 'lodash/omit';
import {DeviceEventEmitter, Dimensions, InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {Writable} from 'type-fest';
import {ALL_WIDE_RIGHT_MODALS, SUPER_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';
import SidePanelActions from '@libs/actions/SidePanel';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import {shallowCompare} from '@libs/ObjectUtils';
import {getSpan, startSpan} from '@libs/telemetry/activeSpans';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS, {PROTECTED_SCREENS} from '@src/SCREENS';
import type {SidePanel} from '@src/types/onyx';
import getInitialSplitNavigatorState from './AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import originalCloseRHPFlow from './helpers/closeRHPFlow';
import getStateFromPath from './helpers/getStateFromPath';
import getTopmostReportParams from './helpers/getTopmostReportParams';
import {isFullScreenName, isOnboardingFlowName, isSplitNavigatorName} from './helpers/isNavigatorName';
import isReportOpenInRHP from './helpers/isReportOpenInRHP';
import isSideModalNavigator from './helpers/isSideModalNavigator';
import linkTo from './helpers/linkTo';
import getMinimalAction from './helpers/linkTo/getMinimalAction';
import type {LinkToOptions} from './helpers/linkTo/types';
import replaceWithSplitNavigator from './helpers/replaceWithSplitNavigator';
import setNavigationActionToMicrotaskQueue from './helpers/setNavigationActionToMicrotaskQueue';
import {linkingConfig} from './linkingConfig';
import {SPLIT_TO_SIDEBAR} from './linkingConfig/RELATIONS';
import navigationRef from './navigationRef';
import type {
    NavigationPartialRoute,
    NavigationRef,
    NavigationRoute,
    NavigationStateRoute,
    ReportsSplitNavigatorParamList,
    RightModalNavigatorParamList,
    RootNavigatorParamList,
    State,
} from './types';

let sidePanelNVP: OnyxEntry<SidePanel>;
// `connectWithoutView` is used here because we want to avoid unnecessary re-renders when the side panel NVP changes
// Also it is not directly connected to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_SIDE_PANEL,
    callback: (value) => {
        sidePanelNVP = value;
    },
});

let resolveNavigationIsReadyPromise: () => void;
const navigationIsReadyPromise = new Promise<void>((resolve) => {
    resolveNavigationIsReadyPromise = resolve;
});

let pendingNavigationCall: {route: Route; options?: LinkToOptions} | null = null;

let shouldPopToSidebar = false;

/**
 * Inform the navigation that next time user presses UP we should pop all the state back to LHN.
 */
function setShouldPopToSidebar(shouldPopAllStateFlag: boolean) {
    shouldPopToSidebar = shouldPopAllStateFlag;
}

/**
 * Returns shouldPopToSidebar variable used to determine whether should we pop all state back to LHN
 * @returns shouldPopToSidebar
 */
function getShouldPopToSidebar() {
    return shouldPopToSidebar;
}

type CanNavigateParams = {
    route?: Route;
    backToRoute?: Route;
};

/**
 * Checks if the route can be navigated to based on whether the navigation ref is ready.
 */
function canNavigate(methodName: string, params: CanNavigateParams = {}): boolean {
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
 * Close the side panel on narrow layout when navigating to a different screen.
 */
function closeSidePanelOnNarrowScreen() {
    const isExtraLargeScreenWidth = Dimensions.get('window').width > variables.sidePanelResponsiveWidthBreakpoint;

    if (!sidePanelNVP?.openNarrowScreen || isExtraLargeScreenWidth) {
        return;
    }
    SidePanelActions.closeSidePanel(true);
}

/**
 * Returns the current active route.
 */
function getActiveRoute(): string {
    if (!navigationRef.isReady()) {
        return '';
    }

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
    // Safe handling when navigation is not yet initialized
    if (!navigationRef.isReady()) {
        Log.warn('[src/libs/Navigation/Navigation.ts] NavigationRef is not ready. Returning empty string.');
        return '';
    }
    if (isReportOpenInRHP(navigationRef.getRootState())) {
        return getActiveRoute();
    }
    return '';
}

/**
 * Cleans the route path by removing redundant slashes and query parameters.
 * @param routePath The route path to clean.
 * @returns The cleaned route path.
 */
function cleanRoutePath(routePath: string): string {
    return routePath.replaceAll(CONST.REGEX.ROUTES.REDUNDANT_SLASHES, (match, p1) => (p1 ? '/' : '')).replaceAll(/\?.*/g, '');
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
    let activeRoute = getActiveRouteWithoutParams();
    activeRoute = activeRoute.startsWith('/') ? activeRoute.substring(1) : activeRoute;

    // We remove redundant (consecutive and trailing) slashes from path before matching
    return cleanRoutePath(activeRoute) === cleanRoutePath(routePath);
}

/**
 * Navigates to a specified route.
 * Main navigation method for redirecting to a route.
 * For detailed information about moving between screens,
 * see the NAVIGATION.md documentation.
 *
 * @param route - The route to navigate to.
 * @param options - Optional navigation options.
 * @param options.forceReplace - If true, the navigation action will replace the current route instead of pushing a new one.
 */
function navigate(route: Route, options?: LinkToOptions) {
    if (!canNavigate('navigate', {route})) {
        if (!navigationRef.isReady()) {
            // Store intended route if the navigator is not yet available,
            // we will try again after the NavigationContainer is ready
            Log.hmmm(`[Navigation] Container not yet ready, storing route as pending: ${route}`);
            pendingNavigationCall = {route, options};
        }
        return;
    }

    // Start a Sentry span for report navigation
    if (route.startsWith('r/') || route.startsWith('search/r/') || route.startsWith('e/')) {
        const routePath = Str.cutAfter(route, '?');
        const reportIDMatch = route.match(/^(?:search\/)?(?:r|e)\/(\w+)/);
        const reportID = reportIDMatch?.at(1);
        if (reportID) {
            const spanId = `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`;
            let span = getSpan(spanId);
            if (!span) {
                let spanName = '/r/*';
                if (route.startsWith('search/r/')) {
                    spanName = '/search/r/*';
                } else if (route.startsWith('e/')) {
                    spanName = '/e/*';
                }
                span = startSpan(spanId, {
                    name: spanName,
                    op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
                });
            }
            span.setAttributes({
                [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID,
                [CONST.TELEMETRY.ATTRIBUTE_ROUTE_FROM]: getActiveRouteWithoutParams(),
                [CONST.TELEMETRY.ATTRIBUTE_ROUTE_TO]: Str.cutAfter(routePath, '?'),
            });
        }
    }
    linkTo(navigationRef.current, route, options);
    closeSidePanelOnNarrowScreen();
}
/**
 * When routes are compared to determine whether the fallback route passed to the goUp function is in the state,
 * these parameters shouldn't be included in the comparison.
 */
const routeParamsIgnore = ['path', 'initial', 'params', 'state', 'screen', 'policyID', 'pop'];

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
};

const defaultGoBackOptions: Required<GoBackOptions> = {
    compareParams: true,
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
    if (!canNavigate('goUp', {backToRoute}) || !navigationRef.current) {
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
     * If we are not comparing params, we want to use popTo action because it will replace params in the route already existing in the state if necessary.
     */
    if (!compareParams) {
        navigationRef.current.dispatch({...minimalAction, type: CONST.NAVIGATION.ACTION_TYPE.POP_TO});
        return;
    }

    navigationRef.current.dispatch({...StackActions.pop(distanceToPop), target: targetState.key});
}

/**
 * Navigate back to the previous screen or a specified route.
 * For detailed information about navigation patterns and best practices,
 * see the NAVIGATION.md documentation.
 * @param backToRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param options - Optional configuration that affects navigation logic
 */
function goBack(backToRoute?: Route, options?: GoBackOptions) {
    if (!canNavigate('goBack', {backToRoute})) {
        return;
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
 * Navigate back to the sidebar screen in SplitNavigator and pop all central screens from the navigator at the same time.
 * For detailed information about moving between screens,
 * see the NAVIGATION.md documentation.
 */
function popToSidebar() {
    setShouldPopToSidebar(false);

    const rootState = navigationRef.current?.getRootState();
    const currentRoute = rootState?.routes.at(-1);

    if (!currentRoute) {
        Log.hmmm('[popToSidebar] Unable to pop to sidebar, no current root found in navigator');
        return;
    }

    if (!isSplitNavigatorName(currentRoute?.name)) {
        Log.hmmm('[popToSidebar] must be invoked only from SplitNavigator');
        return;
    }

    const topRoute = currentRoute.state?.routes.at(0);
    const lastRoute = currentRoute.state?.routes.at(-1);

    const currentRouteName = currentRoute?.name as keyof typeof SPLIT_TO_SIDEBAR;
    if (topRoute?.name !== SPLIT_TO_SIDEBAR[currentRouteName]) {
        const params = currentRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || currentRoute.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR ? {...lastRoute?.params} : undefined;

        const sidebarName = SPLIT_TO_SIDEBAR[currentRouteName];

        navigationRef.dispatch({payload: {name: sidebarName, params}, type: CONST.NAVIGATION.ACTION_TYPE.REPLACE});
        return;
    }

    navigationRef.current?.dispatch(StackActions.popToTop());
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
    return getActiveRoute().replaceAll(/\?.*/g, '');
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
    if (pendingNavigationCall === null) {
        return;
    }
    Log.hmmm(`[Navigation] Container now ready, going to pending route: ${pendingNavigationCall.route}`);
    navigate(pendingNavigationCall.route, pendingNavigationCall.options);
    pendingNavigationCall = null;
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

function getTopmostSuperWideRHPReportParams(
    state: NavigationState = navigationRef.getRootState(),
): RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT] | RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT] | undefined {
    if (!state) {
        return;
    }
    const topmostRightModalNavigator = state.routes?.at(-1);

    if (!topmostRightModalNavigator || topmostRightModalNavigator.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return;
    }

    const topmostSuperWideRHP = topmostRightModalNavigator.state?.routes.findLast((route) => SUPER_WIDE_RIGHT_MODALS.has(route.name));

    if (!topmostSuperWideRHP) {
        return;
    }

    return topmostSuperWideRHP?.params as
        | RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT]
        | RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT]
        | undefined;
}

/**
 * Get the report ID from the topmost Super Wide RHP modal in the navigation stack.
 */
function getTopmostSuperWideRHPReportID(state: NavigationState = navigationRef.getRootState()): string | undefined {
    const topmostReportParams = getTopmostSuperWideRHPReportParams(state);
    return topmostReportParams?.reportID;
}

/**
 * Closes the modal navigator (RHP, onboarding).
 *
 * @param options - Configuration object
 * @param options.ref - Navigation ref to use (defaults to navigationRef)
 * @param options.callback - Optional callback to execute after the modal has finished closing.
 *                           The callback fires when RightModalNavigator unmounts.
 *
 * For detailed information about dismissing modals,
 * see the NAVIGATION.md documentation.
 */
const dismissModal = ({ref = navigationRef, callback}: {ref?: NavigationRef; callback?: () => void} = {}) => {
    isNavigationReady().then(() => {
        if (callback) {
            const subscription = DeviceEventEmitter.addListener(CONST.MODAL_EVENTS.CLOSED, () => {
                subscription.remove();
                callback();
            });
        }

        ref.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL});
    });
};

/**
 * Dismisses the modal and opens the given report.
 * For detailed information about dismissing modals,
 * see the NAVIGATION.md documentation.
 */
const dismissModalWithReport = ({reportID, reportActionID, referrer, backTo}: ReportsSplitNavigatorParamList[typeof SCREENS.REPORT], ref = navigationRef) => {
    isNavigationReady().then(() => {
        const topmostSuperWideRHPReportID = getTopmostSuperWideRHPReportID();
        let areReportsIDsDefined = !!topmostSuperWideRHPReportID && !!reportID;

        if (topmostSuperWideRHPReportID === reportID && areReportsIDsDefined) {
            dismissToSuperWideRHP();
            return;
        }

        const topmostReportID = getTopmostReportId();
        areReportsIDsDefined = !!topmostReportID && !!reportID;
        const isReportsSplitTopmostFullScreen = ref.getRootState().routes.findLast((route) => isFullScreenName(route.name))?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
        if (topmostReportID === reportID && areReportsIDsDefined && isReportsSplitTopmostFullScreen) {
            dismissModal();
            return;
        }
        const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(reportID, reportActionID, referrer, backTo);
        if (getIsNarrowLayout()) {
            navigate(reportRoute, {forceReplace: true});
            return;
        }
        dismissModal();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            navigate(reportRoute);
        });
    });
};

/**
 * Returns to the first screen in the stack, dismissing all the others, only if the global variable shouldPopToSidebar is set to true.
 */
function popToTop() {
    if (!shouldPopToSidebar) {
        goBack();
        return;
    }

    shouldPopToSidebar = false;
    navigationRef.current?.dispatch(StackActions.popToTop());
}

function popRootToTop() {
    const rootState = navigationRef.getRootState();
    navigationRef.current?.dispatch({...StackActions.popToTop(), target: rootState.key});
}

function pop(target: string) {
    navigationRef.current?.dispatch({...StackActions.pop(), target});
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

function removeReportScreen(reportIDSet: Set<string>) {
    isNavigationReady().then(() => {
        navigationRef.current?.dispatch((state) => {
            const routes = state?.routes.filter((route) => {
                if (route.name === SCREENS.REPORT && route.params && 'reportID' in route.params) {
                    return !reportIDSet.has(route.params?.reportID as string);
                }
                return true;
            });
            return CommonActions.reset({
                ...state,
                routes,
                index: routes.length < state.routes.length ? state.index - 1 : state.index,
            });
        });
    });
}

function isOnboardingFlow() {
    const state = navigationRef.getRootState();
    const currentFocusedRoute = findFocusedRoute(state);
    return isOnboardingFlowName(currentFocusedRoute?.name);
}

function isValidateLoginFlow() {
    const state = navigationRef.getRootState();
    const currentFocusedRoute = findFocusedRoute(state);
    return currentFocusedRoute?.name === SCREENS.VALIDATE_LOGIN;
}

function clearPreloadedRoutes() {
    const rootStateWithoutPreloadedRoutes = {...navigationRef.getRootState(), preloadedRoutes: []} as NavigationState;
    navigationRef.reset(rootStateWithoutPreloadedRoutes);
}

/**
 * When multiple screens are open in RHP, returns to the last modal stack specified in the parameter. If none are found, it dismisses the entire modal.
 *
 * @param modalStackNames - names of the modal stacks we want to dismiss to
 */
function dismissToModalStack(modalStackNames: Set<string>) {
    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return;
    }

    const rhpState = rootState.routes.findLast((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.state;

    if (!rhpState) {
        return;
    }

    const lastFoundModalStackIndex = rhpState.routes.slice(0, -1).findLastIndex((route) => modalStackNames.has(route.name));
    const routesToPop = rhpState.routes.length - lastFoundModalStackIndex - 1;

    if (routesToPop <= 0 || lastFoundModalStackIndex === -1) {
        dismissModal();
        return;
    }

    navigationRef.dispatch({...StackActions.pop(routesToPop), target: rhpState.key});
}

/**
 * Dismiss top layer modal and go back to the Wide/Super Wide RHP.
 */
function dismissToPreviousRHP() {
    return dismissToModalStack(ALL_WIDE_RIGHT_MODALS);
}

function navigateBackToLastSuperWideRHPScreen() {
    return dismissToModalStack(SUPER_WIDE_RIGHT_MODALS);
}

function dismissToSuperWideRHP() {
    // On narrow layouts (mobile), Super Wide RHP doesn't exist, so just dismiss the modal completely
    if (getIsNarrowLayout()) {
        dismissModal();
        return;
    }
    // On wide layouts, dismiss back to the Super Wide RHP modal stack
    navigateBackToLastSuperWideRHPScreen();
}

function getTopmostSearchReportRouteParams(state = navigationRef.getRootState()): RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined {
    if (!state) {
        return undefined;
    }

    const lastRoute = state.routes?.at(-1);
    if (lastRoute?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return undefined;
    }

    const nestedRoutes = lastRoute.state?.routes ?? [];
    const lastSearchReport = [...nestedRoutes].reverse().find((route) => route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT);

    return lastSearchReport?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined;
}

function getTopmostSearchReportID(state = navigationRef.getRootState()): string | undefined {
    const params = getTopmostSearchReportRouteParams(state);
    return params?.reportID;
}

export default {
    setShouldPopToSidebar,
    getShouldPopToSidebar,
    popToSidebar,
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
    resetToHome,
    goBackToHome,
    closeRHPFlow,
    setNavigationActionToMicrotaskQueue,
    popToTop,
    popRootToTop,
    pop,
    removeScreenFromNavigationState,
    removeScreenByKey,
    removeReportScreen,
    getReportRouteByID,
    replaceWithSplitNavigator,
    isTopmostRouteModalScreen,
    isOnboardingFlow,
    clearPreloadedRoutes,
    isValidateLoginFlow,
    dismissToPreviousRHP,
    dismissToSuperWideRHP,
    getTopmostSearchReportID,
    getTopmostSuperWideRHPReportParams,
    getTopmostSuperWideRHPReportID,
    getTopmostSearchReportRouteParams,
    navigateBackToLastSuperWideRHPScreen,
};

export {navigationRef};
