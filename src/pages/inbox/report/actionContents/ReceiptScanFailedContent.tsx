import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getLinkedTransactionID, isActionOfType, wasActionTakenByCurrentUser} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type ReceiptScanFailedContentProps = {
    reportID: string | undefined;
    actionReportID: string | undefined;
    parentReportID: string | undefined;
    parentReportActionID: string | undefined;
    reportType: string | undefined;
};

function ReceiptScanFailedContent({reportID, actionReportID, parentReportID, parentReportActionID, reportType}: ReceiptScanFailedContentProps) {
    const {translate} = useLocalize();
    // IOU action lives in the IOU report's actions — `report` itself if it's IOU/Expense/Invoice, else its parent.
    const isIouReport = reportType === CONST.REPORT.TYPE.IOU || reportType === CONST.REPORT.TYPE.EXPENSE || reportType === CONST.REPORT.TYPE.INVOICE;
    const iouReportID = isIouReport ? reportID : parentReportID;

    // Prefer parentReportActionID (specific IOU action when `report` is a transaction thread).
    // Fall back to childReportID match, then to the only IOU action for one-transaction reports.
    const getIouActionSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>): OnyxTypes.ReportAction | undefined => {
        if (!isIouReport && parentReportActionID) {
            const candidate = reportActions?.[parentReportActionID];
            if (isActionOfType(candidate, CONST.REPORT.ACTIONS.TYPE.IOU)) {
                return candidate;
            }
        }
        const iouActions = Object.values(reportActions ?? {}).filter((a): a is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
            isActionOfType(a, CONST.REPORT.ACTIONS.TYPE.IOU),
        );
        if (actionReportID) {
            const match = iouActions.find((a) => a.childReportID === actionReportID);
            if (match) {
                return match;
            }
        }
        return iouActions.length === 1 ? iouActions.at(0) : undefined;
    };
    const [iouAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(iouReportID)}`, {selector: getIouActionSelector});
    const transactionID = getLinkedTransactionID(iouAction);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transactionID)}`);
    const smartscanFailedViolation = transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.SMARTSCAN_FAILED);
    const missingFields = smartscanFailedViolation?.data?.missingFields ?? [];

    return <ReportActionItemBasicMessage message={translate('violations.smartscanFailed', {canEdit: wasActionTakenByCurrentUser(iouAction), missingFields})} />;
}

export default ReceiptScanFailedContent;
