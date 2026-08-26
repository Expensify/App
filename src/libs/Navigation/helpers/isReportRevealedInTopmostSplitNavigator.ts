import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';

function hasNonEmptyReportID(params: unknown): boolean {
    return typeof params === 'object' && params !== null && !Array.isArray(params) && 'reportID' in params && typeof params.reportID === 'string' && params.reportID.length > 0;
}

function hasPendingReportRoute(params: unknown): boolean {
    return (
        typeof params === 'object' &&
        params !== null &&
        !Array.isArray(params) &&
        'screen' in params &&
        params.screen === SCREENS.REPORT &&
        'params' in params &&
        hasNonEmptyReportID(params.params)
    );
}

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
    const hasRevealedReport = !!innerRoutes?.some((route) => route.name === SCREENS.REPORT && hasNonEmptyReportID(route.params));

    return hasRevealedReport || hasPendingReportRoute(topmostFullScreenRoute.params);
}

export default isReportRevealedInTopmostSplitNavigator;
