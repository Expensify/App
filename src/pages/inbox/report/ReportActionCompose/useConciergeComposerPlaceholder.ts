/**
 * Keeps Concierge prompts that require existing expenses out of an empty account's composer.
 */
import useOnyx from '@hooks/useOnyx';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {useState} from 'react';

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

const REPORT_PLACEHOLDER_KEYS = [
    'common.concierge.composerPlaceholders.awaitingApproval',
    'common.concierge.composerPlaceholders.notReimbursed',
    'common.concierge.composerPlaceholders.leftToPay',
    'common.concierge.composerPlaceholders.exportPdf',
] as const;

function useConciergeComposerPlaceholder(isConciergeInboxDM: boolean) {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});
    const [hasExpenseReports = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) =>
            isConciergeInboxDM &&
            !!accountID &&
            Object.values(reports ?? {}).some(
                (report) =>
                    isMoneyRequestReport(report) &&
                    report?.ownerAccountID === accountID &&
                    report?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                    (report?.transactionCount ?? 0) > 0,
            ),
    });
    const [expenseCount = 0] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => {
            if (!isConciergeInboxDM) {
                return 0;
            }

            // Only distinguish zero, one and multiple expenses, so unrelated edits do not change the selection.
            let count = 0;
            for (const transaction of Object.values(transactions ?? {})) {
                if (!transaction || transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    continue;
                }
                count++;
                if (count === 2) {
                    return count;
                }
            }
            return count;
        },
    });

    // Retain the random seed, not a key that could become invalid when Onyx loads or expenses are removed.
    const [randomSeed] = useState(() => Math.random());
    const eligibleKeys = [
        ...DEFAULT_PLACEHOLDER_KEYS,
        ...(expenseCount > 0 ? EXPENSE_PLACEHOLDER_KEYS : []),
        ...(expenseCount > 1 ? (['common.concierge.composerPlaceholders.combineExpenses'] as const) : []),
        ...(hasExpenseReports ? REPORT_PLACEHOLDER_KEYS : []),
    ];

    return eligibleKeys[Math.floor(randomSeed * eligibleKeys.length)];
}

export default useConciergeComposerPlaceholder;
