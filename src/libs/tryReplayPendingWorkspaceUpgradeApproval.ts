import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type PendingWorkspaceUpgradeIntent from '@src/types/onyx/PendingWorkspaceUpgradeIntent';
import {approveMoneyRequest, clearPendingWorkspaceUpgradeIntent} from './actions/IOU/ReportWorkflow';
import {approveMoneyRequestOnSearch} from './actions/Search';
import {isSubmitPolicy} from './PolicyUtils';
import {hasViolations as hasViolationsReportUtils} from './ReportUtils';
import type {SearchKey} from './SearchUIUtils';

type ReplayApproveMoneyRequestParams = {
    intent: PendingWorkspaceUpgradeIntent | undefined;
    expenseReport: OnyxEntry<OnyxTypes.Report>;
    expenseReportPolicy: OnyxEntry<OnyxTypes.Policy>;
    accountID: number;
    email: string;
    isASAPSubmitBetaEnabled: boolean;
    nextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    allTransactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    delegateEmail: string | undefined;
    onApproved?: () => void;
};

function tryReplayPendingApproveMoneyRequest({
    intent,
    expenseReport,
    expenseReportPolicy,
    accountID,
    email,
    isASAPSubmitBetaEnabled,
    nextStep,
    betas,
    userBillingGracePeriodEnds,
    amountOwed,
    ownerBillingGracePeriodEnd,
    allTransactionViolations,
    delegateEmail,
    onApproved,
}: ReplayApproveMoneyRequestParams): boolean {
    if (intent?.type !== CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST) {
        return false;
    }

    if (!expenseReport?.reportID || intent.reportID !== expenseReport.reportID) {
        return false;
    }

    if (!expenseReportPolicy?.id || intent.policyID !== expenseReportPolicy.id) {
        return false;
    }

    if (isSubmitPolicy(expenseReportPolicy) || expenseReportPolicy.isPendingUpgrade) {
        return false;
    }

    const hasViolations = hasViolationsReportUtils(expenseReport.reportID, allTransactionViolations, accountID, email);

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
        full: intent.full ?? false,
        onApproved,
        delegateEmail,
    });

    return true;
}

type ReplayApproveMoneyRequestOnSearchParams = {
    intent: PendingWorkspaceUpgradeIntent | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
    currentSearchKey?: SearchKey;
};

function tryReplayPendingApproveMoneyRequestOnSearch({intent, policy, currentSearchKey}: ReplayApproveMoneyRequestOnSearchParams): boolean {
    if (intent?.type !== CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST_ON_SEARCH) {
        return false;
    }

    if (!policy?.id || intent.policyID !== policy.id) {
        return false;
    }

    if (isSubmitPolicy(policy) || policy.isPendingUpgrade) {
        return false;
    }

    clearPendingWorkspaceUpgradeIntent();
    approveMoneyRequestOnSearch(intent.searchHash, [intent.reportID], intent.currentSearchKey ?? currentSearchKey);

    return true;
}

export {tryReplayPendingApproveMoneyRequest, tryReplayPendingApproveMoneyRequestOnSearch};
