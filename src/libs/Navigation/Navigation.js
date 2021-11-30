import _ from 'underscore';
import React from 'react';
import {Keyboard} from 'react-native';
import {
    StackActions,
    DrawerActions,
    createNavigationContainerRef,
    getPathFromState,
} from '@react-navigation/native';
import PropTypes from 'prop-types';
import Onyx from 'react-native-onyx';
import Log from '../Log';
import linkTo from './linkTo';
import ROUTES from '../../ROUTES';
import SCREENS from '../../SCREENS';
import CustomActions from './CustomActions';
import ONYXKEYS from '../../ONYXKEYS';
import linkingConfig from './linkingConfig';

let isLoggedIn = false;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => isLoggedIn = Boolean(val && val.authToken),
});

const navigationRef = createNavigationContainerRef();

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
 * Opens the LHN drawer.
 * @private
 */
function openDrawer() {
    if (!navigationRef.isReady()) {
        Log.hmmm('[Navigation] openDrawer failed because navigation ref was not yet ready');
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
    if (!navigationRef.isReady()) {
        Log.hmmm('[Navigation] closeDrawer failed because navigation ref was not yet ready');
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
    if (!navigationRef.isReady()) {
        Log.hmmm('[Navigation] goBack failed because navigation ref was not yet ready');
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
 * Main navigation method for redirecting to a route.
 * @param {String} route
 */
function navigate(route = ROUTES.HOME) {
    if (!navigationRef.isReady()) {
        Log.hmmm('[Navigation] navigate failed because navigation ref was not yet ready', {route});
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

    // Navigate to the ReportScreen with a custom action so that we can preserve the history. We're looking to see if we
    // have a participants route since those should go through linkTo() as they open a different screen.
    const {reportID, isParticipantsRoute} = ROUTES.parseReportRouteParams(route);
    if (reportID && !isParticipantsRoute) {
        navigationRef.current.dispatch(CustomActions.pushDrawerRoute(SCREENS.REPORT, {reportID}, navigationRef));
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
    if (!navigationRef.isReady()) {
        Log.hmmm('[Navigation] dismissModal failed because navigation ref was not yet ready');
        return;
    }

    const normalizedShouldOpenDrawer = _.isBoolean(shouldOpenDrawer)
        ? shouldOpenDrawer
        : false;

    CustomActions.navigateBackToRootDrawer(navigationRef);
    if (normalizedShouldOpenDrawer) {
        openDrawer();
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
    const path = navigationRef.current && navigationRef.current.getCurrentRoute().name
        ? getPathFromState(navigationRef.current.getState(), linkingConfig.config).substring(1)
        : '';
    return path === routePath;
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
    goBack,
    DismissModal,
    closeDrawer,
    getDefaultDrawerState,
    setDidTapNotification,
};

export {
    navigationRef,
};
