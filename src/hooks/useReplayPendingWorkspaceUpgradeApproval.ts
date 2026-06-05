import {useFocusEffect} from '@react-navigation/native';
import {delegateEmailSelector} from '@selectors/Account';
import {useCallback, useEffect} from 'react';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {approveMoneyRequest, clearPendingWorkspaceUpgradeIntent} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type Params = {
    reportID: string | undefined;
    onApproved: () => void;
};

export default function useReplayPendingWorkspaceUpgradeApproval({reportID, onApproved}: Params) {
    const {accountID, email = ''} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const [pendingWorkspaceUpgradeIntent] = useOnyx(ONYXKEYS.PENDING_WORKSPACE_UPGRADE_INTENT);
    const [expenseReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [expenseReportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});

    const hasViolations = hasViolationsReportUtils(reportID, allTransactionViolations, accountID, email);

    const tryReplay = useCallback(() => {
        if (pendingWorkspaceUpgradeIntent?.type !== CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST) {
            return;
        }

        if (!expenseReport?.reportID || pendingWorkspaceUpgradeIntent.reportID !== expenseReport.reportID) {
            return;
        }

        if (!expenseReportPolicy?.id || pendingWorkspaceUpgradeIntent.policyID !== expenseReportPolicy.id) {
            return;
        }

        // Wait until the policy has actually upgraded (i.e. no longer Submit) and is no longer pending.
        if (isSubmitPolicy(expenseReportPolicy) || expenseReportPolicy.isPendingUpgrade) {
            return;
        }

        // Clear first to avoid loops if something navigates/re-renders mid-flight.
        clearPendingWorkspaceUpgradeIntent();

        approveMoneyRequest({
            expenseReport,
            expenseReportPolicy,
            policy: expenseReportPolicy,
            currentUserAccountIDParam: accountID,
            currentUserEmailParam: email,
            hasViolations,
            isASAPSubmitBetaEnabled,
            expenseReportCurrentNextStepDeprecated: nextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            full: pendingWorkspaceUpgradeIntent.full ?? false,
            onApproved,
            delegateEmail,
        });
    }, [
        accountID,
        amountOwed,
        betas,
        delegateEmail,
        email,
        expenseReport,
        expenseReportPolicy,
        hasViolations,
        isASAPSubmitBetaEnabled,
        nextStep,
        onApproved,
        ownerBillingGracePeriodEnd,
        pendingWorkspaceUpgradeIntent,
        userBillingGracePeriodEnds,
    ]);

    useEffect(() => {
        tryReplay();
    }, [tryReplay]);

    // Re-attempt when the report screen regains focus (e.g. after returning from workspace upgrade).
    useFocusEffect(
        useCallback(() => {
            tryReplay();
        }, [tryReplay]),
    );
}
