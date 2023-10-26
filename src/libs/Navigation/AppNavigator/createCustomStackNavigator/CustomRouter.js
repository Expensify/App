import _ from 'underscore';
import {StackRouter} from '@react-navigation/native';
import lodashFindLast from 'lodash/findLast';
import NAVIGATORS from '../../../../NAVIGATORS';
import SCREENS from '../../../../SCREENS';

/**
 * @param {Object} state - react-navigation state
 * @returns {Boolean}
 */
const isAtLeastOneCentralPaneNavigatorInState = (state) => _.find(state.routes, (r) => r.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);

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
 */
const addCentralPaneNavigatorRoute = (state) => {
    const reportID = getTopMostReportIDFromRHP(state);
    const centralPaneNavigatorRoute = {
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
    state.routes.splice(1, 0, centralPaneNavigatorRoute);
    // eslint-disable-next-line no-param-reassign
    state.index = state.routes.length - 1;
};

function CustomRouter(options) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getRehydratedState(partialState, {routeNames, routeParamList}) {
            // Make sure that there is at least one CentralPaneNavigator (ReportScreen by default) in the state if this is a wide layout
            if (!isAtLeastOneCentralPaneNavigatorInState(partialState) && !options.getIsSmallScreenWidth()) {
                // If we added a route we need to make sure that the state.stale is true to generate new key for this route
                // eslint-disable-next-line no-param-reassign
                partialState.stale = true;
                addCentralPaneNavigatorRoute(partialState);
            }
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList});
            return state;
        },
    };
}

export default CustomRouter;
