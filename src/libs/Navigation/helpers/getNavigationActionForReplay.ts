import navigationRef from '@libs/Navigation/navigationRef';

import type {NavigationAction} from '@react-navigation/native';

const BACK_ACTION_TYPES = new Set<string>(['GO_BACK', 'POP', 'POP_TO_TOP']);

/**
 * A blocked navigation is replayed through the container, which hands an action without a target to the deepest focused navigator.
 * The RHP overlay sends its GO_BACK without a target from the root-level RHP route, where the root navigator handled it and closed
 * the whole RHP. Replayed through the container, it would only pop the top screen of the inner stack and leave the RHP open.
 * Targeting the root restores the original handling. The spread keeps react-navigation's visited-routes marker.
 */
function getNavigationActionForReplay(action: NavigationAction): NavigationAction {
    if (action.target || !action.source || !BACK_ACTION_TYPES.has(action.type)) {
        return action;
    }

    const rootState = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
    if (!rootState?.routes.some((route) => route.key === action.source)) {
        return action;
    }

    return {...action, target: rootState.key};
}

export default getNavigationActionForReplay;
