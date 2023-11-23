import {StackRouter} from '@react-navigation/native';
import _ from 'underscore';
import SCREENS from '@src/SCREENS';

/**
 * @param {Object} state - react-navigation state
 * @param {String} centralRoute - name of the central route
 * @returns {Boolean}
 */
const isAtLeastOneCentralPaneNavigatorInState = (state) => _.find(state.routes, (r) => r.name === 'SettingsCentralPane');

/**
 * Adds report route without any specific reportID to the state.
 * The report screen will self set proper reportID param based on the helper function findLastAccessedReport (look at ReportScreenWrapper for more info)
 *
 * @param {Object} state - react-navigation state
 */
const addCentralPaneNavigatorRoute = (state) => {
    const centralPaneNavigatorRoute = {
        name: 'SettingsCentralPane',
        state: {
            routes: [
                {
                    name: SCREENS.SETTINGS.PROFILE,
                },
            ],
        },
    };
    state.routes.splice(1, 0, centralPaneNavigatorRoute);
    // eslint-disable-next-line no-param-reassign
    state.index = state.routes.length - 1;
};

const addLHPRoute = (state) => {
    if (state.routes[0].name === SCREENS.SETTINGS_HOME) {
        return;
    }
    const settingsHomeRoute = {
        name: SCREENS.SETTINGS_HOME,
    };
    state.routes.splice(0, 0, settingsHomeRoute);
    // eslint-disable-next-line no-param-reassign
    state.index = state.routes.length - 1;
};

function CustomFullScreenRouter(options) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getInitialState({routeNames, routeParamList, routeGetIdList}) {
            const initialState = stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});
            if (!isAtLeastOneCentralPaneNavigatorInState(initialState) && !options.getIsSmallScreenWidth()) {
                addCentralPaneNavigatorRoute(initialState);
            }
            return initialState;
        },
        getRehydratedState(partialState, {routeNames, routeParamList}) {
            // Make sure that there is at least one CentralPaneNavigator (ReportScreen by default) in the state if this is a wide layout
            if (!isAtLeastOneCentralPaneNavigatorInState(partialState) && !options.getIsSmallScreenWidth()) {
                // If we added a route we need to make sure that the state.stale is true to generate new key for this route
                // eslint-disable-next-line no-param-reassign
                partialState.stale = true;
                addCentralPaneNavigatorRoute(partialState);
            }
            addLHPRoute(partialState);
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList});
            return state;
        },
    };
}

export default CustomFullScreenRouter;
