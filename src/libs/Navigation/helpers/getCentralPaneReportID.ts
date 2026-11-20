import navigationRef from '@libs/Navigation/navigationRef';

import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';
import getTopmostReportParams from './getTopmostReportParams';
import {isReportSplitNavigatorName} from './isNavigatorName';

/**
 * The reportID of the report shown in the central pane, or undefined. getTopmostReportParams only descends into
 * the reports split navigator, so this returns the central-pane report even when an RHP overlay sits on top of
 * it (the RHP lives in a separate navigator) — i.e. the report "behind" the overlay.
 *
 * Gated on the reports split navigator being the *active* full-screen tab: getTopmostReportParams scans all tab
 * routes, so a report left open on an inactive Inbox tab would otherwise leak through as a stale central report.
 */
function getCentralPaneReportID(): string | undefined {
    if (!isReportSplitNavigatorName(getTopmostFullScreenRoute()?.name)) {
        return undefined;
    }
    return getTopmostReportParams(navigationRef.getRootState())?.reportID;
}

export default getCentralPaneReportID;
