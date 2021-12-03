import _ from 'underscore';
import {
    CommonActions, StackActions, DrawerActions, getStateFromPath,
} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import linkingConfig from './linkingConfig';
import navigationRef from './navigationRef';

/**
 * Go back to the Main Drawer
 * @param {Object} navigationRef
 */
function navigateBackToRootDrawer() {
    let isLeavingNestedDrawerNavigator = false;

    // This should take us to the first view of the modal's stack navigator
    navigationRef.current.dispatch((state) => {
        // If this is a nested drawer navigator then we pop the screen and
        // prevent calling goBack() as it's default behavior is to toggle open the active drawer
        if (state.type === 'drawer') {
            isLeavingNestedDrawerNavigator = true;
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

    if (isLeavingNestedDrawerNavigator) {
        return;
    }

    // Navigate back to where we were before we launched the modal
    if (navigationRef.current.canGoBack()) {
        navigationRef.current.goBack();
    }
}

/**
 * @param {Object} state
 * @returns {Object}
 */
function getParamsFromState(state) {
    return lodashGet(state, 'routes[0].state.routes[0].params', {});
}

/**
 * Special accomodation must be made for navigating to a screen inside a DrawerNavigator (e.g. our ReportScreen). The web/mWeb default behavior when
 * calling "navigate()" does not give us the browser history we would expect for a typical web paradigm (e.g. that navigating from one screen another
 * should allow us to navigate back to the screen we were on previously). This custom action helps us get around these problems.
 *
 * More context here: https://github.com/react-navigation/react-navigation/issues/9744
 *
 * @param {String} path
 * @returns {Function}
 */
function pushDrawerRoute(path) {
    return (currentState) => {
        let state = currentState;

        const stateFromPath = getStateFromPath(path, linkingConfig.config);
        const newScreenName = lodashGet(stateFromPath, 'routes[0].state.routes[0].name');
        const newScreenParams = getParamsFromState(stateFromPath);

        // Avoid the navigation and refocus the report if we're trying to navigate to our active report
        // We use our RootState as the dispatch's state is relative to the active navigator and might
        // not contain our active report.
        const rootState = navigationRef.current.getRootState();
        const activeScreenParams = getParamsFromState(rootState);
        if (state.type !== 'drawer') {
            navigateBackToRootDrawer();
        }
        if (_.isEqual(activeScreenParams, newScreenParams)) {
            return DrawerActions.closeDrawer();
        }

        // When navigating from non Drawer navigator, get new state for the report and reset the navigation state.
        if (state.type !== 'drawer') {
            state = getStateFromPath(path, linkingConfig.config);
        }

        const screenRoute = {type: 'route', name: newScreenName};
        const history = _.map([...(state.history || [screenRoute])], () => screenRoute);

        // Force drawer to close and show the report screen
        history.push({
            type: 'drawer',
            status: 'closed',
        });
        return CommonActions.reset({
            ...state,
            routes: [{
                name: newScreenName,
                params: newScreenParams,
            }],
            history,
        });
    };
}

export default {
    pushDrawerRoute,
    navigateBackToRootDrawer,
};
