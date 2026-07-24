import {useSession} from '@components/OnyxListItemProvider';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOriginalMessage, hasReasoning} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {getReceiptScanFailedIOUActionDataSelector} from '@selectors/ReportAction';
import React from 'react';

type ReceiptScanFailedContentProps = {
    reportID: string | undefined;
    actionReportID: string | undefined;
    parentReportID: string | undefined;
    parentReportActionID: string | undefined;
    reportType: string | undefined;
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED>;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<Report>;
};

function ReceiptScanFailedContent({reportID, actionReportID, parentReportID, parentReportActionID, reportType, action, originalReport}: ReceiptScanFailedContentProps) {
    const {translate} = useLocalize();
    const session = useSession();
    // IOU action lives in the IOU report's actions — `report` itself if it's IOU/Expense/Invoice, else its parent.
    const isIOUReport = reportType === CONST.REPORT.TYPE.IOU || reportType === CONST.REPORT.TYPE.EXPENSE || reportType === CONST.REPORT.TYPE.INVOICE;
    const IOUReportID = isIOUReport ? reportID : parentReportID;

    const receiptScanFailedIOUActionDataSelector = (reportActions: OnyxEntry<ReportActions>) =>
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
        // `AskToExplain` already supplies its own leading period; strip the trailing period
        // from the localized message so the rendered string reads "…manually. Explain" not "…manually.. Explain".
        return (
            <ReportActionItemMessageWithExplain
                message={message.replace(/\.\s*$/, '')}
                action={action}
                childReport={childReport}
                originalReport={originalReport}
            />
        );
    }

    return <ReportActionItemBasicMessage message={message} />;
}

export default ReceiptScanFailedContent;
