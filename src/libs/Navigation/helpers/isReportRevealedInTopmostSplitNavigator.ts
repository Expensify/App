import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';

/**
 * Returns true only when an actual report (SCREENS.REPORT) is revealed in the topmost Reports split
 * navigator — not when the empty Inbox sidebar (SCREENS.INBOX) merely happens to be the topmost tab.
 *
 * This is the "is a report revealed" question that getCentralPaneReportID also answers, but it adds a
 * live→preserved fallback one level deeper (the split's inner routes) — the same fallback that
 * getTopmostFullScreenRoute already applies at the tab level. Without it, the read can miss a
 * deep-linked report whose split state has been stripped to preserved-only inside the onboarding
 * microtask, which would send the user to Home and reintroduce the regression fixed in #85242.
 */
function isReportRevealedInTopmostSplitNavigator(): boolean {
    const topmostFullScreenRoute = getTopmostFullScreenRoute();

    // The topmost full-screen tab must be the Reports split navigator. getTopmostFullScreenRoute already
    // resolves this through its own tab-level live→preserved fallback.
    if (topmostFullScreenRoute?.name !== NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        return false;
    }

    // Descend into the split's inner routes: live state first, then the preserved-state fallback keyed on
    // the split route's key (the piece getCentralPaneReportID lacks) so a revealed report isn't missed
    // when the live state has been stripped inside the onboarding microtask.
    const innerRoutes: ReadonlyArray<{name: string}> | undefined =
        topmostFullScreenRoute.state?.routes ?? (topmostFullScreenRoute.key ? getPreservedNavigatorState(topmostFullScreenRoute.key)?.routes : undefined);

    // A report is revealed only when a SCREENS.REPORT is present in the split, not just the SCREENS.INBOX sidebar.
    return !!innerRoutes?.some((route) => route.name === SCREENS.REPORT);
}

export default isReportRevealedInTopmostSplitNavigator;
