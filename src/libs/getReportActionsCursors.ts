/** Combined report/thread rows still paginate each report from its own saved actions. */
import type {ReportAction} from '@src/types/onyx';

function getReportActionsCursors(actions: ReportAction[], reportActionIDs: string[]) {
    const ownActionIDs = new Set(reportActionIDs);
    let newestReportAction: ReportAction | undefined;
    let oldestReportAction: ReportAction | undefined;
    let newestThreadAction: ReportAction | undefined;
    let oldestThreadAction: ReportAction | undefined;
    for (const action of actions) {
        if (ownActionIDs.has(action.reportActionID)) {
            newestReportAction ??= action;
            oldestReportAction = action;
        } else {
            newestThreadAction ??= action;
            oldestThreadAction = action;
        }
    }
    return {newestReportAction, oldestReportAction, newestThreadAction, oldestThreadAction};
}

export default getReportActionsCursors;
