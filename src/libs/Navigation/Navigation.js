import _ from 'lodash';
import lodashGet from 'lodash/get';
import {CommonActions, getPathFromState, StackActions} from '@react-navigation/native';
import {getActionFromState} from '@react-navigation/core';
import Log from '../Log';
import DomUtils from '../DomUtils';
import linkTo from './linkTo';
import ROUTES from '../../ROUTES';
import linkingConfig from './linkingConfig';
import navigationRef from './navigationRef';
import NAVIGATORS from '../../NAVIGATORS';
import originalGetTopmostReportId from './getTopmostReportId';
import getStateFromPath from './getStateFromPath';
import SCREENS from '../../SCREENS';
import CONST from '../../CONST';

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
 * Main navigation method for redirecting to a route.
 * @param {String} route
 * @param {String} type - Type of action to perform. Currently UP is supported.
 */
function navigate(route = ROUTES.HOME, type) {
    if (!canNavigate('navigate', {route})) {
        // Store intended route if the navigator is not yet available,
        // we will try again after the NavigationContainer is ready
        Log.hmmm(`[Navigation] Container not yet ready, storing route as pending: ${route}`);
        pendingRoute = route;
        return;
    }

    // A pressed navigation button will remain focused, keeping its tooltip visible, even if it's supposed to be out of view.
    // To prevent that we blur the button manually (especially for Safari, where the mouse leave event is missing).
    // More info: https://github.com/Expensify/App/issues/13146
    DomUtils.blurActiveElement();

    linkTo(navigationRef.current, route, type);
}

/**
 * @param {String} fallbackRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param {Bool} shouldEnforceFallback - Enforces navigation to fallback route
 * @param {Bool} shouldPopToTop - Should we navigate to LHN on back press
 */
function goBack(fallbackRoute = ROUTES.HOME, shouldEnforceFallback = false, shouldPopToTop = false) {
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
        case NAVIGATORS.FULL_SCREEN_NAVIGATOR:
        case SCREENS.REPORT_ATTACHMENTS:
            // if we are not in the target report, we need to navigate to it after dismissing the modal
            if (targetReportID && targetReportID !== getTopmostReportId(rootState)) {
                const state = getStateFromPath(ROUTES.getReportRoute(targetReportID));

                const action = getActionFromState(state, linkingConfig.config);
                action.type = 'REPLACE';
                navigationRef.current.dispatch(action);
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

export default {
    setShouldPopAllStateOnUP,
    canNavigate,
    navigate,
    setParams,
    dismissModal,
    isActiveRoute,
    getActiveRoute,
    goBack,
    isNavigationReady,
    setIsNavigationReady,
    getTopmostReportId,
    getRouteNameFromStateEvent,
};

export {navigationRef};
