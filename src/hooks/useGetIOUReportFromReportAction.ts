import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isExpenseReport, isIOUReport} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

function useGetIOUReportFromReportAction(reportAction: OnyxTypes.ReportAction | null | undefined): {
    iouReport: OnyxTypes.Report | undefined;
    chatReport: OnyxTypes.Report | undefined;
    isChatIOUReportArchived: boolean;
} {
    // Prefer the action's own reportID; fall back to originalMessage.IOUReportID only when the backend omits reportID.
    // Preferring reportID keeps moved expenses correct (the moved action carries a stale IOUReportID from the source report).
    // Temporary until the backend reliably sends reportID on IOU actions. See https://github.com/Expensify/App/issues/93882.
    const iouReportID = isMoneyRequestAction(reportAction) ? (reportAction?.reportID ?? getOriginalMessage(reportAction)?.IOUReportID) : undefined;
    const [candidateIOUReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`) ?? null;
    // For self-DM tracks and split bills, action.reportID resolves to a chat report, not an IOU/expense report.
    const iouReport = isIOUReport(candidateIOUReport) || isExpenseReport(candidateIOUReport) ? candidateIOUReport : undefined;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`);
    const isChatIOUReportArchived = useReportIsArchived(chatReport?.reportID);
    return {iouReport, chatReport, isChatIOUReportArchived};
}

export default useGetIOUReportFromReportAction;
