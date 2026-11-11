/**
 * Keeps Concierge prompts that require existing expenses out of an empty account's composer.
 */
import useOnyx from '@hooks/useOnyx';

import {isBillReport} from '@libs/BillUtils';
import {isCurrentUserSubmitter, isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {accountIDSelector} from '@selectors/Session';
import {useState} from 'react';

// Counting stops here because the prompts only distinguish zero, one and multiple expenses, so unrelated edits do not change the selection.
const EXPENSE_COUNT_CAP = 2;

const DEFAULT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.createExpense', 'reportActionCompose.askConciergeForHelp'] as const;

const EXPENSE_PLACEHOLDER_KEYS = [
    'common.concierge.composerPlaceholders.spendLastMonth',
    'common.concierge.composerPlaceholders.topExpenses',
    'common.concierge.composerPlaceholders.spendDrivers',
    'common.concierge.composerPlaceholders.travelSpendChange',
    'common.concierge.composerPlaceholders.unsubmitted',
    'common.concierge.composerPlaceholders.exportCsv',
] as const;

const MULTIPLE_EXPENSE_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.combineExpenses'] as const;

// Answerable from the user's own expenses, including unreported ones, or from any report they can see.
const SPEND_INSIGHT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.topSpender', 'common.concierge.composerPlaceholders.missingCategory'] as const;

const PAYABLE_REPORT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.awaitingApproval', 'common.concierge.composerPlaceholders.leftToPay'] as const;

const OWN_EXPENSE_REPORT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.notReimbursed'] as const;

const OWN_REPORT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.exportPdf'] as const;

type PlaceholderEligibility = {
    /** The user's own expenses, capped at EXPENSE_COUNT_CAP */
    expenseCount: number;

    /** Whether the user can see a nonempty expense, IOU, invoice or bill report */
    hasAccessibleReports: boolean;

    /** Whether the user owns a nonempty expense or IOU report */
    hasOwnExpenseReports: boolean;

    /** Whether the user owns any nonempty report, including sent invoices and received bills */
    hasOwnReports: boolean;
};

function getReportEligibility(reports: OnyxCollection<Report>, isConciergeInboxDM: boolean, accountID: number | undefined) {
    let ownReportedExpenseCount = 0;
    let hasAccessibleReports = false;
    let hasOwnExpenseReports = false;
    let hasOwnReports = false;
    if (!isConciergeInboxDM || !accountID) {
        return {ownReportedExpenseCount, hasAccessibleReports, hasOwnExpenseReports, hasOwnReports};
    }

    for (const report of Object.values(reports ?? {})) {
        if (!report || report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || report.errorFields?.notFound) {
            continue;
        }
        const isExpenseOrIOUReport = isMoneyRequestReport(report);
        // Bills and invoices are paid like expense reports, so they count as reports the user can act on.
        if (!(isExpenseOrIOUReport || isInvoiceReport(report) || isBillReport(report)) || (report.transactionCount ?? 0) <= 0) {
            continue;
        }
        hasAccessibleReports = true;
        if (!isCurrentUserSubmitter(report, accountID)) {
            continue;
        }
        hasOwnReports = true;
        // Sent invoices hold sales and bills hold vendor charges, so neither counts as the user's expenses.
        if (!isExpenseOrIOUReport) {
            continue;
        }
        hasOwnExpenseReports = true;
        // Report counts include expenses whose transaction records have not been loaded locally.
        ownReportedExpenseCount = Math.min(EXPENSE_COUNT_CAP, ownReportedExpenseCount + (report.transactionCount ?? 0));
        // Every flag is already set once the cap is reached.
        if (ownReportedExpenseCount === EXPENSE_COUNT_CAP) {
            break;
        }
    }
    return {ownReportedExpenseCount, hasAccessibleReports, hasOwnExpenseReports, hasOwnReports};
}

function getUnreportedExpenseCount(transactions: OnyxCollection<Transaction>, isConciergeInboxDM: boolean, accountID: number | undefined) {
    if (!isConciergeInboxDM || !accountID) {
        return 0;
    }

    let count = 0;
    for (const transaction of Object.values(transactions ?? {})) {
        if (!transaction || transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        // Reported expenses are already counted from their report, and other users' expenses are never unreported.
        if (!isExpenseUnreported(transaction)) {
            continue;
        }
        count++;
        if (count === EXPENSE_COUNT_CAP) {
            return count;
        }
    }
    return count;
}

function getEligiblePlaceholderKeys({expenseCount, hasAccessibleReports, hasOwnExpenseReports, hasOwnReports}: PlaceholderEligibility) {
    return [
        ...DEFAULT_PLACEHOLDER_KEYS,
        ...(expenseCount > 0 ? EXPENSE_PLACEHOLDER_KEYS : []),
        ...(expenseCount > 1 ? MULTIPLE_EXPENSE_PLACEHOLDER_KEYS : []),
        ...(expenseCount > 0 || hasAccessibleReports ? SPEND_INSIGHT_PLACEHOLDER_KEYS : []),
        ...(hasAccessibleReports ? PAYABLE_REPORT_PLACEHOLDER_KEYS : []),
        ...(hasOwnExpenseReports ? OWN_EXPENSE_REPORT_PLACEHOLDER_KEYS : []),
        ...(hasOwnReports ? OWN_REPORT_PLACEHOLDER_KEYS : []),
    ];
}

function useConciergeComposerPlaceholder(isConciergeInboxDM: boolean) {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [reportEligibility] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => getReportEligibility(reports, isConciergeInboxDM, accountID),
    });
    const [unreportedExpenseCount = 0] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => getUnreportedExpenseCount(transactions, isConciergeInboxDM, accountID),
    });

    // Retain the random seed, not a key that could become invalid when Onyx loads or expenses are removed.
    const [randomSeed] = useState(() => Math.random());
    const eligibleKeys = getEligiblePlaceholderKeys({
        expenseCount: Math.min(EXPENSE_COUNT_CAP, (reportEligibility?.ownReportedExpenseCount ?? 0) + unreportedExpenseCount),
        hasAccessibleReports: !!reportEligibility?.hasAccessibleReports,
        hasOwnExpenseReports: !!reportEligibility?.hasOwnExpenseReports,
        hasOwnReports: !!reportEligibility?.hasOwnReports,
    });

    return eligibleKeys[Math.floor(randomSeed * eligibleKeys.length)];
}

export default useConciergeComposerPlaceholder;
export {getEligiblePlaceholderKeys, getReportEligibility, getUnreportedExpenseCount};
export type {PlaceholderEligibility};
