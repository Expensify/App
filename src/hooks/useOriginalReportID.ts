import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useOriginalReportID(reportID: string | undefined, reportAction: OnyxInputOrEntry<ReportAction>): string | undefined {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});

    if (!reportID) {
        return undefined;
    }
    const currentReportAction = reportAction?.reportActionID ? reportActions?.[reportAction.reportActionID] : undefined;

    if (Object.keys(currentReportAction ?? {}).length === 0) {
        const isThreadReportParentAction = reportAction?.childReportID?.toString() === reportID;
        if (isThreadReportParentAction) {
            return report?.parentReportID;
        }
        const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? ([] as ReportAction[]));
        return transactionThreadReportID ?? reportID;
    }
    return reportID;
}

export default useOriginalReportID;
