import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {getCorrectedAutoReportingFrequency, getWorkflowApprovalsUnavailable} from '@libs/PolicyUtils';
import {getAutoReportingFrequencyDisplayNames} from '@pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage';
import {isAuthenticationError} from '@userActions/connections';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

function getWorkspaceRules(policy: Policy | undefined, translate: LocaleContextProps['translate']) {
    const workflowApprovalsUnavailable = getWorkflowApprovalsUnavailable(policy);
    const autoPayApprovedReportsUnavailable =
        !policy?.areWorkflowsEnabled || policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES || !policy?.achAccount?.bankAccountID;
    const total: string[] = [];
    if (policy?.maxExpenseAmountNoReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE) {
        total.push(translate('workspace.rules.individualExpenseRules.receiptRequiredAmount'));
    }
    if (policy?.maxExpenseAmountNoItemizedReceipt !== undefined && policy?.maxExpenseAmountNoItemizedReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE) {
        total.push(translate('workspace.rules.individualExpenseRules.itemizedReceiptRequiredAmount'));
    }
    if (policy?.maxExpenseAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE) {
        total.push(translate('workspace.rules.individualExpenseRules.maxExpenseAmount'));
    }
    if (policy?.maxExpenseAge !== CONST.DISABLED_MAX_EXPENSE_VALUE) {
        total.push(translate('workspace.rules.individualExpenseRules.maxExpenseAge'));
    }
    if (policy?.defaultBillable) {
        total.push(translate('workspace.rules.individualExpenseRules.billable'));
    }
    if (policy?.prohibitedExpenses && Object.values(policy?.prohibitedExpenses).find((value) => value)) {
        total.push(translate('workspace.rules.individualExpenseRules.prohibitedExpenses'));
    }
    if (policy?.eReceipts) {
        total.push(translate('workspace.rules.individualExpenseRules.eReceipts'));
    }
    if (policy?.isAttendeeTrackingEnabled) {
        total.push(translate('workspace.rules.individualExpenseRules.attendeeTracking'));
    }
    if (policy?.preventSelfApproval && !workflowApprovalsUnavailable) {
        total.push(translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'));
    }
    if (policy?.shouldShowAutoApprovalOptions && !workflowApprovalsUnavailable) {
        total.push(translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'));
    }
    if (policy?.shouldShowAutoReimbursementLimitOption && !autoPayApprovedReportsUnavailable) {
        total.push(translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'));
    }

    return total.length > 0 ? total : null;
}

function getWorkflowRules(policy: Policy | undefined, translate: LocaleContextProps['translate']) {
    const total: string[] = [];
    const {bankAccountID} = policy?.achAccount ?? {};
    const hasDelayedSubmissionError = !!(policy?.errorFields?.autoReporting ?? policy?.errorFields?.autoReportingFrequency);
    const hasApprovalError = !!policy?.errorFields?.approvalMode;
    const shouldShowBankAccount = !!bankAccountID && policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;

    if (policy?.autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT && !hasDelayedSubmissionError) {
        const title = getAutoReportingFrequencyDisplayNames(translate)[getCorrectedAutoReportingFrequency(policy) ?? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY];
        total.push(`${title} ${translate('workspace.duplicateWorkspace.delayedSubmission')}`);
    }
    if ([CONST.POLICY.APPROVAL_MODE.BASIC, CONST.POLICY.APPROVAL_MODE.ADVANCED].some((approvalMode) => approvalMode === policy?.approvalMode) && !hasApprovalError) {
        total.push(translate('common.approvals'));
    }
    if (policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO) {
        if (shouldShowBankAccount) {
            total.push(`1 ${translate('workspace.duplicateWorkspace.reimbursementAccount')}`);
        } else {
            total.push(translate('common.payments'));
        }
    }
    return total.length > 0 ? total : null;
}

function getAllValidConnectedIntegration(policy: Policy | undefined, accountingIntegrations?: ConnectionName[]) {
    return (accountingIntegrations ?? Object.values(CONST.POLICY.CONNECTIONS.NAME)).filter(
        (integration) => !!policy?.connections?.[integration] && !isAuthenticationError(policy, integration),
    );
}

export {getWorkspaceRules, getWorkflowRules, getAllValidConnectedIntegration};
