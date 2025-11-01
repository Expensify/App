import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {GroupedTransactions, ReportLayoutGroupBy} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import {convertToDisplayString} from './CurrencyUtils';
import {getAmount, getCategory, getTag} from './TransactionUtils';

/**
 * Determines if the report layout option should be shown
 * @returns Whether the report has 2 or more transactions
 */
function shouldShowReportLayoutOption(transactions: Transaction[]): boolean {
    return transactions.length >= 2;
}

/**
 * Groups transactions by category
 * @returns Array of grouped transactions with totals, sorted alphabetically (A→Z)
 */
function groupTransactionsByCategory(transactions: Transaction[], report: OnyxEntry<Report>): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const groups = new Map<string, Transaction[]>();

    transactions.forEach((transaction) => {
        const category = getCategory(transaction);
        const categoryKey = category || '';

        if (!groups.has(categoryKey)) {
            groups.set(categoryKey, []);
        }
        groups.get(categoryKey)?.push(transaction);
    });

    const result: GroupedTransactions[] = [];
    groups.forEach((transactionList, categoryKey) => {
        // Translation handled at component level
        const displayName = categoryKey;

        const totalAmount = transactionList.reduce((sum, transaction) => {
            const amount = getAmount(transaction, report.reportID !== transaction.reportID);
            return sum + amount;
        }, 0);

        result.push({
            groupName: displayName,
            groupKey: categoryKey,
            transactions: transactionList,
            totalAmount,
            isExpanded: true,
        });
    });

    // Sort alphabetically (A→Z), empty keys (uncategorized) at the end
    return result.sort((a, b) => {
        if (a.groupKey === '' && b.groupKey !== '') {
            return 1;
        }
        if (a.groupKey !== '' && b.groupKey === '') {
            return -1;
        }
        const aLower = a.groupKey.toLowerCase();
        const bLower = b.groupKey.toLowerCase();

        if (aLower < bLower) {
            return -1;
        }
        if (aLower > bLower) {
            return 1;
        }
        return 0;
    });
}

/**
 * Groups transactions by tag
 * @returns Array of grouped transactions with totals, sorted alphabetically (A→Z)
 */
function groupTransactionsByTag(transactions: Transaction[], report: OnyxEntry<Report>): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const groups = new Map<string, Transaction[]>();

    transactions.forEach((transaction) => {
        const tag = getTag(transaction);
        const tagKey = tag || '';

        if (!groups.has(tagKey)) {
            groups.set(tagKey, []);
        }
        groups.get(tagKey)?.push(transaction);
    });

    const result: GroupedTransactions[] = [];
    groups.forEach((transactionList, tagKey) => {
        // Translation handled at component level
        const displayName = tagKey;

        const totalAmount = transactionList.reduce((sum, transaction) => {
            const amount = getAmount(transaction, report.reportID !== transaction.reportID);
            return sum + amount;
        }, 0);

        result.push({
            groupName: displayName,
            groupKey: tagKey,
            transactions: transactionList,
            totalAmount,
            isExpanded: true,
        });
    });

    // Sort alphabetically (A→Z), empty keys (untagged) at the end
    return result.sort((a, b) => {
        if (a.groupKey === '' && b.groupKey !== '') {
            return 1;
        }
        if (a.groupKey !== '' && b.groupKey === '') {
            return -1;
        }
        const aLower = a.groupKey.toLowerCase();
        const bLower = b.groupKey.toLowerCase();

        if (aLower < bLower) {
            return -1;
        }
        if (aLower > bLower) {
            return 1;
        }
        return 0;
    });
}

/**
 * Calculates the total amount for a group of transactions
 * @returns Total amount for all transactions in the group
 */
function calculateGroupTotal(transactions: Transaction[], report: OnyxEntry<Report>): number {
    if (!report) {
        return 0;
    }

    return transactions.reduce((sum, transaction) => {
        const amount = getAmount(transaction, report.reportID !== transaction.reportID);
        return sum + amount;
    }, 0);
}

/**
 * Checks if there is only one group after grouping
 * @returns Whether only one group exists (indicates group headers should be hidden)
 */
function hasOnlyOneGroup(groups: GroupedTransactions[]): boolean {
    return groups.length === 1;
}

/**
 * Groups transactions based on the current group-by preference
 * @returns Array of grouped transactions based on the groupBy parameter
 */
function groupTransactions(transactions: Transaction[], report: OnyxEntry<Report>, groupBy: ReportLayoutGroupBy): GroupedTransactions[] {
    if (groupBy === CONST.REPORT_LAYOUT.GROUP_BY.TAG) {
        return groupTransactionsByTag(transactions, report);
    }
    return groupTransactionsByCategory(transactions, report);
}

/**
 * Formats the group header text
 * @returns Formatted string in the format "GroupName - $Amount" or just "GroupName"
 */
function formatGroupHeader(groupName: string, totalAmount: number, currency: string, shouldShowAmount = true): string {
    if (!shouldShowAmount) {
        return groupName;
    }

    const formattedAmount = convertToDisplayString(Math.abs(totalAmount), currency);
    return `${groupName} - ${formattedAmount}`;
}

export {shouldShowReportLayoutOption, groupTransactionsByCategory, groupTransactionsByTag, calculateGroupTotal, hasOnlyOneGroup, groupTransactions, formatGroupHeader};
