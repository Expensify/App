import isCentralPaneName from '@libs/NavigationUtils';
import type {CentralPaneName} from './AppNavigator/CENTRAL_PANE_SCREENS';
import type {NavigationPartialRoute, RootStackParamList, State} from './types';

// Get the name of topmost central pane route in the navigation stack.
function getTopmostCentralPaneRoute(state: State<RootStackParamList>): NavigationPartialRoute<CentralPaneName> | undefined {
    if (!state) {
        return;
    }

    const topmostCentralPane = state.routes.filter((route) => isCentralPaneName(route.name)).at(-1);

    if (!topmostCentralPane) {
        return;
    }

    return topmostCentralPane as NavigationPartialRoute<CentralPaneName>;
}

export default getTopmostCentralPaneRoute;
