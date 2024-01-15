// import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import {CENTRAL_PANE_TO_TAB_MAPPING} from './TAB_TO_CENTRAL_PANE_MAPPING';
import type {BottomTabName, NavigationPartialRoute, RootStackParamList, State} from './types';

// Get the route that matches the topmost central pane route in the navigation stack. e.g REPORT -> HOME
function getMatchingBottomTabRouteForState(state: State<RootStackParamList>): NavigationPartialRoute<BottomTabName> {
    const defaultRoute = {name: SCREENS.HOME};
    const topmostCentralPaneRoute = getTopmostCentralPaneRoute(state);

    if (topmostCentralPaneRoute === undefined) {
        return defaultRoute;
    }

    const tabName = CENTRAL_PANE_TO_TAB_MAPPING[topmostCentralPaneRoute.name];
    if (tabName === SCREENS.WORKSPACE.INITIAL) {
        return {name: tabName, params: topmostCentralPaneRoute.params};
    }
    return {name: tabName as BottomTabName} || defaultRoute;
}

export default getMatchingBottomTabRouteForState;
