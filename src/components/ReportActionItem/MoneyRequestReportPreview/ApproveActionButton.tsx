import React from 'react';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ExpenseHeaderApprovalButton from '@components/ExpenseHeaderApprovalButton';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import {
    getNonHeldAndFullAmount,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasViolations as hasViolationsReportUtils,
} from '@libs/ReportUtils';
import {approveMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ApproveActionButtonProps = {
    iouReportID: string | undefined;
    startApprovedAnimation: () => void;
    shouldShowPayButton: boolean;
};

function ApproveActionButton({iouReportID, startApprovedAnimation, shouldShowPayButton}: ApproveActionButtonProps) {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [userBillingGraceEndPeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReportID}`);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGraceEndPeriod] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(iouReport, shouldShowPayButton);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(iouReport?.reportID);

    return (
        <ExpenseHeaderApprovalButton
            isAnyTransactionOnHold={hasHeldExpensesReportUtils(iouReport?.reportID)}
            isDelegateAccessRestricted={isDelegateAccessRestricted}
            hasOnlyHeldExpenses={hasOnlyHeldExpenses}
            hasValidNonHeldAmount={hasValidNonHeldAmount}
            nonHeldAmount={nonHeldAmount}
            fullAmount={fullAmount}
            onApprove={(isFullApproval) => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }
                startApprovedAnimation();
                approveMoneyRequest({
                    amountOwed,
                    expenseReport: iouReport,
                    policy: activePolicy,
                    currentUserAccountIDParam: currentUserDetails.accountID,
                    currentUserEmailParam: currentUserDetails.email ?? '',
                    hasViolations,
                    isASAPSubmitBetaEnabled,
                    expenseReportCurrentNextStepDeprecated: iouReportNextStep,
                    betas,
                    userBillingGraceEndPeriods,
                    ownerBillingGraceEndPeriod,
                    full: isFullApproval,
                });
            }}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
        />
    );
}

export default ApproveActionButton;
