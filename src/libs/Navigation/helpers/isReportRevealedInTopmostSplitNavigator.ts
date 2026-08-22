import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';

/**
 * Onboarding can remove the live split state before this check, which would send a deep-linked report to Home.
 */
function isReportRevealedInTopmostSplitNavigator(): boolean {
    const topmostFullScreenRoute = getTopmostFullScreenRoute();

    if (topmostFullScreenRoute?.name !== NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        return false;
    }

    const innerRoutes: ReadonlyArray<{name: string; params?: unknown}> | undefined =
        topmostFullScreenRoute.state?.routes ?? (topmostFullScreenRoute.key ? getPreservedNavigatorState(topmostFullScreenRoute.key)?.routes : undefined);

    // A wide layout pads the split with a placeholder SCREENS.REPORT route that carries no reportID (or an empty one),
    // so matching on the route name alone would treat that empty placeholder as a revealed report. Require a non-empty reportID.
    return !!innerRoutes?.some(
        (route) => route.name === SCREENS.REPORT && typeof route.params === 'object' && route.params !== null && 'reportID' in route.params && !!route.params.reportID,
    );
}

export default isReportRevealedInTopmostSplitNavigator;
