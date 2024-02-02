import NAVIGATORS from '@src/NAVIGATORS';
import type {CentralPaneName, NavigationPartialRoute, RootStackParamList, State} from './types';

// Get the name of topmost central pane route in the navigation stack.
function getTopmostCentralPaneRoute(state: State<RootStackParamList>): NavigationPartialRoute<CentralPaneName> | undefined {
    if (!state) {
        return;
    }

    const topmostCentralPane = state.routes.filter((route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR).at(-1);

    if (!topmostCentralPane) {
        return;
    }

    if (!!topmostCentralPane.params && 'screen' in topmostCentralPane.params) {
        return {name: topmostCentralPane.params.screen as CentralPaneName, params: topmostCentralPane.params.params};
    }

    if (!topmostCentralPane.state) {
        return;
    }

    // There will be at least one route in the central pane navigator.
    const {name, params} = topmostCentralPane.state.routes.at(-1) as NavigationPartialRoute<CentralPaneName>;

    return {name, params};
}

export default getTopmostCentralPaneRoute;
