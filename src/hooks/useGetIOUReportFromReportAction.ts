import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isExpenseReport, isInvoiceReport, isIOUReport} from '@libs/ReportUtils';

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
    // For self-DM tracks and split bills, action.reportID resolves to a chat report, so those are filtered out here.
    // Invoice reports are NOT chat reports though - they carry the money request action just like IOU/expense reports,
    // so they must be included. Excluding them left iouReport undefined for invoices, which broke invoice delete
    // navigation ("Not here" page) and optimistic cleanup at every call site. See issue #97399.
    const iouReport = isIOUReport(candidateIOUReport) || isExpenseReport(candidateIOUReport) || isInvoiceReport(candidateIOUReport) ? candidateIOUReport : undefined;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`);
    const isChatIOUReportArchived = useReportIsArchived(chatReport?.reportID);
    return {iouReport, chatReport, isChatIOUReportArchived};
}

export default useGetIOUReportFromReportAction;
