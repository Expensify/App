import React from 'react';
import {StackActions, DrawerActions} from '@react-navigation/native';
import {getIsDrawerOpenFromState} from '@react-navigation/drawer';
import linkTo from './linkTo';
import ROUTES from '../../ROUTES';
import canUseBrowserHistory from './canUseBrowserHistory';

export const navigationRef = React.createRef();

/**
 * Return the reportID in a report route.
 *
 * @param {String} route
 * @returns {String}
 */
function getIDInReportRoute(route) {
    if (!route.startsWith('r/')) {
        return '';
    }

    return route.split('/')[1];
}

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
        openDrawer();
        return;
    }

    // We are adding an extra check here to see if the reportID exists in our route so that we can push the page onto
    // the report stack instead of navigate on web. This is due to some variance in how browser history works in
    // react-navigation on web. If browser history is available then we'll want to push a new report onto the stack.
    // However, if it's not then we'll just do the default which is replace the report screen state and close the
    // Sidebar to reveal the report page.
    const reportIDInRoute = getIDInReportRoute(route);
    if (reportIDInRoute) {
        if (canUseBrowserHistory()) {
            navigationRef.current.dispatch(StackActions.push('Report', {reportID: reportIDInRoute}));
        } else {
            navigationRef.current.dispatch(StackActions.replace('Report', {reportID: reportIDInRoute}));
            navigationRef.current.dispatch(DrawerActions.closeDrawer());
        }
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
    // This should take us to the first view of the modal's stack navigator
    navigationRef.current.dispatch((state) => {
        if (state.routes.length > 1) {
            return StackActions.popToTop();
        }

        // We are already on the last page of a modal so just do nothing here as goBack() will navigate us back to the
        // main screen
        return StackActions.pop(0);
    });

    // From there we can just navigate back to the previous page
    goBack();

    // Any modal launched from the sidebar should open the drawer once dimissed.
    if (!shouldOpenDrawer) {
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
};
