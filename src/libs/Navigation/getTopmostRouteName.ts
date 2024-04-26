import type {NavigationState, PartialState} from '@react-navigation/native';

// Get the name of topmost route in the navigation stack.
function getTopmostRouteName(state: NavigationState | PartialState<NavigationState>): string | undefined {
    if (!state) {
        return;
    }

    return state.routes.at(-1)?.name;
}

export default getTopmostRouteName;
