import type {NavigationState, PartialState} from '@react-navigation/native';
import SCREENS from '@src/SCREENS';

// Get the name of topmost report in the navigation stack.
function getTopmostWorkspacesCentralPaneName(state: NavigationState | PartialState<NavigationState>): string | undefined {
    if (!state) {
        return;
    }

    const topmostCentralPane = state.routes.filter((route) => typeof route !== 'number' && 'name' in route && route.name === SCREENS.WORKSPACES_CENTRAL_PANE).at(-1);

    if (!topmostCentralPane) {
        return;
    }

    if (!!topmostCentralPane.params && 'screen' in topmostCentralPane.params && typeof topmostCentralPane.params.screen === 'string') {
        return topmostCentralPane.params.screen;
    }

    if (!topmostCentralPane.state) {
        return;
    }

    return topmostCentralPane.state?.routes.at(-1)?.name;
}

export default getTopmostWorkspacesCentralPaneName;
