import {StackRouter} from '@react-navigation/native';
import lodashFindLast from 'lodash/findLast';
import _ from 'underscore';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * @param {Object} state - react-navigation state
 * @returns {Boolean}
 */
const isAtLeastOneCentralPaneNavigatorInState = (state) => _.find(state.routes, (r) => r.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);
const isAtLeastOneInState = (state, screenName) => _.find(state.routes, (r) => r.name === screenName);

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

const mapScreenNameToSettingsScreenName = {
    "Settings_Display_Name": SCREENS.PROFILE,
    "Settings_ContactMethods": SCREENS.PROFILE,
    "Settings_ContactMethodDetails": SCREENS.PROFILE,
    "Settings_TwoFactorAuth": SCREENS.SETTINGS.SECURITY,
    "Settings_Preferences_Language": SCREENS.SETTINGS.PREFERENCES,
    "Settings_Preferences_Theme": SCREENS.SETTINGS.PREFERENCES,
    "Settings_Preferences_PriorityMode": SCREENS.SETTINGS.PREFERENCES,
}

const handleSettingsOpened = (state) => {
    const rhpNav = _.find(state.routes, (r) => r.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    if (!rhpNav || !rhpNav.state || !rhpNav.state.routes || !rhpNav.state.routes[0]) {
        return;
    }
    const screen = rhpNav.state.routes[0];
    // check if we are on settings screen
    if (screen.name !== 'Settings') {
        return;
    }
    // check if we already have settings home route
    if (isAtLeastOneInState(state, NAVIGATORS.FULL_SCREEN_NAVIGATOR)) {
        return;
    }

    const settingsScreenName = screen.state.routes[0];

    const settingsHomeRouteName = mapScreenNameToSettingsScreenName[settingsScreenName.name] || SCREENS.SETTINGS.PROFILE;

    const fullScreenRoute = {
        name: NAVIGATORS.FULL_SCREEN_NAVIGATOR,
        state: {
            routes: [
                {
                    name: SCREENS.SETTINGS_HOME,
                },
                {
                    name: SCREENS.SETTINGS_CENTRAL_PANE,
                    state: {
                        routes: [
                            {
                                name: settingsHomeRouteName,
                            },
                        ]
                    }
                }
            ],
        },
    };
    state.routes.splice(2, 0, fullScreenRoute);
    // eslint-disable-next-line no-param-reassign
    state.index = state.routes.length - 1;
    // eslint-disable-next-line no-param-reassign
    state.stale = true;
}

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
            handleSettingsOpened(partialState);
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList});
            return state;
        },
    };
}

export default CustomRouter;
