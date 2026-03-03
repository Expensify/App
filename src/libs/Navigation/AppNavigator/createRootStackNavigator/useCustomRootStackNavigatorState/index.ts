import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

// This is an optimization to keep mounted only last few screens in the stack.
// We keep the last full screen and the one before it to avoid unmounting persistent screens
// (like ReportsSplitNavigator) which contain heavy component trees (e.g. LHN with thousands of items).
export default function useCustomRootStackNavigatorState({state, persistentScreens}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    const indexToSlice = Math.max(0, lastSplitIndex - 1);

    if (indexToSlice === 0) {
        return {...state, routes: state.routes, index: state.routes.length - 1};
    }

    // Collect persistent routes that fell outside the slice window
    const persistentScreensSet = persistentScreens ? new Set(persistentScreens) : undefined;
    const persistentRoutesBefore = [];
    for (let i = 0; i < indexToSlice; i++) {
        const route = state.routes.at(i);
        if (route && persistentScreensSet?.has(route.name)) {
            persistentRoutesBefore.push(route);
        }
    }

    const slicedRoutes = state.routes.slice(indexToSlice);
    const routesToRender = persistentRoutesBefore.length > 0 ? [...persistentRoutesBefore, ...slicedRoutes] : slicedRoutes;

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
