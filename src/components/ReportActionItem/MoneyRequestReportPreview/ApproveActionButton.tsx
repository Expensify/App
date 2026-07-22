import Button from '@components/Button';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useReportTransactionViolations from '@hooks/useReportTransactionViolations';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React from 'react';

import {useReportPreviewData} from './MoneyRequestReportPreviewContext';
import useConfirmApproveReportAction from './useConfirmApproveReportAction';
import useReportPreviewActionButtonData from './useReportPreviewActionButtonData';

function ApproveActionButton() {
    const {translate} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';

    const {iouReportID} = useReportPreviewData();

    const actionButtonData = useReportPreviewActionButtonData(iouReportID);
    const {iouReport} = actionButtonData;

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(iouReport?.reportID);
    const transactions = Object.values(reportTransactions);

    const [transactionViolations] = useReportTransactionViolations(transactions);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail, undefined, transactions);

    const confirmApproval = useConfirmApproveReportAction(actionButtonData, transactions, hasViolations);

    return (
        <Button
            text={translate('iou.approve')}
            success
            onPress={confirmApproval}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.APPROVE_BUTTON}
        />
    );
}

export default ApproveActionButton;
