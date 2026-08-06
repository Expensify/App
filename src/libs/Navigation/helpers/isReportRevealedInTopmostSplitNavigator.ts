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

    const innerRoutes: ReadonlyArray<{name: string}> | undefined =
        topmostFullScreenRoute.state?.routes ?? (topmostFullScreenRoute.key ? getPreservedNavigatorState(topmostFullScreenRoute.key)?.routes : undefined);

    return !!innerRoutes?.some((route) => route.name === SCREENS.REPORT);
}

export default isReportRevealedInTopmostSplitNavigator;
