import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import type {BottomTabName, NavigationPartialRoute, RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import {CENTRAL_PANE_TO_TAB_MAPPING} from './TAB_TO_CENTRAL_PANE_MAPPING';

// Get the route that matches the topmost central pane route in the navigation stack. e.g REPORT -> HOME
function getMatchingBottomTabRouteForState(state: State<RootStackParamList>, policyID?: string): NavigationPartialRoute<BottomTabName> {
    const paramsWithPolicyID = policyID ? {policyID} : undefined;
    const defaultRoute = {name: SCREENS.HOME, params: paramsWithPolicyID};
    const isFullScreenNavigatorOpened = state.routes.some((route) => route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR);

    if (isFullScreenNavigatorOpened) {
        return {name: SCREENS.SETTINGS.ROOT, params: paramsWithPolicyID};
    }

    const topmostCentralPaneRoute = getTopmostCentralPaneRoute(state);

    if (topmostCentralPaneRoute === undefined) {
        return defaultRoute;
    }

    const tabName = CENTRAL_PANE_TO_TAB_MAPPING[topmostCentralPaneRoute.name];
    return {name: tabName, params: paramsWithPolicyID};
}

export default getMatchingBottomTabRouteForState;
