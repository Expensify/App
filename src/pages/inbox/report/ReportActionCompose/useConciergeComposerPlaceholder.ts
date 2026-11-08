/**
 * Keeps Concierge prompts that require existing expenses out of an empty account's composer.
 */
import useOnyx from '@hooks/useOnyx';

import {isCurrentUserSubmitter, isMoneyRequestReport} from '@libs/ReportUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useState} from 'react';

const DEFAULT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.createExpense', 'reportActionCompose.askConciergeForHelp'] as const;
const MAX_EXPENSE_COUNT = 2;

const EXPENSE_PLACEHOLDER_KEYS = [
    'common.concierge.composerPlaceholders.spendLastMonth',
    'common.concierge.composerPlaceholders.topExpenses',
    'common.concierge.composerPlaceholders.spendDrivers',
    'common.concierge.composerPlaceholders.travelSpendChange',
    'common.concierge.composerPlaceholders.unsubmitted',
    'common.concierge.composerPlaceholders.exportCsv',
] as const;

const ACCESSIBLE_REPORT_PLACEHOLDER_KEYS = [
    'common.concierge.composerPlaceholders.awaitingApproval',
    'common.concierge.composerPlaceholders.leftToPay',
    'common.concierge.composerPlaceholders.topSpender',
] as const;

const OWN_REPORT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.notReimbursed', 'common.concierge.composerPlaceholders.exportPdf'] as const;

function getReportEligibility(reports: OnyxCollection<Report>, isConciergeInboxDM: boolean, accountID: number | undefined) {
    let ownReportedExpenseCount = 0;
    let hasAccessibleExpenseReports = false;
    let hasOwnExpenseReports = false;
    if (!isConciergeInboxDM || !accountID) {
        return {ownReportedExpenseCount, hasAccessibleExpenseReports, hasOwnExpenseReports};
    }

    for (const report of Object.values(reports ?? {})) {
        if (!report || report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || report.errorFields?.notFound) {
            continue;
        }
        if (!isMoneyRequestReport(report) || (report.transactionCount ?? 0) <= 0) {
            continue;
        }
        hasAccessibleExpenseReports = true;
        if (!isCurrentUserSubmitter(report, accountID)) {
            continue;
        }
        hasOwnExpenseReports = true;
        // Report counts include expenses whose transaction records have not been loaded locally.
        ownReportedExpenseCount = Math.min(MAX_EXPENSE_COUNT, ownReportedExpenseCount + (report.transactionCount ?? 0));
        if (ownReportedExpenseCount === MAX_EXPENSE_COUNT) {
            break;
        }
    }
    return {ownReportedExpenseCount, hasAccessibleExpenseReports, hasOwnExpenseReports};
}

function getUnreportedExpenseCount(transactions: OnyxCollection<Transaction>, isConciergeInboxDM: boolean, accountID: number | undefined) {
    if (!isConciergeInboxDM || !accountID) {
        return 0;
    }

    // Only distinguish zero, one and multiple expenses, so unrelated edits do not change the selection.
    let count = 0;
    for (const transaction of Object.values(transactions ?? {})) {
        if (!transaction || transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        // Avoid double-counting owned reports or counting other users' expenses loaded by approvers.
        if (!isExpenseUnreported(transaction)) {
            continue;
        }
        count++;
        if (count === MAX_EXPENSE_COUNT) {
            return count;
        }
    }
    return count;
}

function useConciergeComposerPlaceholder(isConciergeInboxDM: boolean) {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});
    const [reportEligibility] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => getReportEligibility(reports, isConciergeInboxDM, accountID),
    });
    const [unreportedExpenseCount = 0] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => getUnreportedExpenseCount(transactions, isConciergeInboxDM, accountID),
    });
    const expenseCount = Math.min(MAX_EXPENSE_COUNT, (reportEligibility?.ownReportedExpenseCount ?? 0) + unreportedExpenseCount);

    // Retain the random seed, not a key that could become invalid when Onyx loads or expenses are removed.
    const [randomSeed] = useState(() => Math.random());
    const eligibleKeys = [
        ...DEFAULT_PLACEHOLDER_KEYS,
        ...(expenseCount > 0 || reportEligibility?.hasAccessibleExpenseReports ? (['common.concierge.composerPlaceholders.missingCategory'] as const) : []),
        ...(expenseCount > 0 ? EXPENSE_PLACEHOLDER_KEYS : []),
        ...(expenseCount > 1 ? (['common.concierge.composerPlaceholders.combineExpenses'] as const) : []),
        ...(reportEligibility?.hasAccessibleExpenseReports ? ACCESSIBLE_REPORT_PLACEHOLDER_KEYS : []),
        ...(reportEligibility?.hasOwnExpenseReports ? OWN_REPORT_PLACEHOLDER_KEYS : []),
    ];

    return eligibleKeys[Math.floor(randomSeed * eligibleKeys.length)];
}

export default useConciergeComposerPlaceholder;
