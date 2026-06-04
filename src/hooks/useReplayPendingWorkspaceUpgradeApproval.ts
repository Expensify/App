import {useEffect} from 'react';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {approveMoneyRequest, clearPendingWorkspaceUpgradeIntent} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
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
    const {translate} = useLocalize();
    const [pendingWorkspaceUpgradeIntent] = useOnyx(ONYXKEYS.PENDING_WORKSPACE_UPGRADE_INTENT);
    const approveIntentType = pendingWorkspaceUpgradeIntent?.type;
    const approveIntentReportID = pendingWorkspaceUpgradeIntent?.reportID;
    const approveIntentPolicyID = pendingWorkspaceUpgradeIntent?.policyID;
    const approveIntentFull = pendingWorkspaceUpgradeIntent?.type === CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST ? pendingWorkspaceUpgradeIntent.full : undefined;

    useEffect(() => {
        if (approveIntentType !== CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST) {
            return;
        }

        if (!expenseReport?.reportID || approveIntentReportID !== expenseReport.reportID) {
            return;
        }

        if (!activePolicy?.id || approveIntentPolicyID !== activePolicy.id) {
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
            full: approveIntentFull ?? false,
            onApproved,
            delegateEmail,
            shouldNotifyAdminsOfCollectUpgrade: true,
            translate,
        });
    }, [
        activePolicy,
        amountOwed,
        approveIntentFull,
        approveIntentPolicyID,
        approveIntentReportID,
        approveIntentType,
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
        translate,
        userBillingGracePeriodEnds,
    ]);
}
