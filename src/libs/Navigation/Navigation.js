import _ from 'underscore';
import React from 'react';
import {Keyboard} from 'react-native';
import {DrawerActions, getPathFromState, StackActions} from '@react-navigation/native';
import PropTypes from 'prop-types';
import Onyx from 'react-native-onyx';
import Log from '../Log';
import linkTo from './linkTo';
import ROUTES from '../../ROUTES';
import CustomActions from './CustomActions';
import ONYXKEYS from '../../ONYXKEYS';
import linkingConfig from './linkingConfig';
import navigationRef from './navigationRef';

let isLoggedIn = false;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => isLoggedIn = Boolean(val && val.authToken),
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
 * Returns true if the Navigation is ready to navigate
 * @returns {Boolean}
 */
function isReady() {
    return navigationRef.isReady();
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
    const {reportID, isParticipantsRoute} = ROUTES.parseReportRouteParams(route);
    return reportID && !isParticipantsRoute;
}

/**
 * Main navigation method for redirecting to a route.
 * @param {String} route
 */
function navigate(route = ROUTES.HOME) {
    if (!canNavigate('navigate', {route})) {
        return;
    }

    if (route === ROUTES.HOME) {
        if (isLoggedIn) {
            openDrawer();
            return;
        }

        // If we're navigating to the signIn page while logged out, pop whatever screen is on top
        // since it's guaranteed that the sign in page will be underneath (since it's the initial route).
        navigationRef.current.dispatch(StackActions.pop());
        return;
    }

    if (isDrawerRoute(route)) {
        navigationRef.current.dispatch(CustomActions.pushDrawerRoute(route));
        return;
    }

    linkTo(navigationRef.current, route);
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

    const normalizedShouldOpenDrawer = _.isBoolean(shouldOpenDrawer)
        ? shouldOpenDrawer
        : false;

    CustomActions.navigateBackToRootDrawer();
    if (normalizedShouldOpenDrawer) {
        openDrawer();
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
 * Alternative to the `Navigation.dismissModal()` function that we can use inside
 * the render function of other components to avoid breaking React rules about side-effects.
 *
 * Example:
 * ```jsx
 * if (!Permissions.canUseFreePlan(this.props.betas)) {
 *     return <Navigation.DismissModal />;
 * }
 * ```
 */
class DismissModal extends React.Component {
    componentDidMount() {
        dismissModal(this.props.shouldOpenDrawer);
    }

    render() {
        return null;
    }
}

DismissModal.propTypes = {
    shouldOpenDrawer: PropTypes.bool,
};
DismissModal.defaultProps = {
    shouldOpenDrawer: false,
};

export default {
    navigate,
    dismissModal,
    isActiveRoute,
    getActiveRoute,
    isReady,
    goBack,
    DismissModal,
    closeDrawer,
    getDefaultDrawerState,
    setDidTapNotification,
};

export {
    navigationRef,
};
