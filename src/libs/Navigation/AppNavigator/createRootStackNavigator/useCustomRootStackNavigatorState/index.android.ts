import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

// This is an optimization to keep mounted only last few screens in the stack.
// On native platforms, we store the last two routes to handle swiping back.
export default function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    const routesToRender = state.routes.slice(Math.max(0, lastSplitIndex - 1), state.routes.length);

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
