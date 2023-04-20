import _ from 'lodash';
import lodashGet from 'lodash/get';
import {
    CommonActions, getPathFromState, StackActions,
} from '@react-navigation/native';
import Log from '../Log';
import DomUtils from '../DomUtils';
import linkTo from './linkTo';
import ROUTES from '../../ROUTES';
import linkingConfig from './linkingConfig';
import navigationRef from './navigationRef';
import NAVIGATORS from '../../NAVIGATORS';
import originalGetTopmostReportId from './getTopmostReportId';
import dismissKeyboardGoingBack from './dismissKeyboardGoingBack';

let resolveNavigationIsReadyPromise;
const navigationIsReadyPromise = new Promise((resolve) => {
    resolveNavigationIsReadyPromise = resolve;
});

let resolveReportScreenIsReadyPromise;
let reportScreenIsReadyPromise = new Promise((resolve) => {
    resolveReportScreenIsReadyPromise = resolve;
});

let pendingRoute = null;

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

const getTopmostReportId = (state = navigationRef.getState()) => originalGetTopmostReportId(state)

/**
 * @private
 * @param {Boolean} shouldOpenDrawer
 */
function goBack() {
    if (!canNavigate('goBack')) {
        return;
    }

    if (!navigationRef.current.canGoBack()) {
        Log.hmmm('[Navigation] Unable to go back');
        return;
    }
    navigationRef.current.goBack();
}

/**
 * Main navigation method for redirecting to a route.
 * @param {String} route
 */
function navigate(route = ROUTES.HOME) {
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

    linkTo(navigationRef.current, route);
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
 */
function dismissModal() {
    if (!canNavigate('dismissModal')) {
        return;
    }
    const rootState = navigationRef.getRootState();
    const lastRoute = _.last(rootState.routes);
    if (lastRoute.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR || lastRoute.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR) {
        navigationRef.current.dispatch(StackActions.pop());
    } else {
        Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
    }
}

/**
 * Returns the current active route
 * @returns {String}
 */
function getActiveRoute() {
    return navigationRef.current && navigationRef.current.getCurrentRoute().name
        ? getPathFromState(navigationRef.current.getState(), linkingConfig.config)
        : '';
}

/**
 * @returns {String}
 */
function getReportIDFromRoute() {
    if (!navigationRef.current) {
        return '';
    }

    const drawerState = lodashGet(navigationRef.current.getState(), ['routes', 0, 'state']);
    const reportRoute = lodashGet(drawerState, ['routes', 0]);
    return lodashGet(reportRoute, ['params', 'reportID'], '');
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

function resetIsReportScreenReadyPromise() {
    reportScreenIsReadyPromise = new Promise((resolve) => {
        resolveReportScreenIsReadyPromise = resolve;
    });
}

function isReportScreenReady() {
    return reportScreenIsReadyPromise;
}

function setIsReportScreenIsReady() {
    resolveReportScreenIsReadyPromise();
}

/**
 * Navigation function with additional logic to dismiss the opened keyboard
 *
 * Navigation events are not fired when we navigate to an existing screen in the navigation stack,
 * that is why we need to manipulate closing keyboard manually
 * @param {string} backRoute - Name of the screen to navigate the user to
 */
function drawerGoBack(backRoute) {
    dismissKeyboardGoingBack();
    if (!backRoute) {
        goBack();
        return;
    }
    navigate(backRoute);
}

export default {
    canNavigate,
    navigate,
    setParams,
    dismissModal,
    isActiveRoute,
    getActiveRoute,
    goBack,
    isNavigationReady,
    setIsNavigationReady,
    getReportIDFromRoute,
    resetIsReportScreenReadyPromise,
    isReportScreenReady,
    setIsReportScreenIsReady,

    // Re-exporting the getTopmostReportId here to fill in default value for state. The getTopmostReportId isn't defined in this file to avoid cyclic dependencies.
    // getTopmostReportId: (state = navigationRef.getState()) => getTopmostReportId(state),
    getTopmostReportId,
    drawerGoBack,
};

export {
    navigationRef,
};
