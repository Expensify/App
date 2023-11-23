import {findFocusedRoute, getActionFromState} from '@react-navigation/core';
import {
    CommonActions,
    CommonNavigationAction,
    EventListenerCallback,
    EventMapBase,
    EventMapCore,
    getPathFromState,
    NavigationState,
    StackActions,
    StackActionType,
} from '@react-navigation/native';
import findLastIndex from 'lodash/findLastIndex';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES, {Route} from '@src/ROUTES';
import SCREENS, {PROTECTED_SCREENS} from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';
import originalGetTopmostReportActionId from './getTopmostReportActionID';
import originalGetTopmostReportId from './getTopmostReportId';
import linkingConfig from './linkingConfig';
import linkTo from './linkTo';
import navigationRef from './navigationRef';
import {StateOrRoute} from './types';

let resolveNavigationIsReadyPromise: (value?: unknown) => void;
const navigationIsReadyPromise = new Promise((resolve) => {
    resolveNavigationIsReadyPromise = resolve;
});

let pendingRoute: Route | null = null;

let shouldPopAllStateOnUP = false;

/**
 * Inform the navigation that next time user presses UP we should pop all the state back to LHN.
 */
function setShouldPopAllStateOnUP() {
    shouldPopAllStateOnUP = true;
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

/** Method for finding on which index in stack we are. */
function getActiveRouteIndex(stateOrRoute: StateOrRoute, index?: number): number | undefined {
    if ('routes' in stateOrRoute && stateOrRoute.routes) {
        const childActiveRoute = stateOrRoute.routes[stateOrRoute.index ?? 0];
        return getActiveRouteIndex(childActiveRoute, stateOrRoute.index ?? 0);
    }

    if ('state' in stateOrRoute && stateOrRoute?.state?.routes) {
        const childActiveRoute = stateOrRoute.state.routes[stateOrRoute.state.index ?? 0];
        return getActiveRouteIndex(childActiveRoute, stateOrRoute.state.index ?? 0);
    }

    if ('name' in stateOrRoute && stateOrRoute.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return 0;
    }

    return index;
}

/**
 * Gets distance from the path in root navigator. In other words how much screen you have to pop to get to the route with this path.
 * The search is limited to 5 screens from the top for performance reasons.
 * @param path - Path that you are looking for.
 * @return - Returns distance to path or -1 if the path is not found in root navigator.
 */
function getDistanceFromPathInRootNavigator(path: string): number {
    let currentState = navigationRef.getRootState();

    for (let index = 0; index < 5; index++) {
        if (!currentState.routes.length) {
            break;
        }

        const pathFromState = getPathFromState(currentState, linkingConfig.config);
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
    const currentRouteHasName = currentRoute?.name ?? false;
    if (!currentRouteHasName) {
        return '';
    }

    const routeFromState = getPathFromState(navigationRef.getRootState(), linkingConfig.config);

    if (routeFromState) {
        return routeFromState;
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
    // We remove First forward slash from the URL before matching
    return getActiveRoute().substring(1) === routePath;
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
    linkTo(navigationRef.current, route, type, isActiveRoute(route));
}

/**
 * @param fallbackRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param shouldEnforceFallback - Enforces navigation to fallback route
 * @param shouldPopToTop - Should we navigate to LHN on back press
 */
function goBack(fallbackRoute: Route, shouldEnforceFallback = false, shouldPopToTop = false) {
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
        // If the user comes from a different flow (there is more than one route in RHP) we should go back to the previous flow on UP button press instead of using the fallbackRoute.
        if (lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && (lastRoute.state?.index ?? 0) > 0) {
            navigationRef.current.goBack();
            return;
        }
    }

    if (shouldEnforceFallback || (isFirstRouteInNavigator && fallbackRoute)) {
        navigate(fallbackRoute, CONST.NAVIGATION.TYPE.UP);
        return;
    }

    const isCentralPaneFocused = findFocusedRoute(navigationRef.current.getState())?.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR;
    const distanceFromPathInRootNavigator = getDistanceFromPathInRootNavigator(fallbackRoute);

    // Allow CentralPane to use UP with fallback route if the path is not found in root navigator.
    if (isCentralPaneFocused && fallbackRoute && distanceFromPathInRootNavigator === -1) {
        navigate(fallbackRoute, CONST.NAVIGATION.TYPE.FORCED_UP);
        return;
    }

    // Add possibility to go back more than one screen in root navigator if that screen is on the stack.
    if (isCentralPaneFocused && fallbackRoute && distanceFromPathInRootNavigator > 0) {
        navigationRef.current.dispatch(StackActions.pop(distanceFromPathInRootNavigator));
        return;
    }

    navigationRef.current.goBack();
}

/**
 * Update route params for the specified route.
 */
function setParams(params: Record<string, unknown>, routeKey: string) {
    navigationRef.current?.dispatch({
        ...CommonActions.setParams(params),
        source: routeKey,
    });
}

/**
 * Dismisses the last modal stack if there is any
 *
 * @param targetReportID - The reportID to navigate to after dismissing the modal
 */
function dismissModal(targetReportID?: string) {
    if (!canNavigate('dismissModal')) {
        return;
    }
    const rootState = navigationRef.getRootState();
    const lastRoute = rootState.routes.at(-1);
    switch (lastRoute?.name) {
        case NAVIGATORS.RIGHT_MODAL_NAVIGATOR:
        case SCREENS.NOT_FOUND:
        case SCREENS.REPORT_ATTACHMENTS:
            // if we are not in the target report, we need to navigate to it after dismissing the modal
            if (targetReportID && targetReportID !== getTopmostReportId(rootState)) {
                const state = getStateFromPath(ROUTES.REPORT_WITH_ID.getRoute(targetReportID));

                const action: CommonNavigationAction | StackActionType | undefined = getActionFromState(state, linkingConfig.config);
                if (action) {
                    navigationRef.current?.dispatch(action);
                }
                // If not-found page is in the route stack, we need to close it
            } else if (targetReportID && rootState.routes.some((route) => route.name === SCREENS.NOT_FOUND)) {
                const lastRouteIndex = rootState.routes.length - 1;
                const centralRouteIndex = findLastIndex(rootState.routes, (route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);
                navigationRef.current?.dispatch({...StackActions.pop(lastRouteIndex - centralRouteIndex), target: rootState.key});
            } else {
                navigationRef.current?.dispatch({...StackActions.pop(), target: rootState.key});
            }
            break;
        default: {
            Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        }
    }
}

/**
 * Returns the current active route without the URL params
 */
function getActiveRouteWithoutParams(): string {
    return getActiveRoute().replace(/\?.*/, '');
}

/** Returns the active route name from a state event from the navigationRef  */
function getRouteNameFromStateEvent(event: EventMapCore<NavigationState>['state']): string | undefined {
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

function isNavigationReady() {
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
function navContainsProtectedRoutes(state: NavigationState | undefined) {
    if (!state?.routeNames || !Array.isArray(state.routeNames)) {
        return false;
    }

    const protectedScreensName = Object.values(PROTECTED_SCREENS);
    const difference = protectedScreensName.filter((screen) => !state.routeNames.includes(screen));

    return !difference.length;
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
            let unsubscribe: (() => void) | undefined;
            const handleStateChange: EventListenerCallback<EventMapBase, 'state'> = ({data}) => {
                const state = data?.state;
                if (navContainsProtectedRoutes(state)) {
                    unsubscribe?.();
                    resolve();
                }
            };
            unsubscribe = navigationRef.current?.addListener('state', handleStateChange);
        });
    });
}

export default {
    setShouldPopAllStateOnUP,
    navigate,
    setParams,
    dismissModal,
    isActiveRoute,
    getActiveRoute,
    getActiveRouteWithoutParams,
    goBack,
    isNavigationReady,
    setIsNavigationReady,
    getTopmostReportId,
    getRouteNameFromStateEvent,
    getTopmostReportActionId,
    waitForProtectedRoutes,
};

export {navigationRef};
