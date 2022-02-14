import _ from 'underscore';
import {
    CommonActions, StackActions, DrawerActions, getStateFromPath,
} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import linkingConfig from './linkingConfig';
import navigationRef from './navigationRef';

/**
 * @returns {Object}
 */
function getActiveState() {
    // We use our RootState as the dispatch's state is relative to the active navigator and might not contain our active screen.
    return navigationRef.current.getRootState();
}

/**
 * Go back to the Main Drawer
 * @param {Object} navigationRef
 */
function navigateBackToRootDrawer() {
    const activeState = getActiveState();

    //Dispatch "popToTop" action takes you back to the first screen in the stack at the same time 
    //it will prevent bubbling of action and limit it to activeState by specifing target.
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
 * @returns {Object}
 */
function getActiveState() {
    // We use our RootState as the dispatch's state is relative to the active navigator and might not contain our active screen.
    return navigationRef.current.getRootState();
}

/**
 * Special accomodation must be made for navigating to a screen inside a DrawerNavigator (e.g. our ReportScreen). The web/mWeb default behavior when
 * calling "navigate()" does not give us the browser history we would expect for a typical web paradigm (e.g. that navigating from one screen another
 * should allow us to navigate back to the screen we were on previously). This custom action helps us get around these problems.
 *
 * More context here: https://github.com/react-navigation/react-navigation/issues/9744
 *
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

        // Force drawer to close and show
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
