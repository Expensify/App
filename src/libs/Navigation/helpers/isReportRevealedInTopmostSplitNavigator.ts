import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';

/**
 * Returns true only when a report is revealed in the topmost Reports split navigator. Returns false when
 * the Reports tab is topmost but shows only the empty Inbox sidebar.
 *
 * The read falls back to the preserved navigator state because the split's live state can be stripped to
 * preserved-only inside the onboarding microtask. Without that fallback a deep-linked report is missed and
 * the user gets sent to Home.
 */
function isReportRevealedInTopmostSplitNavigator(): boolean {
    const topmostFullScreenRoute = getTopmostFullScreenRoute();

    // getTopmostFullScreenRoute applies the tab-level preserved-state fallback, so this stays correct when
    // the live tab state has been stripped.
    if (topmostFullScreenRoute?.name !== NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        return false;
    }

    const innerRoutes: ReadonlyArray<{name: string}> | undefined =
        topmostFullScreenRoute.state?.routes ?? (topmostFullScreenRoute.key ? getPreservedNavigatorState(topmostFullScreenRoute.key)?.routes : undefined);

    // Only a report counts as revealed. The Inbox sidebar on its own does not.
    return !!innerRoutes?.some((route) => route.name === SCREENS.REPORT);
}

export default isReportRevealedInTopmostSplitNavigator;
