import {StackRouter} from '@react-navigation/native';
import lodashFindLast from 'lodash/findLast';
import _ from 'underscore';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * @param {Object} state - react-navigation state
 * @param {String} centralRoute - name of the central route
 * @returns {Boolean}
 */
const isAtLeastOneCentralPaneNavigatorInState = (state, centralRoute) => _.find(state.routes, (r) => r.name === centralRoute);

/**
 * @param {Object} state - react-navigation state
 * @returns {String}
 */
const getTopMostReportIDFromRHP = (state) => {
    if (!state) {
        return '';
    }
    const topmostRightPane = lodashFindLast(state.routes, (route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

    if (topmostRightPane) {
        return getTopMostReportIDFromRHP(topmostRightPane.state);
    }

    const topmostRoute = lodashFindLast(state.routes);

    if (topmostRoute.state) {
        return getTopMostReportIDFromRHP(topmostRoute.state);
    }

    if (topmostRoute.params && topmostRoute.params.reportID) {
        return topmostRoute.params.reportID;
    }

    return '';
};
/**
 * Adds report route without any specific reportID to the state.
 * The report screen will self set proper reportID param based on the helper function findLastAccessedReport (look at ReportScreenWrapper for more info)
 *
 * @param {Object} state - react-navigation state
 * @param {String} centralRoute - name of the central route
 */
const addCentralPaneNavigatorRoute = (state, centralRoute) => {
    let centralPaneNavigatorRoute;
    if (centralRoute === NAVIGATORS.CENTRAL_PANE_NAVIGATOR) {
        const reportID = getTopMostReportIDFromRHP(state);
        centralPaneNavigatorRoute = {
            name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
            state: {
                routes: [
                    {
                        name: SCREENS.REPORT,
                        params: {
                            reportID,
                        },
                    },
                ],
            },
        };
    } else {
        centralPaneNavigatorRoute = {
            name: centralRoute,
            state: {
                routes: [
                    {
                        name: SCREENS.SETTINGS.PROFILE,
                    },
                ],
            },
        };
    }
    state.routes.splice(1, 0, centralPaneNavigatorRoute);
    // eslint-disable-next-line no-param-reassign
    state.index = state.routes.length - 1;
};

const addLHPRoute = (state, centralRoute) => {
    const settingsHomeRoute = {
        name: SCREENS.SETTINGS_HOME,
    };
    if (state.routes[0].name !== SCREENS.SETTINGS_HOME && centralRoute === 'SettingsCentralPane') {
        state.routes.splice(0, 0, settingsHomeRoute);
        // eslint-disable-next-line no-param-reassign
        state.index = state.routes.length - 1;
    }
}

function CustomRouter(options) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getInitialState({routeNames, routeParamList, routeGetIdList}) {
            console.log('getInitialState', routeNames, routeParamList, routeGetIdList);
            const centralRoute = options.centralRoute();
            const initialState = stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});
            if (!isAtLeastOneCentralPaneNavigatorInState(initialState, centralRoute) && !options.getIsSmallScreenWidth()) {
                addCentralPaneNavigatorRoute(initialState, centralRoute);
            }
            return initialState;
        },
        getRehydratedState(partialState, {routeNames, routeParamList}) {
            const centralRoute = options.centralRoute();
            console.log('getRehydratedState', centralRoute);
            // Make sure that there is at least one CentralPaneNavigator (ReportScreen by default) in the state if this is a wide layout
            if (!isAtLeastOneCentralPaneNavigatorInState(partialState, centralRoute) && !options.getIsSmallScreenWidth()) {
                console.log('getRehydratedState', centralRoute, 'adding central pane');
                // If we added a route we need to make sure that the state.stale is true to generate new key for this route
                // eslint-disable-next-line no-param-reassign
                partialState.stale = true;
                addCentralPaneNavigatorRoute(partialState, centralRoute);
            }
            addLHPRoute(partialState, centralRoute);
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList});
            return state;
        },
    };
}

export default CustomRouter;
