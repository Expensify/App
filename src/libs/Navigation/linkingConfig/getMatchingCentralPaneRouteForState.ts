import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import type {AuthScreensParamList, CentralPaneName, NavigationPartialRoute, RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import TAB_TO_CENTRAL_PANE_MAPPING from './RELATIONS/TAB_TO_CENTRAL_PANE_MAPPING';

/**
 * @param state - react-navigation state
 */
const getTopMostReportIDFromRHP = (state: State): string => {
    if (!state) {
        return '';
    }

    const topmostRightPane = state.routes.filter((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR).at(-1);

    if (topmostRightPane?.state) {
        return getTopMostReportIDFromRHP(topmostRightPane.state);
    }

    const topmostRoute = state.routes.at(-1);

    if (topmostRoute?.state) {
        return getTopMostReportIDFromRHP(topmostRoute.state);
    }

    if (topmostRoute?.params && 'reportID' in topmostRoute.params && typeof topmostRoute.params.reportID === 'string') {
        return topmostRoute.params.reportID;
    }

    return '';
};

// Get already opened settings screen within the policy
function getAlreadyOpenedSettingsScreen(rootState?: State): keyof AuthScreensParamList | undefined {
    if (!rootState) {
        return undefined;
    }

    // If one of the screen from TAB_TO_CENTRAL_PANE_MAPPING[SCREENS.SETTINGS.ROOT] is now in the navigation state, we can decide which screen we should display.
    // A screen from the navigation state can be pushed to the navigation state again only if it has a matching policyID with the currently selected workspace.
    // Otherwise, when we switch the workspace, we want to display the initial screen in the settings tab.
    const alreadyOpenedSettingsScreen = rootState.routes.filter((item) => TAB_TO_CENTRAL_PANE_MAPPING[SCREENS.SETTINGS.ROOT].includes(item.name as CentralPaneName)).at(-1);

    return alreadyOpenedSettingsScreen?.name as keyof AuthScreensParamList;
}

// Get matching central pane route for bottom tab navigator. e.g HOME -> REPORT
function getMatchingCentralPaneRouteForState(state: State<RootStackParamList>, rootState?: State): NavigationPartialRoute<CentralPaneName> | undefined {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    if (!topmostBottomTabRoute) {
        return;
    }

    const centralPaneName = TAB_TO_CENTRAL_PANE_MAPPING[topmostBottomTabRoute.name].at(0);
    if (!centralPaneName) {
        return;
    }

    if (topmostBottomTabRoute.name === SCREENS.SETTINGS.ROOT) {
        // When we go back to the settings tab without switching the workspace id, we want to return to the previously opened screen
        const screen = getAlreadyOpenedSettingsScreen(rootState) ?? centralPaneName;
        return {name: screen as CentralPaneName, params: topmostBottomTabRoute.params};
    }

    if (topmostBottomTabRoute.name === SCREENS.HOME) {
        return {name: centralPaneName, params: {reportID: getTopMostReportIDFromRHP(state)}};
    }

    return {name: centralPaneName};
}

export default getMatchingCentralPaneRouteForState;
