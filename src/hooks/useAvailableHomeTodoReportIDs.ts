import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * The reports of a Home to-do review that can still be opened. A report removed after the user pressed `Begin`, such
 * as one whose last expense was deleted, drops out so the arrows don't lead to a missing report. The open report
 * always stays, so its position in the list is known until the review moves on from it.
 */
function useAvailableHomeTodoReportIDs(reportID: string | undefined, reportIDs: string[]): string[] {
    const [availableReportIDs = reportIDs] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) =>
            reportIDs.filter((id) => {
                const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`];
                return id === reportID || (!!report && report.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            }),
    });
    return availableReportIDs;
}

export default useAvailableHomeTodoReportIDs;
