// import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import TAB_TO_CENTRAL_PANE_MAPPING from './TAB_TO_CENTRAL_PANE_MAPPING';
import type {BottomTabName, NavigationPartialRoute, RootStackParamList, State} from './types';

// Get the route that matches the topmost central pane route in the navigation stack. e.g REPORT -> HOME
function getMatchingBottomTabRouteForState(state: State<RootStackParamList>): NavigationPartialRoute<BottomTabName> {
    const defaultRoute = {name: SCREENS.HOME};
    const topmostCentralPaneRoute = getTopmostCentralPaneRoute(state);

    if (topmostCentralPaneRoute === undefined) {
        return defaultRoute;
    }

    for (const [tabName, centralPaneNames] of Object.entries(TAB_TO_CENTRAL_PANE_MAPPING)) {
        if (centralPaneNames.includes(topmostCentralPaneRoute.name)) {
            if (tabName === SCREENS.WORKSPACE.INITIAL) {
                return {name: tabName, params: topmostCentralPaneRoute.params};
            }
            return {name: tabName as BottomTabName};
        }
    }

    return defaultRoute;
}

export default getMatchingBottomTabRouteForState;
