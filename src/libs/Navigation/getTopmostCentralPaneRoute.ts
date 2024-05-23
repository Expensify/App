import NAVIGATORS from '@src/NAVIGATORS';
import CENTRAL_PANE_SCREEN_NAMES from './AppNavigator/Navigators/CENTRAL_PANE_SCREEN_NAMES';
import type {CentralPaneName, NavigationPartialRoute, RootStackParamList, State} from './types';

// Get the name of topmost central pane route in the navigation stack.
function getTopmostCentralPaneRoute(state: State<RootStackParamList>): NavigationPartialRoute<CentralPaneName> | undefined {
    if (!state) {
        return;
    }

    const topmostCentralPane = state.routes.filter((route) => CENTRAL_PANE_SCREEN_NAMES.includes(route.name)).at(-1);

    if (!topmostCentralPane) {
        return;
    }
    console.log('topmostCentralPane', topmostCentralPane);
    return topmostCentralPane;
}

export default getTopmostCentralPaneRoute;
