import {findFocusedRoute, getActionFromState} from '@react-navigation/core';
import {CommonActions, getPathFromState, StackActions} from '@react-navigation/native';
import _ from 'lodash';
import lodashGet from 'lodash/get';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS, {PROTECTED_SCREENS} from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';
import originalGetTopmostReportActionId from './getTopmostReportActionID';
import originalGetTopmostReportId from './getTopmostReportId';
import linkingConfig from './linkingConfig';
import linkTo from './linkTo';
import navigationRef from './navigationRef';

let resolveNavigationIsReadyPromise;
const navigationIsReadyPromise = new Promise((resolve) => {
    resolveNavigationIsReadyPromise = resolve;
});

let pendingRoute = null;

let shouldPopAllStateOnUP = false;

/**
 * Inform the navigation that next time user presses UP we should pop all the state back to LHN.
 */
function setShouldPopAllStateOnUP() {
    shouldPopAllStateOnUP = true;
}

/**
 * @param {String} methodName
 * @param {Object} params
 * @returns {Boolean}
 */
function canNavigate(methodName, params = {}) {
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

/**
 * Method for finding on which index in stack we are.
 * @param {Object} route
 * @param {Number} index
 * @returns {Number}
 */
const getActiveRouteIndex = function (route, index) {
    if (route.routes) {
        const childActiveRoute = route.routes[route.index || 0];
        return getActiveRouteIndex(childActiveRoute, route.index || 0);
    }

    if (route.state && route.state.routes) {
        const childActiveRoute = route.state.routes[route.state.index || 0];
        return getActiveRouteIndex(childActiveRoute, route.state.index || 0);
    }

    if (route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return 0;
    }

    return index;
};

/**
 * Gets distance from the path in root navigator. In other words how much screen you have to pop to get to the route with this path.
 * The search is limited to 5 screens from the top for performance reasons.
 * @param {String} path - Path that you are looking for.
 * @return {Number} - Returns distance to path or -1 if the path is not found in root navigator.
 */
function getDistanceFromPathInRootNavigator(path) {
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

/**
 * Returns the current active route
 * @returns {String}
 */
function getActiveRoute() {
    const currentRoute = navigationRef.current && navigationRef.current.getCurrentRoute();
    const currentRouteHasName = lodashGet(currentRoute, 'name', false);
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
 * @param {String} routePath Path to check
 * @return {Boolean} is active
 */
function isActiveRoute(routePath) {
    // We remove First forward slash from the URL before matching
    return getActiveRoute().substring(1) === routePath;
}

/**
 * Main navigation method for redirecting to a route.
 * @param {String} route
 * @param {String} [type] - Type of action to perform. Currently UP is supported.
 */
function navigate(route = ROUTES.HOME, type) {
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
 * @param {String} fallbackRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param {Boolean} shouldEnforceFallback - Enforces navigation to fallback route
 * @param {Boolean} shouldPopToTop - Should we navigate to LHN on back press
 */
function goBack(fallbackRoute, shouldEnforceFallback = false, shouldPopToTop = false) {
    if (!canNavigate('goBack')) {
        return;
    }

    if (shouldPopToTop) {
        if (shouldPopAllStateOnUP) {
            shouldPopAllStateOnUP = false;
            navigationRef.current.dispatch(StackActions.popToTop());
            return;
        }
    }

    if (!navigationRef.current.canGoBack()) {
        Log.hmmm('[Navigation] Unable to go back');
        return;
    }

    const isFirstRouteInNavigator = !getActiveRouteIndex(navigationRef.current.getState());
    if (isFirstRouteInNavigator) {
        const rootState = navigationRef.getRootState();
        const lastRoute = _.last(rootState.routes);
        // If the user comes from a different flow (there is more than one route in RHP) we should go back to the previous flow on UP button press instead of using the fallbackRoute.
        if (lastRoute.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && lastRoute.state.index > 0) {
            navigationRef.current.goBack();
            return;
        }
    }

    if (shouldEnforceFallback || (isFirstRouteInNavigator && fallbackRoute)) {
        navigate(fallbackRoute, CONST.NAVIGATION.TYPE.UP);
        return;
    }

    const isCentralPaneFocused = findFocusedRoute(navigationRef.current.getState()).name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR;
    const distanceFromPathInRootNavigator = getDistanceFromPathInRootNavigator(fallbackRoute);

    // Allow CentralPane to use UP with fallback route if the path is not found in root navigator.
    if (isCentralPaneFocused && fallbackRoute && distanceFromPathInRootNavigator === -1) {
        navigate(fallbackRoute, CONST.NAVIGATION.TYPE.FORCED_UP);
        return;
    }

    // Add posibility to go back more than one screen in root navigator if that screen is on the stack.
    if (isCentralPaneFocused && fallbackRoute && distanceFromPathInRootNavigator > 0) {
        navigationRef.current.dispatch(StackActions.pop(distanceFromPathInRootNavigator));
        return;
    }

    navigationRef.current.goBack();
}

/**
 * Update route params for the specified route.
 *
 * @param {Object} params
 * @param {String} routeKey
 */
function setParams(params, routeKey) {
    navigationRef.current.dispatch({
        ...CommonActions.setParams(params),
        source: routeKey,
    });
}

/**
 * Dismisses the last modal stack if there is any
 *
 * @param {String | undefined} targetReportID - The reportID to navigate to after dismissing the modal
 */
function dismissModal(targetReportID) {
    if (!canNavigate('dismissModal')) {
        return;
    }
    const rootState = navigationRef.getRootState();
    const lastRoute = _.last(rootState.routes);
    switch (lastRoute.name) {
        case NAVIGATORS.RIGHT_MODAL_NAVIGATOR:
        case SCREENS.NOT_FOUND:
        case SCREENS.REPORT_ATTACHMENTS:
            // if we are not in the target report, we need to navigate to it after dismissing the modal
            if (targetReportID && targetReportID !== getTopmostReportId(rootState)) {
                const state = getStateFromPath(ROUTES.REPORT_WITH_ID.getRoute(targetReportID));

                const action = getActionFromState(state, linkingConfig.config);
                action.type = 'REPLACE';
                navigationRef.current.dispatch(action);
                // If not-found page is in the route stack, we need to close it
            } else if (targetReportID && _.some(rootState.routes, (route) => route.name === SCREENS.NOT_FOUND)) {
                const lastRouteIndex = rootState.routes.length - 1;
                const centralRouteIndex = _.findLastIndex(rootState.routes, (route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);
                navigationRef.current.dispatch({...StackActions.pop(lastRouteIndex - centralRouteIndex), target: rootState.key});
            } else {
                navigationRef.current.dispatch({...StackActions.pop(), target: rootState.key});
            }
            break;
        default: {
            Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        }
    }
}

/**
 * Returns the current active route without the URL params
 * @returns {String}
 */
function getActiveRouteWithoutParams() {
    return getActiveRoute().replace(/\?.*/, '');
}

/** Returns the active route name from a state event from the navigationRef
 * @param {Object} event
 * @returns {String | undefined}
 * */
function getRouteNameFromStateEvent(event) {
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

/**
 * @returns {Promise}
 */
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
 * @function
 * @param {Object} state - react-navigation state object
 *
 * @returns {Boolean}
 */
function navContainsProtectedRoutes(state) {
    if (!state || !state.routeNames || !_.isArray(state.routeNames)) {
        return false;
    }

    const protectedScreensName = _.values(PROTECTED_SCREENS);
    const difference = _.difference(protectedScreensName, state.routeNames);

    return !difference.length;
}

/**
 * Waits for the navitgation state to contain protected routes specified in PROTECTED_SCREENS constant.
 * If the navigation is in a state, where protected routes are avilable, the promise resolve immediately.
 *
 * @function
 * @returns {Promise<void>} A promise that resolves when the one of the PROTECTED_SCREENS screen is available in the nav tree.
 *
 * @example
 * waitForProtectedRoutes()
 *     .then(()=> console.log('Protected routes are present!'))
 */
function waitForProtectedRoutes() {
    return new Promise((resolve) => {
        isNavigationReady().then(() => {
            const currentState = navigationRef.current.getState();
            if (navContainsProtectedRoutes(currentState)) {
                resolve();
                return;
            }
            let unsubscribe;
            const handleStateChange = ({data}) => {
                const state = lodashGet(data, 'state');
                if (navContainsProtectedRoutes(state)) {
                    unsubscribe();
                    resolve();
                }
            };
            unsubscribe = navigationRef.current.addListener('state', handleStateChange);
        });
    });
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
    getTopmostReportActionId,
    waitForProtectedRoutes,
    navContainsProtectedRoutes,
};

export {navigationRef};
