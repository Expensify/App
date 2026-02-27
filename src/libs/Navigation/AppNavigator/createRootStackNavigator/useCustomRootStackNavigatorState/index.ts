import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

export default function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    let indexToSlice = Math.max(0, lastSplitIndex);
    const hasPrevRoute = lastSplitIndex > 0;
    const isPrevFullScreen = isFullScreenName(state.routes.at(lastSplitIndex - 1)?.name);

    if (hasPrevRoute && !isPrevFullScreen) {
        indexToSlice = lastSplitIndex - 1;
    }


    const firstKeyMap = new Map<string, string>();
    state.routes.forEach((route) => {
        if (!firstKeyMap.has(route.name)) {
            firstKeyMap.set(route.name, route.key);
        }
    });

    const routesToRender = state.routes.slice(indexToSlice).map((route) => {
        const firstKey = firstKeyMap.get(route.name);

        if (firstKey && route.key !== firstKey) {
            return {
                ...route,
                key: firstKey,
            };
        }
        return route;
    });

    return {
        ...state,
        routes: routesToRender,
        index: routesToRender.length - 1
    };
}
