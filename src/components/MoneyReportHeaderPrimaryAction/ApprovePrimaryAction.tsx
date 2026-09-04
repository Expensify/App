import {useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ExpenseHeaderApprovalButton from '@components/ExpenseHeaderApprovalButton';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getNextApproverAccountID, hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils, isReportOwner} from '@libs/ReportUtils';

import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import useConfirmApproval from './useConfirmApproval';

type ApprovePrimaryActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
};

function ApprovePrimaryAction({reportID, chatReportID}: ApprovePrimaryActionProps) {
    const {isPaidAnimationRunning, startApprovedAnimation} = usePaymentAnimationsContext();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [expenseReportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(iouReport?.policyID)}`);

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${iouReport?.invoiceReceiver && 'policyID' in iouReport.invoiceReceiver ? iouReport.invoiceReceiver.policyID : ''}`,
    );

    const nextApproverAccountID = getNextApproverAccountID(iouReport);
    const isSubmitterSameAsNextApprover = isReportOwner(iouReport) && (nextApproverAccountID === iouReport?.ownerAccountID || iouReport?.managerID === iouReport?.ownerAccountID);
    const isBlockSubmitDueToPreventSelfApproval = isSubmitterSameAsNextApprover && expenseReportPolicy?.preventSelfApproval;

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(reportID);
    const transactions = Object.values(reportTransactions);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(transactions);
    const canIOUBePaid = canIOUBePaidAction(
        iouReport,
        chatReport,
        activePolicy,
        bankAccountList,
        currentUserDetails.login ?? '',
        currentUserAccountID,
        undefined,
        false,
        undefined,
        invoiceReceiverPolicy,
    );
    const onlyShowPayElsewhere =
        !canIOUBePaid &&
        canIOUBePaidAction(iouReport, chatReport, activePolicy, bankAccountList, currentUserDetails.login ?? '', currentUserAccountID, undefined, true, undefined, invoiceReceiverPolicy);
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;

    const {onApprove} = useConfirmApproval(reportID, startApprovedAnimation);

    return (
        <ExpenseHeaderApprovalButton
            isAnyTransactionOnHold={isAnyTransactionOnHold}
            isDelegateAccessRestricted={isDelegateAccessRestricted}
            onApprove={onApprove}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            moneyRequestReport={iouReport}
            transactions={transactions}
            shouldShowPayButton={shouldShowPayButton}
            isDisabled={isBlockSubmitDueToPreventSelfApproval}
        />
    );
}

export default ApprovePrimaryAction;
