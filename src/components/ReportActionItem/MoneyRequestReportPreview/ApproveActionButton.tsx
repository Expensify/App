import {useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ExpenseHeaderApprovalButton from '@components/ExpenseHeaderApprovalButton';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useReportTransactionViolations from '@hooks/useReportTransactionViolations';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {hasViolations as hasViolationsReportUtils, hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React from 'react';

import {useReportPreviewActionState, useReportPreviewData} from './MoneyRequestReportPreviewContext';
import useConfirmApproveReportAction from './useConfirmApproveReportAction';
import useReportPreviewActionButtonData from './useReportPreviewActionButtonData';

function ApproveActionButton() {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {shouldShowPayButton} = useReportPreviewActionState();

    const {iouReportID} = useReportPreviewData();

    const actionButtonData = useReportPreviewActionButtonData(iouReportID);
    const {iouReport} = actionButtonData;
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(iouReport?.reportID);
    const transactions = Object.values(reportTransactions);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(transactions);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();

    const [transactionViolations] = useReportTransactionViolations(transactions);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail, undefined, transactions);

    const confirmApproval = useConfirmApproveReportAction(actionButtonData, transactions, hasViolations);

    return (
        <ExpenseHeaderApprovalButton
            isAnyTransactionOnHold={isAnyTransactionOnHold}
            isDelegateAccessRestricted={isDelegateAccessRestricted}
            onApprove={confirmApproval}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            moneyRequestReport={iouReport}
            shouldShowPayButton={shouldShowPayButton}
        />
    );
}

export default ApproveActionButton;
