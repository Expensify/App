import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

// This is an optimization to keep mounted only last few screens in the stack.
// We keep the last full screen and the one before it to avoid unmounting persistent screens
// (like ReportsSplitNavigator) which contain heavy component trees (e.g. LHN with thousands of items).
export default function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    const indexToSlice = Math.max(0, lastSplitIndex - 1);
    const routesToRender = state.routes.slice(indexToSlice, state.routes.length);
    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
