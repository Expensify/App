import {getReceiptScanFailedIOUActionDataSelector} from '@selectors/ReportAction';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useSession} from '@components/OnyxListItemProvider';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOriginalMessage, hasReasoning} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type * as OnyxTypes from '@src/types/onyx';

type ReceiptScanFailedContentProps = {
    reportID: string | undefined;
    actionReportID: string | undefined;
    parentReportID: string | undefined;
    parentReportActionID: string | undefined;
    reportType: string | undefined;
    action: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED>;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<Report>;
};

function ReceiptScanFailedContent({reportID, actionReportID, parentReportID, parentReportActionID, reportType, action, originalReport}: ReceiptScanFailedContentProps) {
    const {translate} = useLocalize();
    const session = useSession();
    // IOU action lives in the IOU report's actions — `report` itself if it's IOU/Expense/Invoice, else its parent.
    const isIOUReport = reportType === CONST.REPORT.TYPE.IOU || reportType === CONST.REPORT.TYPE.EXPENSE || reportType === CONST.REPORT.TYPE.INVOICE;
    const IOUReportID = isIOUReport ? reportID : parentReportID;

    const receiptScanFailedIOUActionDataSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>) =>
        getReceiptScanFailedIOUActionDataSelector(reportActions, isIOUReport, parentReportActionID, actionReportID);
    const [receiptScanFailedIOUActionData] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(IOUReportID)}`, {
        selector: receiptScanFailedIOUActionDataSelector,
    });
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action.childReportID)}`);
    const {actorAccountID} = receiptScanFailedIOUActionData ?? {};
    const canEdit = !!actorAccountID && actorAccountID === session?.accountID;
    const missingFields = getOriginalMessage(action)?.missingFields;
    const message = translate('violations.smartscanFailed', {canEdit, missingFields});

    if (hasReasoning(action)) {
        return (
            <ReportActionItemMessageWithExplain
                message={message}
                action={action}
                childReport={childReport}
                originalReport={originalReport}
            />
        );
    }

    return <ReportActionItemBasicMessage message={message} />;
}

export default ReceiptScanFailedContent;
