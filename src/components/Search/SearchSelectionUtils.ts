import {isExpenseReport, isProcessingReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Policy, Report} from '@src/types/onyx';
import type {SelectedTransactions} from './types';

type SearchMoveSelectionValidationParams = {
    isExpenseReportSearch?: boolean;
    getOwnerAccountIDForReportID?: (reportID?: string) => number | undefined;
    getPolicyForPolicyID?: (policyID?: string) => Policy | undefined;
    getLoginForAccountID?: (accountID: number) => string | undefined;
    resolveSubmitToAccountID?: (policy?: Policy, report?: Report) => number | undefined;
};

type SearchMoveSelectionValidation = {
    canAllTransactionsBeMoved: boolean;
    canMoveToReport: boolean;
    hasMultipleOwners: boolean;
    hasOnlyTransactionSelections: boolean;
    hasSelections: boolean;
    targetOwnerAccountID?: number;
};

function shouldBlockForwardedMoveFromSearchSnapshot(
    report: Report | undefined,
    policy: Policy | undefined,
    resolveSubmitToAccountID?: SearchMoveSelectionValidationParams['resolveSubmitToAccountID'],
    getLoginForAccountID?: SearchMoveSelectionValidationParams['getLoginForAccountID'],
): boolean {
    if (
        !report ||
        !policy ||
        !resolveSubmitToAccountID ||
        !getLoginForAccountID ||
        !isExpenseReport(report) ||
        !isProcessingReport(report) ||
        typeof report.managerID !== 'number' ||
        !report.submitted
    ) {
        return false;
    }

    const nextStep = report.nextStep;
    if (nextStep?.messageKey !== CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE || nextStep.actorAccountID !== report.managerID) {
        return false;
    }

    const submitToAccountID = resolveSubmitToAccountID(policy, report);
    if (typeof submitToAccountID !== 'number' || submitToAccountID === report.managerID) {
        return false;
    }

    const submitToLogin = getLoginForAccountID(submitToAccountID);
    const managerLogin = getLoginForAccountID(report.managerID);
    if (!submitToLogin || !managerLogin) {
        return false;
    }

    const submitToEmployee = policy.employeeList?.[submitToLogin];
    return submitToEmployee?.forwardsTo === managerLogin || submitToEmployee?.overLimitForwardsTo === managerLogin;
}

function getSearchMoveSelectionValidation(
    selectedTransactions: SelectedTransactions,
    {isExpenseReportSearch = false, getOwnerAccountIDForReportID, getPolicyForPolicyID, getLoginForAccountID, resolveSubmitToAccountID}: SearchMoveSelectionValidationParams = {},
): SearchMoveSelectionValidation {
    const selectedTransactionEntries = Object.values(selectedTransactions);
    const hasSelections = selectedTransactionEntries.length > 0;
    const hasOnlyTransactionSelections = selectedTransactionEntries.every((transaction) => transaction.transaction?.transactionID !== undefined);
    const canAllTransactionsBeMoved =
        hasSelections &&
        selectedTransactionEntries.every((transaction) => {
            if (!transaction.canChangeReport) {
                return false;
            }

            const policy = getPolicyForPolicyID?.(transaction.policyID ?? transaction.report?.policyID);
            return !shouldBlockForwardedMoveFromSearchSnapshot(transaction.report, policy, resolveSubmitToAccountID, getLoginForAccountID);
        });

    const ownerAccountIDs = new Set<number>();
    let hasUnknownOwner = false;
    let targetOwnerAccountID: number | undefined;

    for (const transaction of selectedTransactionEntries) {
        const ownerAccountID = transaction.ownerAccountID ?? transaction.report?.ownerAccountID ?? getOwnerAccountIDForReportID?.(transaction.reportID);
        if (typeof ownerAccountID === 'number') {
            ownerAccountIDs.add(ownerAccountID);
            targetOwnerAccountID ??= ownerAccountID;
            if (ownerAccountIDs.size > 1) {
                break;
            }
            continue;
        }

        hasUnknownOwner = true;
    }

    const hasMultipleOwners = ownerAccountIDs.size > 1 || (hasUnknownOwner && (ownerAccountIDs.size > 0 || selectedTransactionEntries.length > 1));

    return {
        canAllTransactionsBeMoved,
        canMoveToReport: hasSelections && hasOnlyTransactionSelections && canAllTransactionsBeMoved && !hasMultipleOwners && !isExpenseReportSearch,
        hasMultipleOwners,
        hasOnlyTransactionSelections,
        hasSelections,
        targetOwnerAccountID: hasMultipleOwners ? undefined : targetOwnerAccountID,
    };
}

export default getSearchMoveSelectionValidation;
