import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
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
    const iouReportID = isMoneyRequestAction(reportAction) ? reportAction?.reportID : undefined;
    const [candidateIOUReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`) ?? null;
    // For self-DM tracks and split bills, action.reportID resolves to a chat report, not an IOU/expense report.
    const iouReport = isIOUReport(candidateIOUReport) || isExpenseReport(candidateIOUReport) ? candidateIOUReport : undefined;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`);
    const isChatIOUReportArchived = useReportIsArchived(chatReport?.reportID);
    return {iouReport, chatReport, isChatIOUReportArchived};
}

export default useGetIOUReportFromReportAction;
