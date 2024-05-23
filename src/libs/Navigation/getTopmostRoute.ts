import type {NavigationState, PartialState} from '@react-navigation/native';

// Get the name of topmost route in the navigation stack.
function getTopmostRoute(state: NavigationState | PartialState<NavigationState>) {
    if (!state) {
        return;
    }

    return state.routes.at(-1);
}

export default getTopmostRoute;
