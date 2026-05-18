import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';
import ensureTabNavigatorRoutes from './ensureTabNavigatorRoutes';
import restoreTabNavigatorRoutes from './restoreTabNavigatorRoutes';

// This is an optimization to keep mounted only last few screens in the stack.
// On native platforms, we keep the route before the last full-screen so the swipe-back gesture
// can render the previous screen during the gesture.
export default function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    const indexToSlice = Math.max(0, lastSplitIndex - 1);
    const slicedRoutes = state.routes.slice(indexToSlice, state.routes.length);
    const routesToRender = restoreTabNavigatorRoutes(ensureTabNavigatorRoutes(slicedRoutes, indexToSlice, state.routes));

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
