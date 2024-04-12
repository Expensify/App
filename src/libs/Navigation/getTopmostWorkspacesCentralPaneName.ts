import type {NavigationState, PartialState} from '@react-navigation/native';

// Get the name of topmost report in the navigation stack.
function getTopmostWorkspacesCentralPaneName(state: NavigationState | PartialState<NavigationState>): string | undefined {
    if (!state) {
        return;
    }

    return state.routes.at(-1)?.name
}

export default getTopmostWorkspacesCentralPaneName;
