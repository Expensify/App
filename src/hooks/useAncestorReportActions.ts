import {useOnyx} from 'react-native-onyx';
import {isEmptyObject} from '@github/libs/isEmptyObject';
import {isReportPreviewAction, isSentMoneyReportAction, isTransactionThread} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportAction from '@src/types/onyx/ReportAction';

export default function useAncestorReportActions(reportID: string, includeTransactionThread = false): Record<string, ReportAction> {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const ancestorReportActions: Record<string, ReportAction> = {};

    if (!report || !reports || !reportActions) {
        return ancestorReportActions;
    }

    let parentReportID = report.parentReportID;
    let parentReportActionID = report.parentReportActionID;

    while (parentReportID) {
        const parentReport = reports[parentReportID];
        const parentReportAction = parentReportActionID ? reportActions[parentReportID]?.[parentReportActionID] : undefined;

        if (
            !parentReportAction ||
            (!includeTransactionThread && ((isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction)) || isReportPreviewAction(parentReportAction)))
        ) {
            break;
        }

        if (parentReportActionID) {
            const parentReportAction = reportActions[parentReportActionID]?.[parentReportActionID];
            if (parentReportAction) {
                ancestorReportActions[parentReportID] = parentReportAction;
            }
        }

        if (!parentReport || isEmptyObject(parentReport)) {
            break;
        }
        parentReportID = parentReport?.parentReportID;
        parentReportActionID = parentReport?.parentReportActionID;
    }

    return ancestorReportActions;
}
