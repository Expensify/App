import {isPolicyExpenseChat, isThread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Returns reportActions filtered to only policy expense chat reports (non-thread).
 *
 * Pass `enabled: false` from call sites that only need the value on a code path that may
 * not run (e.g. `useExpenseSubmission`, where the value is consumed only when sharing a
 * tracked expense). Disabling skips the per-render filter loop over every report.
 */
function useAllPolicyExpenseChatReportActions(enabled = true) {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    const filteredReportActions: Record<string, ReportActions> = {};
    if (!enabled) {
        return filteredReportActions;
    }
    for (const report of Object.values(allReports ?? {})) {
        if (!report?.reportID || !isPolicyExpenseChat(report) || isThread(report)) {
            continue;
        }
        const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`;
        const actions = allReportActions?.[key];
        if (actions) {
            filteredReportActions[key] = actions;
        }
    }

    return filteredReportActions;
}

export default useAllPolicyExpenseChatReportActions;
