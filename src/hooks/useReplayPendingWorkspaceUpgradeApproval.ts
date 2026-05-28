import {useEffect} from 'react';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {approveMoneyRequest, clearPendingWorkspaceUpgradeIntent} from '@userActions/IOU/ReportWorkflow';
import ONYXKEYS from '@src/ONYXKEYS';
import CONST from '@src/CONST';
import useOnyx from './useOnyx';

type ApproveParams = Parameters<typeof approveMoneyRequest>[0];

type Params = Omit<ApproveParams, 'policy' | 'onApproved'> & {
    activePolicy: ApproveParams['policy'];
    onApproved: NonNullable<ApproveParams['onApproved']>;
};

export default function useReplayPendingWorkspaceUpgradeApproval({
    expenseReport,
    expenseReportPolicy,
    activePolicy,
    currentUserAccountIDParam,
    currentUserEmailParam,
    hasViolations,
    isASAPSubmitBetaEnabled,
    expenseReportCurrentNextStepDeprecated,
    betas,
    userBillingGracePeriodEnds,
    amountOwed,
    ownerBillingGracePeriodEnd,
    delegateEmail,
    onApproved,
}: Params) {
    const [pendingWorkspaceUpgradeIntent] = useOnyx(ONYXKEYS.PENDING_WORKSPACE_UPGRADE_INTENT);

    useEffect(() => {
        if (pendingWorkspaceUpgradeIntent?.type !== CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST) {
            return;
        }

        if (!expenseReport?.reportID || pendingWorkspaceUpgradeIntent.reportID !== expenseReport.reportID) {
            return;
        }

        if (!activePolicy?.id || pendingWorkspaceUpgradeIntent.policyID !== activePolicy.id) {
            return;
        }

        // Wait until the policy has actually upgraded (i.e. no longer Submit) and is no longer pending.
        if (isSubmitPolicy(activePolicy) || activePolicy.isPendingUpgrade) {
            return;
        }

        // Clear first to avoid loops if something navigates/re-renders mid-flight.
        clearPendingWorkspaceUpgradeIntent();

        approveMoneyRequest({
            expenseReport,
            expenseReportPolicy,
            policy: activePolicy,
            currentUserAccountIDParam,
            currentUserEmailParam,
            hasViolations,
            isASAPSubmitBetaEnabled,
            expenseReportCurrentNextStepDeprecated,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            full: pendingWorkspaceUpgradeIntent.full,
            onApproved,
            delegateEmail,
        });
    }, [
        activePolicy,
        amountOwed,
        betas,
        currentUserAccountIDParam,
        currentUserEmailParam,
        delegateEmail,
        expenseReport,
        expenseReportCurrentNextStepDeprecated,
        expenseReportPolicy,
        hasViolations,
        isASAPSubmitBetaEnabled,
        onApproved,
        ownerBillingGracePeriodEnd,
        userBillingGracePeriodEnds,
        pendingWorkspaceUpgradeIntent?.full,
        pendingWorkspaceUpgradeIntent?.policyID,
        pendingWorkspaceUpgradeIntent?.reportID,
        pendingWorkspaceUpgradeIntent?.type,
    ]);
}
