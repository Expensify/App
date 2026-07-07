import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ExpenseHeaderApprovalButton from '@components/ExpenseHeaderApprovalButton';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {approveMoneyRequest} from '@libs/actions/IOU/ReportWorkflow';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getNextApproverAccountID,
    hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils,
    hasViolations as hasViolationsReportUtils,
    isReportOwner,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';

import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {delegateEmailSelector} from '@src/selectors/Account';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

type ApprovePrimaryActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
};

function ApprovePrimaryAction({reportID, chatReportID}: ApprovePrimaryActionProps) {
    const {isPaidAnimationRunning, startApprovedAnimation} = usePaymentAnimationsContext();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [expenseReportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(iouReport?.policyID)}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${iouReport?.invoiceReceiver && 'policyID' in iouReport.invoiceReceiver ? iouReport.invoiceReceiver.policyID : ''}`,
    );
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        isTrackIntentUser,
        report: iouReport,
        policy: expenseReportPolicy,
    });
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail);

    const nextApproverAccountID = getNextApproverAccountID(iouReport);
    const isSubmitterSameAsNextApprover = isReportOwner(iouReport) && (nextApproverAccountID === iouReport?.ownerAccountID || iouReport?.managerID === iouReport?.ownerAccountID);
    const isBlockSubmitDueToPreventSelfApproval = isSubmitterSameAsNextApprover && expenseReportPolicy?.preventSelfApproval;

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(reportID);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(Object.values(reportTransactions));
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

    const onApprove = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        approveMoneyRequest({
            expenseReport: iouReport,
            expenseReportPolicy,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: currentUserEmail,
            hasViolations,
            isASAPSubmitBetaEnabled,
            expenseReportCurrentNextStepDeprecated: iouReportNextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            full,
            onApproved: startApprovedAnimation,
            delegateEmail,
        });
    };

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
            shouldShowPayButton={shouldShowPayButton}
            shouldShowMarkAsDoneCopy={shouldUseMarkAsDoneCopy}
            isDisabled={isBlockSubmitDueToPreventSelfApproval}
        />
    );
}

export default ApprovePrimaryAction;
