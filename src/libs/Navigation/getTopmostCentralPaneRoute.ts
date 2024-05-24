import isCentralPaneScreen from '@libs/NavigationUtils';
import type {CentralPaneScreen} from './AppNavigator/CENTRAL_PANE_SCREENS';
import type {NavigationPartialRoute, RootStackParamList, State} from './types';

// Get the name of topmost central pane route in the navigation stack.
function getTopmostCentralPaneRoute(state: State<RootStackParamList>): NavigationPartialRoute<CentralPaneScreen> | undefined {
    if (!state) {
        return;
    }

    const topmostCentralPane = state.routes.filter((route) => isCentralPaneScreen(route.name)).at(-1);

    if (!topmostCentralPane) {
        return;
    }

    return topmostCentralPane as NavigationPartialRoute<CentralPaneScreen>;
}

export default getTopmostCentralPaneRoute;
