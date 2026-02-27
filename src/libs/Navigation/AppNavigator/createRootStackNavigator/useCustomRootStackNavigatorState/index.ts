import {screensWithEnteringAnimation, workspaceOrDomainSplitsWithoutEnteringAnimation} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

// This is an optimization to keep mounted only last few screens in the stack.
export default function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    let indexToSlice = Math.max(0, lastSplitIndex);
    const hasPrevRoute = lastSplitIndex > 0;
    const isPrevFullScreen = isFullScreenName(state.routes.at(lastSplitIndex - 1)?.name);

    // If the route before the last full screen is e.g. RHP, we should leave it in the rendered routes,
    // as there may be display issues (blank screen) when navigating back and recreating that route to render.
    if (hasPrevRoute && !isPrevFullScreen) {
        indexToSlice = lastSplitIndex - 1;
    }

    // Build map: navigator name → key of first occurrence in the full (unsliced) state.
    // We need the full state so we find the first key even if it was sliced out.
    const firstKeyMap = new Map<string, string>();
    for (const route of state.routes) {
        if (firstKeyMap.has(route.name)) {
            continue;
        }
        firstKeyMap.set(route.name, route.key);
    }

    const routesToRender = state.routes.slice(indexToSlice).map((route) => {
        // Only remap keys for fullscreen (split) navigators. Intermediate screens like WorkspacesList
        // must keep their own keys — remapping them causes the rendered state to look identical to
        // the previous render, so React Navigation skips the transition and shows a blank screen.
        if (!isFullScreenName(route.name)) {
            return route;
        }

        const firstKey = firstKeyMap.get(route.name);

        if (firstKey && route.key !== firstKey) {
            // Sync animation sets: the sets track keys added during getStateForAction (router level).
            // Since rendered key changes from route.key → firstKey, we must remap the set entries
            // so animation config (getFullscreenNavigatorOptions) picks up the right key.
            if (screensWithEnteringAnimation.has(route.key)) {
                screensWithEnteringAnimation.delete(route.key);
                screensWithEnteringAnimation.add(firstKey);
            }
            if (workspaceOrDomainSplitsWithoutEnteringAnimation.has(route.key)) {
                workspaceOrDomainSplitsWithoutEnteringAnimation.delete(route.key);
                workspaceOrDomainSplitsWithoutEnteringAnimation.add(firstKey);
            }
            return {...route, key: firstKey};
        }
        return route;
    });

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
