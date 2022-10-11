import _ from 'underscore';
import {
    CommonActions, StackActions, DrawerActions, getStateFromPath,
} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import linkingConfig from './linkingConfig';
import navigationRef from './navigationRef';
import SCREENS from '../../SCREENS';

/**
 * @returns {Object}
 */
function getActiveState() {
    // We use our RootState as the dispatch's state is relative to the active navigator and might not contain our active screen.
    return navigationRef.current.getRootState();
}

/**
 * Go back to the Main Drawer
 * @deprecated
 * @param {Object} navigationRef
 */
function navigateBackToRootDrawer() {
    const activeState = getActiveState();

    // To navigate to the main drawer Route, pop to the first route on the Root Stack Navigator as the main drawer is always the first route that is activated.
    // It will pop all fullscreen and RHN modals that are over the main drawer.
    // It won't work when the main drawer is not the first route of the Root Stack Navigator which is not the case ATM.
    navigationRef.current.dispatch({
        ...StackActions.popToTop(),
        target: activeState.key,
    });
}

/**
 * Extracts the route from state object. Note: In the context where this is used currently the method is dependable.
 * However, as our navigation system grows in complexity we may need to revisit this to be sure it is returning the expected route object.
 *
 * @param {Object} state
 * @return {Object}
 */
function getRouteFromState(state) {
    return lodashGet(state, 'routes[0].state.routes[0]', {});
}

/**
 * @param {Object} state
 * @returns {Object}
 */
function getParamsFromState(state) {
    return getRouteFromState(state).params || {};
}

/**
 * @param {Object} state
 * @returns {String}
 */
function getScreenNameFromState(state) {
    return getRouteFromState(state).name || '';
}

/**
 * Special accomodation must be made for navigating to a screen inside a DrawerNavigator (e.g. our ReportScreen). The web/mWeb default behavior when
 * calling "navigate()" does not give us the browser history we would expect for a typical web paradigm (e.g. that navigating from one screen another
 * should allow us to navigate back to the screen we were on previously). This custom action helps us get around these problems.
 *
 * More context here: https://github.com/react-navigation/react-navigation/issues/9744
 *
 * @deprecated
 * @param {String} route
 * @returns {Function}
 */
function pushDrawerRoute(route) {
    return (currentState) => {
        // Parse the state, name, and params from the new route we want to navigate to.
        const newStateFromRoute = getStateFromPath(route, linkingConfig.config);
        const newScreenName = getScreenNameFromState(newStateFromRoute);
        const newScreenParams = getParamsFromState(newStateFromRoute);

        // When we are navigating away from a non-drawer navigator we need to first dismiss any screens pushed onto the main stack.
        if (currentState.type !== 'drawer') {
            navigateBackToRootDrawer();
        }

        // If we're trying to navigate to the same screen that is already active there's nothing more to do except close the drawer.
        // This prevents unnecessary re-rendering the screen and adding duplicate items to the browser history.
        const activeState = getActiveState();
        const activeScreenName = getScreenNameFromState(activeState);
        const activeScreenParams = getParamsFromState(activeState);
        if (newScreenName === activeScreenName && _.isEqual(activeScreenParams, newScreenParams)) {
            return DrawerActions.closeDrawer();
        }

        let state = currentState;

        // When navigating from non-Drawer navigator we switch to using the new state generated from the provided route. If we are navigating away from a non-Drawer navigator the
        // currentState will not have a history field to use. By using the state from the route we create a "fresh state" that we can use to setup the browser history again.
        // Note: A current limitation with this is that navigating "back" won't display the routes we have cleared out e.g. SearchPage and the history effectively gets "reset".
        if (currentState.type !== 'drawer') {
            state = newStateFromRoute;
        }

        const screenRoute = {type: 'route', name: newScreenName};
        const history = _.map(state.history ? [...state.history] : [screenRoute], () => screenRoute);

        const drawerHistoryItem = _.find(state.history || [], h => h.type === 'drawer');
        const isDrawerClosed = drawerHistoryItem && drawerHistoryItem.status === 'closed';
        if (!drawerHistoryItem || currentState.type !== 'drawer') {
            // Add the drawer item to the navigation history to control if the drawer should be in open or closed state
            history.push({
                type: 'drawer',

                // If current state is not from drawer navigator then always force the drawer to close by using closed status
                // https://github.com/react-navigation/react-navigation/blob/94ab791cae5061455f036cd3f6bc7fa63167e7c7/packages/routers/src/DrawerRouter.tsx#L142
                status: currentState.type !== 'drawer' || currentState.default === 'open' ? 'closed' : 'open',
            });
        } else if (isDrawerClosed) {
            // Keep the drawer closed if it's already closed
            history.push({
                type: 'drawer',
                status: 'closed',
            });
        }

        const routes = [{
            name: newScreenName,
            params: newScreenParams,
        }];

        // Keep the same key so the ReportScreen does not completely re-mount
        if (newScreenName === SCREENS.REPORT) {
            const prevReportRoute = getRouteFromState(getActiveState());
            if (prevReportRoute.key) {
                routes[0].key = prevReportRoute.key;
            }
        }

        return CommonActions.reset({
            ...state,
            routes,
            history,
        });
    };
}

export default {
    pushDrawerRoute,
    navigateBackToRootDrawer,
};
