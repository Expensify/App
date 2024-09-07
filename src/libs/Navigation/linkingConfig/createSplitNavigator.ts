import type {NavigationState, PartialState} from '@react-navigation/native';
import type {NavigationPartialRoute, SplitNavigatorScreenName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const mapLhnToSplitNavigatorName = {
    [SCREENS.SETTINGS.ROOT]: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    [SCREENS.HOME]: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    [SCREENS.WORKSPACE.INITIAL]: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
};

type SplitNavigatorLHNScreen = keyof typeof mapLhnToSplitNavigatorName;
type SplitNavigator = (typeof mapLhnToSplitNavigatorName)[SplitNavigatorLHNScreen];

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

function createSplitNavigator(
    splitNavigatorLHNScreen: SplitNavigatorLHNScreen,
    route?: NavigationPartialRoute<SplitNavigatorScreenName>,
    policyID?: string,
    key?: string,
): NavigationPartialRoute<SplitNavigator> {
    const routes = [];

    const params = policyID ? {policyID} : {};

    // Both routes in WorkspaceNavigator should store a policyID in params, so here this param is also passed to the screen displayed in LHN in WorkspaceNavigator
    routes.push({
        name: splitNavigatorLHNScreen,
    });

    if (route) {
        routes.push(route);
    }
    return {
        key,
        name: mapLhnToSplitNavigatorName[splitNavigatorLHNScreen],
        state: getRoutesWithIndex(routes),
        params,
    };
}

export default createSplitNavigator;
