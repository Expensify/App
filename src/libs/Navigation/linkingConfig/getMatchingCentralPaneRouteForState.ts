import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import type {CentralPaneName, CentralPaneNavigatorParamList, NavigationPartialRoute, RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import TAB_TO_CENTRAL_PANE_MAPPING from './TAB_TO_CENTRAL_PANE_MAPPING';

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

// Function that checks if the given route has a policyID equal to the id provided in the function params
function hasRouteMatchingPolicyID(route: NavigationPartialRoute<CentralPaneName>, policyID?: string) {
    return (
        route?.params &&
        'params' in route?.params &&
        route.params.params &&
        'policyID' in (route.params.params as Record<string, string | undefined>) &&
        (route.params.params as Record<string, string | undefined>).policyID === policyID
    );
}

// Function that restores already open screen in the settings tab. Thanks to this function, we are able to open the already selected screen in the workspace settings when we return from another tab.
function getAlreadyOpenSettingsScreen(rootState?: State, policyID?: string): keyof CentralPaneNavigatorParamList | undefined {
    if (!rootState) {
        return undefined;
    }

    // If one of the screen from WORKSPACES_SCREENS is now in the navigation state, we can decide which screen we should display.
    // A screen from the navigation state can be pushed to the navigation state again only if it has a matching policyID with the currently selected workspace.
    // Otherwise, when we switch the workspace, we want to display the initial screen in the settings tab.
    const WORKSPACES_SCREENS = TAB_TO_CENTRAL_PANE_MAPPING[SCREENS.WORKSPACE.INITIAL].concat(TAB_TO_CENTRAL_PANE_MAPPING[SCREENS.ALL_SETTINGS]);

    const alreadyOpenedSettingsTab = rootState.routes
        .filter((item) => item.params && 'screen' in item.params && WORKSPACES_SCREENS.includes(item.params.screen as keyof CentralPaneNavigatorParamList))
        .at(-1);

    if (
        alreadyOpenedSettingsTab?.params &&
        'screen' in alreadyOpenedSettingsTab?.params &&
        hasRouteMatchingPolicyID(alreadyOpenedSettingsTab as NavigationPartialRoute<CentralPaneName>, policyID)
    ) {
        return alreadyOpenedSettingsTab?.params?.screen as keyof CentralPaneNavigatorParamList;
    }

    return undefined;
}

// Get matching central pane route for bottom tab navigator. e.g HOME -> REPORT
function getMatchingCentralPaneRouteForState(state: State<RootStackParamList>, rootState?: State): NavigationPartialRoute<CentralPaneName> | undefined {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    if (!topmostBottomTabRoute) {
        return;
    }

    const centralPaneName = TAB_TO_CENTRAL_PANE_MAPPING[topmostBottomTabRoute.name][0];

    if (topmostBottomTabRoute.name === SCREENS.WORKSPACE.INITIAL) {
        // When we go back to the settings tab without switching the workspace id, we want to return to the previously open screen
        const policyID = topmostBottomTabRoute?.params && 'policyID' in topmostBottomTabRoute?.params ? (topmostBottomTabRoute.params.policyID as string) : undefined;
        const alreadyOpenedSettingsTab = getAlreadyOpenSettingsScreen(rootState, policyID) ?? centralPaneName;
        return {name: alreadyOpenedSettingsTab, params: topmostBottomTabRoute.params};
    }

    if (topmostBottomTabRoute.name === SCREENS.HOME) {
        return {name: centralPaneName, params: {reportID: getTopMostReportIDFromRHP(state)}};
    }

    return {name: centralPaneName};
}

export default getMatchingCentralPaneRouteForState;
