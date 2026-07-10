import navigationRef from '@libs/Navigation/navigationRef';

import getTopmostReportParams from './getTopmostReportParams';

/**
 * The reportID of the report shown in the central pane, or undefined. getTopmostReportParams only descends into
 * the reports split navigator, so this returns the central-pane report even when an RHP overlay sits on top of
 * it (the RHP lives in a separate navigator) — i.e. the report "behind" the overlay.
 */
function getCentralPaneReportID(): string | undefined {
    return getTopmostReportParams(navigationRef.getRootState())?.reportID;
}

export default getCentralPaneReportID;
