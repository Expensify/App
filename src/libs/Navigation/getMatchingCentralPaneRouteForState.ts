import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';
import TAB_TO_CENTRAL_PANE_MAPPING from './TAB_TO_CENTRAL_PANE_MAPPING';
import type {CentralPaneName, NavigationPartialRoute, RootStackParamList, State} from './types';

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

// Get matching central pane route for bottom tab navigator. e.g HOME -> REPORT
function getMatchingCentralPaneRouteForState(state: State<RootStackParamList>): NavigationPartialRoute<CentralPaneName> | undefined {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    if (!topmostBottomTabRoute) {
        return;
    }

    const centralPaneName = TAB_TO_CENTRAL_PANE_MAPPING[topmostBottomTabRoute.name][0];

    if (topmostBottomTabRoute.name === SCREENS.WORKSPACE.INITIAL) {
        return {name: centralPaneName, params: topmostBottomTabRoute.params};
    }

    if (topmostBottomTabRoute.name === SCREENS.HOME) {
        return {name: centralPaneName, params: {reportID: getTopMostReportIDFromRHP(state)}};
    }

    return {name: centralPaneName};
}

export default getMatchingCentralPaneRouteForState;
