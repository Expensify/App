import _ from 'underscore';
import React from 'react';
import {StackActions, DrawerActions} from '@react-navigation/native';
import {getIsDrawerOpenFromState} from '@react-navigation/drawer';

import Onyx from 'react-native-onyx';
import linkTo from './linkTo';
import ROUTES from '../../ROUTES';
import SCREENS from '../../SCREENS';
import CustomActions from './CustomActions';
import ONYXKEYS from '../../ONYXKEYS';

let isLoggedIn = false;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => isLoggedIn = !_.isEmpty(val),
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
    // If we're navigating to the signIn page, replace the existing route in the stack with the SignIn route so that we
    // don't mistakenly route back to any older routes after the user signs in
    if (route === ROUTES.HOME && isLoggedIn) {
        navigationRef.current.dispatch(StackActions.replace(SCREENS.HOME));
        navigationRef.current.dispatch(StackActions.popToTop());
        return;
    }

    if (route === ROUTES.HOME) {
        openDrawer();
        return;
    }

    const {reportID} = ROUTES.parseReportRouteParams(route);
    if (reportID) {
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

    // This should take us to the first view of the modal's stack navigator
    navigationRef.current.dispatch((state) => {
        // If there are multiple routes then we can pop back to the first route
        if (state.routes.length > 1) {
            return StackActions.popToTop();
        }

        // Otherwise, we are already on the last page of a modal so just do nothing here as goBack() will navigate us
        // back to the screen we were on before we opened the modal.
        return StackActions.pop(0);
    });

    // Navigate back to where we were before we launched the modal
    goBack();

    if (!normalizedShouldOpenDrawer) {
        return;
    }

    openDrawer();
}

/**
 * Determines whether the drawer is currently open.
 *
 * @returns {Boolean}
 */
function isDrawerOpen() {
    return getIsDrawerOpenFromState(navigationRef.current.getRootState().routes[0].state);
}

export default {
    navigate,
    dismissModal,
    isDrawerOpen,
    goBack,
};
