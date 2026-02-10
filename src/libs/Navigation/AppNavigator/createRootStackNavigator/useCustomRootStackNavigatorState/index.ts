import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

// This is an optimization to keep mounted only last few screens in the stack.
// We always keep the first REPORTS_SPLIT_NAVIGATOR mounted (but frozen) so that
// switching back to Inbox tab can pop to it instead of remounting, improving performance.
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
    let routesToRender = state.routes.slice(indexToSlice, state.routes.length);

    // Keep the first REPORTS_SPLIT_NAVIGATOR in the rendered routes so it stays mounted (frozen)
    // when user is on another tab. This allows pop-back navigation to Inbox to be instant.
    const firstReportsSplitIndex = state.routes.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    if (firstReportsSplitIndex >= 0 && firstReportsSplitIndex < indexToSlice) {
        const reportsSplitRoute = state.routes.at(firstReportsSplitIndex);
        if (reportsSplitRoute) {
            routesToRender = [reportsSplitRoute, ...routesToRender];
        }
    }

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
