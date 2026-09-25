import type {NavigationState, PartialState} from '@react-navigation/native';

import getFocusedLeafScreenName from './getFocusedLeafScreenName';

/**
 * Leaf screen name the focused route chain would resolve to if the deepest stack with something to pop popped once.
 * Returns undefined when nothing in the chain can be popped.
 */
function getLeafScreenNameAfterPop(state: NavigationState | PartialState<NavigationState> | undefined): string | undefined {
    if (!state?.routes?.length) {
        return undefined;
    }
    // PartialState (e.g. from getStateFromPath on cold-start) may omit index; React Navigation treats the last route as focused.
    const focusedIndex = state.index ?? state.routes.length - 1;
    const focused = state.routes[focusedIndex];

    // The innermost stack is the one the gesture pops, so it wins over anything above it.
    const deeperName = focused?.state ? getLeafScreenNameAfterPop(focused.state) : undefined;
    if (deeperName) {
        return deeperName;
    }

    if (focusedIndex <= 0) {
        return undefined;
    }
    const previous = state.routes[focusedIndex - 1];
    return previous?.state ? getFocusedLeafScreenName(previous.state) : previous?.name;
}

export default getLeafScreenNameAfterPop;
