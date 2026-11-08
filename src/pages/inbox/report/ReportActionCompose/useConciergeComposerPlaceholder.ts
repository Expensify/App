/**
 * Keeps Concierge prompts that require existing expenses out of an empty account's composer.
 */
import useOnyx from '@hooks/useOnyx';
import {isCurrentUserSubmitter, isMoneyRequestReport} from '@libs/ReportUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import {useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';

const DEFAULT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.createExpense', 'reportActionCompose.askConciergeForHelp'] as const;

const EXPENSE_PLACEHOLDER_KEYS = [
    'common.concierge.composerPlaceholders.spendLastMonth',
    'common.concierge.composerPlaceholders.topExpenses',
    'common.concierge.composerPlaceholders.spendDrivers',
    'common.concierge.composerPlaceholders.travelSpendChange',
    'common.concierge.composerPlaceholders.topSpender',
    'common.concierge.composerPlaceholders.missingCategory',
    'common.concierge.composerPlaceholders.unsubmitted',
    'common.concierge.composerPlaceholders.exportCsv',
] as const;

const ACCESSIBLE_REPORT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.awaitingApproval', 'common.concierge.composerPlaceholders.leftToPay'] as const;

const OWN_REPORT_PLACEHOLDER_KEYS = ['common.concierge.composerPlaceholders.notReimbursed', 'common.concierge.composerPlaceholders.exportPdf'] as const;

function getReportEligibility(reports: OnyxCollection<Report>, isConciergeInboxDM: boolean, accountID: number | undefined) {
    const ownedReportIDs: Record<string, boolean> = {};
    let hasAccessibleExpenseReports = false;
    let hasOwnExpenseReports = false;
    if (!isConciergeInboxDM || !accountID) {
        return {ownedReportIDs, hasAccessibleExpenseReports, hasOwnExpenseReports};
    }

    for (const report of Object.values(reports ?? {})) {
        if (!report || report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || report.errorFields?.notFound) {
            continue;
        }
        const isOwnReport = isCurrentUserSubmitter(report, accountID);
        // Keep ownership even before report counts hydrate, including expenses tracked in self-DM.
        if (isOwnReport) {
            ownedReportIDs[report.reportID] = true;
        }
        if (!isMoneyRequestReport(report) || (report.transactionCount ?? 0) === 0) {
            continue;
        }
        hasAccessibleExpenseReports = true;
        hasOwnExpenseReports ||= isOwnReport;
    }
    return {ownedReportIDs, hasAccessibleExpenseReports, hasOwnExpenseReports};
}

function getExpenseCount(transactions: OnyxCollection<Transaction>, isConciergeInboxDM: boolean, accountID: number | undefined, ownedReportIDs: Record<string, boolean> | undefined) {
    if (!isConciergeInboxDM || !accountID) {
        return 0;
    }

    // Only distinguish zero, one and multiple expenses, so unrelated edits do not change the selection.
    let count = 0;
    for (const transaction of Object.values(transactions ?? {})) {
        if (!transaction || transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        // Approvers can load other people's expenses, but those must not enable personal prompts.
        if (!isExpenseUnreported(transaction) && (!transaction.reportID || !ownedReportIDs?.[transaction.reportID])) {
            continue;
        }
        count++;
        if (count === 2) {
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
    const [expenseCount = 0] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => getExpenseCount(transactions, isConciergeInboxDM, accountID, reportEligibility?.ownedReportIDs),
    });

    // Retain the random seed, not a key that could become invalid when Onyx loads or expenses are removed.
    const [randomSeed] = useState(() => Math.random());
    const eligibleKeys = [
        ...DEFAULT_PLACEHOLDER_KEYS,
        ...(expenseCount > 0 ? EXPENSE_PLACEHOLDER_KEYS : []),
        ...(expenseCount > 1 ? (['common.concierge.composerPlaceholders.combineExpenses'] as const) : []),
        ...(reportEligibility?.hasAccessibleExpenseReports ? ACCESSIBLE_REPORT_PLACEHOLDER_KEYS : []),
        ...(reportEligibility?.hasOwnExpenseReports ? OWN_REPORT_PLACEHOLDER_KEYS : []),
    ];

    return eligibleKeys[Math.floor(randomSeed * eligibleKeys.length)];
}

export default useConciergeComposerPlaceholder;
