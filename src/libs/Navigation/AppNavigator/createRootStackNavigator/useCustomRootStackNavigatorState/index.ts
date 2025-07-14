import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

// This is an optimization to keep mounted only last few screens in the stack.
export default function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    let indexToSlice = Math.max(0, lastSplitIndex);
    const hasPrevRoute = lastSplitIndex > 0;
    const isPrevFullScreen = !isFullScreenName(state.routes.at(lastSplitIndex - 1)?.name);
    // If the route before the last fullscreen is e.g. RHP, we should leave it to avoid bugs when going back to this screen.
    // This solves the issue: https://github.com/Expensify/App/pull/65500#issuecomment-3061323128
    if (hasPrevRoute && !isPrevFullScreen) {
        indexToSlice = lastSplitIndex - 1;
    }
    const routesToRender = state.routes.slice(indexToSlice, state.routes.length);
    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
