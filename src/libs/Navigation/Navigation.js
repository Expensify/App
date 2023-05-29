import _ from 'underscore';
import lodashGet from 'lodash/get';
import {Keyboard} from 'react-native';
import {CommonActions, DrawerActions, getPathFromState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import Log from '../Log';
import linkTo from './linkTo';
import ROUTES from '../../ROUTES';
import DeprecatedCustomActions from './DeprecatedCustomActions';
import ONYXKEYS from '../../ONYXKEYS';
import linkingConfig from './linkingConfig';
import navigationRef from './navigationRef';
import SCREENS from '../../SCREENS';
import dismissKeyboardGoingBack from './dismissKeyboardGoingBack';

let resolveNavigationIsReadyPromise;
const navigationIsReadyPromise = new Promise((resolve) => {
    resolveNavigationIsReadyPromise = resolve;
});

let resolveDrawerIsReadyPromise;
let drawerIsReadyPromise = new Promise((resolve) => {
    resolveDrawerIsReadyPromise = resolve;
});

let resolveReportScreenIsReadyPromise;
let reportScreenIsReadyPromise = new Promise((resolve) => {
    resolveReportScreenIsReadyPromise = resolve;
});

let isLoggedIn = false;
let pendingRoute = null;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => (isLoggedIn = Boolean(val && val.authToken)),
});

// This flag indicates that we're trying to deeplink to a report when react-navigation is not fully loaded yet.
// If true, this flag will cause the drawer to start in a closed state (which is not the default for small screens)
// so it doesn't cover the report we're trying to link to.
let didTapNotificationBeforeReady = false;

function setDidTapNotification() {
    if (navigationRef.isReady()) {
        return;
    }

    didTapNotificationBeforeReady = true;
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

/**
 * Opens the LHN drawer.
 * @private
 */
function openDrawer() {
    if (!canNavigate('openDrawer')) {
        return;
    }

    navigationRef.current.dispatch(DrawerActions.openDrawer());
    Keyboard.dismiss();
}

/**
 * Close the LHN drawer.
 * @private
 */
function closeDrawer() {
    if (!canNavigate('closeDrawer')) {
        return;
    }

    navigationRef.current.dispatch(DrawerActions.closeDrawer());
}

/**
 * @param {Boolean} isSmallScreenWidth
 * @returns {String}
 */
function getDefaultDrawerState(isSmallScreenWidth) {
    if (didTapNotificationBeforeReady) {
        return 'closed';
    }
    return isSmallScreenWidth ? 'open' : 'closed';
}

/**
 * @private
 * @param {Boolean} shouldOpenDrawer
 */
function goBack(shouldOpenDrawer = true) {
    if (!canNavigate('goBack')) {
        return;
    }

    if (!navigationRef.current.canGoBack()) {
        Log.hmmm('[Navigation] Unable to go back');
        if (shouldOpenDrawer) {
            openDrawer();
        }
        return;
    }
    navigationRef.current.goBack();
}

/**
 * We navigate to the certains screens with a custom action so that we can preserve the browser history in web. react-navigation does not handle this well
 * and only offers a "mobile" navigation paradigm e.g. in order to add a history item onto the browser history stack one would need to use the "push" action.
 * However, this is not performant as it would keep stacking ReportScreen instances (which are quite expensive to render).
 * We're also looking to see if we have a participants route since those also have a reportID param, but do not have the problem described above and should not use the custom action.
 *
 * @param {String} route
 * @returns {Boolean}
 */
function isDrawerRoute(route) {
    const {reportID, isSubReportPageRoute} = ROUTES.parseReportRouteParams(route);
    return reportID && !isSubReportPageRoute;
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

    if (route === ROUTES.HOME) {
        if (isLoggedIn && pendingRoute === null) {
            openDrawer();
            return;
        }

        // If we're navigating to the signIn page while logged out, pop whatever screen is on top
        // since it's guaranteed that the sign in page will be underneath (since it's the initial route).
        // Also, if we're coming from a link to validate login (pendingRoute is not null), we want to pop the loading screen.
        navigationRef.current.dispatch(CommonActions.reset({index: 0, routes: [{name: SCREENS.HOME}]}));
        return;
    }

    if (isDrawerRoute(route)) {
        navigationRef.current.dispatch(DeprecatedCustomActions.pushDrawerRoute(route));
        return;
    }

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
 * Dismisses a screen presented modally and returns us back to the previous view.
 *
 * @param {Boolean} [shouldOpenDrawer]
 */
function dismissModal(shouldOpenDrawer = false) {
    if (!canNavigate('dismissModal')) {
        return;
    }

    const normalizedShouldOpenDrawer = _.isBoolean(shouldOpenDrawer) ? shouldOpenDrawer : false;

    DeprecatedCustomActions.navigateBackToRootDrawer();
    if (normalizedShouldOpenDrawer) {
        openDrawer();
    }
}

/**
 * Returns the current active route
 * @returns {String}
 */
function getActiveRoute() {
    const currentRouteHasName = navigationRef.current && navigationRef.current.getCurrentRoute().name;
    if (!currentRouteHasName) {
        return '';
    }

    const routeState = navigationRef.current.getState();
    const currentRoute = routeState.routes[routeState.index];

    if (currentRoute.state) {
        return getPathFromState(routeState, linkingConfig.config);
    }

    if (currentRoute.params && currentRoute.params.path) {
        return currentRoute.params.path;
    }

    return '';
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

/**
 * @returns {Promise}
 */
function isDrawerReady() {
    return drawerIsReadyPromise;
}

function setIsDrawerReady() {
    resolveDrawerIsReadyPromise();
}

function resetDrawerIsReadyPromise() {
    drawerIsReadyPromise = new Promise((resolve) => {
        resolveDrawerIsReadyPromise = resolve;
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
    closeDrawer,
    getDefaultDrawerState,
    setDidTapNotification,
    isNavigationReady,
    setIsNavigationReady,
    getReportIDFromRoute,
    isDrawerReady,
    setIsDrawerReady,
    resetDrawerIsReadyPromise,
    resetIsReportScreenReadyPromise,
    isDrawerRoute,
    isReportScreenReady,
    setIsReportScreenIsReady,
    drawerGoBack,
};

export {navigationRef};
