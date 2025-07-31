import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {getWorkflowApprovalsUnavailable, hasVBBA} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

function getWorkspaceRules(policy: Policy, translate: LocaleContextProps['translate']) {
    const workflowApprovalsUnavailable = getWorkflowApprovalsUnavailable(policy);
    const autoPayApprovedReportsUnavailable = !policy?.areWorkflowsEnabled || policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES || !hasVBBA(policy?.id);
    const total: string[] = [];
    if (policy?.maxExpenseAmountNoReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE) {
        total.push(translate('workspace.rules.individualExpenseRules.receiptRequiredAmount'));
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

export {getWorkspaceRules};
