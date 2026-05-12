import React from 'react';
import useLocalize from '@hooks/useLocalize';
import {getReportAction, wasActionTakenByCurrentUser} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

type ReceiptScanFailedContentProps = {
    parentReportID: string | undefined;
    parentReportActionID: string | undefined;
};

// RECEIPT_SCAN_FAILED is submitted by Concierge, so use the parent IOU action to determine edit permission.
function ReceiptScanFailedContent({parentReportID, parentReportActionID}: ReceiptScanFailedContentProps) {
    const {translate} = useLocalize();
    const iouAction = getReportAction(parentReportID, parentReportActionID);
    return <ReportActionItemBasicMessage message={translate('violations.smartscanFailed', {canEdit: wasActionTakenByCurrentUser(iouAction)})} />;
}

export default ReceiptScanFailedContent;
