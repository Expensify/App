import _ from 'underscore';
import React from 'react';
import {StackActions, DrawerActions} from '@react-navigation/native';
import PropTypes from 'prop-types';
import Onyx from 'react-native-onyx';
import linkTo from './linkTo';
import ROUTES from '../../ROUTES';
import SCREENS from '../../SCREENS';
import CustomActions from './CustomActions';
import ONYXKEYS from '../../ONYXKEYS';

let isLoggedIn = false;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => isLoggedIn = Boolean(val && val.authToken),
});

export const navigationRef = React.createRef();

/**
 * Opens the LHN drawer.
 * @private
 */
function openDrawer() {
    navigationRef.current.dispatch(DrawerActions.openDrawer());
}

/**
 * @private
 */
function goBack() {
    if (!navigationRef.current.canGoBack()) {
        console.debug('Unable to go back');
        openDrawer();
        return;
    }

    navigationRef.current.goBack();
}

/**
 * Main navigation method for redirecting to a route.
 * @param {String} route
 */
function navigate(route = ROUTES.HOME) {
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
        navigationRef.current.dispatch(CustomActions.pushDrawerRoute(SCREENS.REPORT, {reportID}));
        return;
    }

    linkTo(navigationRef.current, route);
}

/**
 * Dismisses a screen presented modally and returns us back to the previous view.
 *
 * @param {Boolean} shouldOpenDrawer
 */
function dismissModal(shouldOpenDrawer = false) {
    const normalizedShouldOpenDrawer = _.isBoolean(shouldOpenDrawer)
        ? shouldOpenDrawer
        : false;

    let isLeavingDrawerNavigator;

    // This should take us to the first view of the modal's stack navigator
    navigationRef.current.dispatch((state) => {
        // If this is a nested drawer navigator then we pop the screen and
        // prevent calling goBack() as it's default behavior is to toggle open the active drawer
        if (state.type === 'drawer') {
            isLeavingDrawerNavigator = true;
            return StackActions.pop();
        }

        // If there are multiple routes then we can pop back to the first route
        if (state.routes.length > 1) {
            return StackActions.popToTop();
        }

        // Otherwise, we are already on the last page of a modal so just do nothing here as goBack() will navigate us
        // back to the screen we were on before we opened the modal.
        return StackActions.pop(0);
    });

    if (isLeavingDrawerNavigator) {
        return;
    }

    // Navigate back to where we were before we launched the modal
    goBack();

    if (!normalizedShouldOpenDrawer) {
        return;
    }

    openDrawer();
}

/**
 * Check whether the passed route is currently Active or not.
 *
 * @param {String} routePath Path to check
 * @return {Boolean} is active
 */
function isActive(routePath) {
    // We remove First forward slash from the URL before matching
    const path = navigationRef.current && navigationRef.current.getCurrentRoute().path
        ? navigationRef.current.getCurrentRoute().path.substring(1)
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
    isActive,
    goBack,
    DismissModal,
};
