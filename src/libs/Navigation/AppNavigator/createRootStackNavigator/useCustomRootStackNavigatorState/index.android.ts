import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';
import reuseNavigatorKey from './reuseNavigatorKey';

// This is an optimization to keep mounted only last few screens in the stack.
export default function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));

    // Always preserve the previous fullscreen route so React can reuse the mounted navigator component on navigation.
    const indexToSlice = Math.max(0, lastSplitIndex - 1);
    const routesToRender = state.routes.slice(indexToSlice, state.routes.length);
    const remappedRoutes = reuseNavigatorKey(routesToRender, state);
    return {...state, routes: remappedRoutes, index: remappedRoutes.length - 1};
}
