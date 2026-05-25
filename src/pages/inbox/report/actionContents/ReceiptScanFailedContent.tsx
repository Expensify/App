import {getReceiptScanFailedIOUActionDataSelector} from '@selectors/ReportAction';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useSession} from '@components/OnyxListItemProvider';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
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
    const session = useSession();
    // IOU action lives in the IOU report's actions — `report` itself if it's IOU/Expense/Invoice, else its parent.
    const isIOUReport = reportType === CONST.REPORT.TYPE.IOU || reportType === CONST.REPORT.TYPE.EXPENSE || reportType === CONST.REPORT.TYPE.INVOICE;
    const IOUReportID = isIOUReport ? reportID : parentReportID;

    const receiptScanFailedIOUActionDataSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>) =>
        getReceiptScanFailedIOUActionDataSelector(reportActions, isIOUReport, parentReportActionID, actionReportID);
    const [receiptScanFailedIOUActionData] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(IOUReportID)}`, {
        selector: receiptScanFailedIOUActionDataSelector,
    });
    const {transactionID, actorAccountID} = receiptScanFailedIOUActionData ?? {};
    const canEdit = !!actorAccountID && actorAccountID === session?.accountID;
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transactionID)}`);
    const smartscanFailedViolation = transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.SMARTSCAN_FAILED);
    const missingFields = smartscanFailedViolation?.data?.missingFields ?? [];

    return <ReportActionItemBasicMessage message={translate('violations.smartscanFailed', {canEdit, missingFields})} />;
}

export default ReceiptScanFailedContent;
