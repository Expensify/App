import type {NavigationState, PartialState} from '@react-navigation/native';
import SCREENS from '@src/SCREENS';

// Get the name of topmost report in the navigation stack.
function getTopmostCentralPanePath(state: NavigationState | PartialState<NavigationState>): string | undefined {
    if (!state) {
        return;
    }

    const topmostCentralPane = state.routes.filter((route) => typeof route !== 'number' && 'name' in route && route.name === SCREENS.SETTINGS_CENTRAL_PANE).at(-1);

    if (!topmostCentralPane || typeof topmostCentralPane === 'number' || !('state' in topmostCentralPane)) {
        return;
    }

    return topmostCentralPane.state?.routes.at(-1)?.path;
}

export default getTopmostCentralPanePath;
