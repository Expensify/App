import {getActionFromState} from '@react-navigation/core';
import {CommonActions, getPathFromState, NavigationState, StackActions} from '@react-navigation/native';
import _ from 'lodash';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';
import originalGetTopMostCentralPaneRouteName from './getTopMostCentralPaneRouteName';
import originalGetTopmostReportActionId from './getTopmostReportActionID';
import originalGetTopmostReportId from './getTopmostReportId';
import linkingConfig from './linkingConfig';
import linkTo from './linkTo';
import navigationRef from './navigationRef';

let resolveNavigationIsReadyPromise: (value?: unknown) => void;
const navigationIsReadyPromise = new Promise((resolve) => {
    resolveNavigationIsReadyPromise = resolve;
});

let pendingRoute: string | null = null;

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

// Re-exporting the getTopMostCentralPaneRouteName here to fill in default value for state. The getTopMostCentralPaneRouteName isn't defined in this file to avoid cyclic dependencies.
const getTopMostCentralPaneRouteName = (state = navigationRef.getState()) => originalGetTopMostCentralPaneRouteName(state);

// Re-exporting the getTopmostReportActionID here to fill in default value for state. The getTopmostReportActionID isn't defined in this file to avoid cyclic dependencies.
const getTopmostReportActionId = (state = navigationRef.getState()) => originalGetTopmostReportActionId(state);

// TODO: MAY ADD OVERLOADING HERE LATER - IF THERE IS INDEX RETURN NUMBER, IF THERE IS NO INDEX PROVIDED YOU MAY RETURN UNDEFINED
/**
 * Method for finding on which index in stack we are.
 */
const getActiveRouteIndex = function (route: NavigationState, index?: number): number | undefined {
    if (route.routes) {
        const childActiveRoute = route.routes[route.index || 0];
        return getActiveRouteIndex(childActiveRoute, route.index || 0);
    }

    if (route?.state?.routes) {
        const childActiveRoute = route.state.routes[route.state.index || 0];
        return getActiveRouteIndex(childActiveRoute, route.state.index || 0);
    }

    if (route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return 0;
    }

    return index;
};

/**
 * Main navigation method for redirecting to a route.
 * @param [type] - Type of action to perform. Currently UP is supported.
 */
function navigate(route: string = ROUTES.HOME, type?: string) {
    if (!canNavigate('navigate', {route})) {
        // Store intended route if the navigator is not yet available,
        // we will try again after the NavigationContainer is ready
        Log.hmmm(`[Navigation] Container not yet ready, storing route as pending: ${route}`);
        pendingRoute = route;
        return;
    }

    linkTo(navigationRef.current, route, type);
}

/**
 * @param fallbackRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param shouldEnforceFallback - Enforces navigation to fallback route
 * @param shouldPopToTop - Should we navigate to LHN on back press
 */
function goBack(fallbackRoute: string, shouldEnforceFallback = false, shouldPopToTop = false) {
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
        const lastRoute = rootState.routes[rootState.routes.length - 1];
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

    navigationRef.current.goBack();
}

/**
 * Update route params for the specified route.
 */
function setParams(params: Record<string, string>, routeKey: string) {
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
    const lastRoute = _.last(rootState.routes);
    switch (lastRoute?.name) {
        case NAVIGATORS.RIGHT_MODAL_NAVIGATOR:
        case SCREENS.NOT_FOUND:
        case SCREENS.REPORT_ATTACHMENTS:
            // if we are not in the target report, we need to navigate to it after dismissing the modal
            if (targetReportID && targetReportID !== getTopmostReportId(rootState)) {
                const state = getStateFromPath(ROUTES.REPORT_WITH_ID.getRoute(targetReportID));

                const action = getActionFromState(state, linkingConfig.config);
                action.type = 'REPLACE';
                navigationRef.current?.dispatch(action);
                // If not-found page is in the route stack, we need to close it
            } else if (targetReportID && rootState.routes.some((route) => route.name === SCREENS.NOT_FOUND)) {
                const lastRouteIndex = rootState.routes.length - 1;
                const centralRouteIndex = _.findLastIndex(rootState.routes, (route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);
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
 * Returns the current active route
 */
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
 * Returns the current active route without the URL params
 */
function getActiveRouteWithoutParams(): string {
    return getActiveRoute().replace(/\?.*/, '');
}

/** Returns the active route name from a state event from the navigationRef
 * @param {Object} event
 * @returns {String | undefined}
 * */
function getRouteNameFromStateEvent(event): string | undefined {
    if (!event.data.state) {
        return;
    }
    const currentRouteName = event.data.state.routes.slice(-1).name;

    // Check to make sure we have a route name
    if (currentRouteName) {
        return currentRouteName;
    }
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
function isActiveRoute(routePath: string): boolean {
    // We remove First forward slash from the URL before matching
    return getActiveRoute().substring(1) === routePath;
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

export default {
    setShouldPopAllStateOnUP,
    canNavigate,
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
    getTopMostCentralPaneRouteName,
    getTopmostReportActionId,
};

export {navigationRef};
