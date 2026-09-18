import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {GroupedTransactions} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import {getDecodedCategoryName, isCategoryMissing} from './CategoryUtils';
import {getDecodedTagName, isTagMissing} from './TagUtils';
import {getAmount, getCategory, getCurrency, getTag, isTransactionPendingDelete} from './TransactionUtils';

/** Compares the leading (first rendered) transaction of two groups under the sort the user selected */
type CompareLeadingTransactions = (a: Transaction, b: Transaction) => number;

/**
 * Sorts groups alphabetically (A→Z) with empty keys at the end.
 * When `compareLeadingTransactions` is passed, the groups follow the sorted column instead, so the group headers
 * can't hold a group in place while the rows inside it move. Alphabetical order remains the tiebreak.
 */
function sortGroupedTransactions(
    groups: GroupedTransactions[],
    localeCompare: LocaleContextProps['localeCompare'],
    compareLeadingTransactions?: CompareLeadingTransactions,
): GroupedTransactions[] {
    return [...groups].sort((a, b) => {
        if (compareLeadingTransactions) {
            const leadingA = a.transactions.at(0);
            const leadingB = b.transactions.at(0);
            // Defensive only: the grouping functions below create a group at the moment they push a transaction into
            // it, so a group is never empty and this guard never falls through to the alphabetical order in practice.
            if (leadingA && leadingB) {
                const result = compareLeadingTransactions(leadingA, leadingB);
                if (result !== 0) {
                    return result;
                }
            }
        }
        if (a.groupKey === '' && b.groupKey !== '') {
            return 1;
        }
        if (a.groupKey !== '' && b.groupKey === '') {
            return -1;
        }
        return localeCompare(a.groupKey, b.groupKey);
    });
}

/**
 * Returns convertedAmount with sign flipped for display (stored negative, displayed positive)
 */
function getConvertedAmount(transaction: Transaction): number {
    const convertedAmount = transaction.convertedAmount ?? 0;
    return convertedAmount ? -convertedAmount : 0;
}

/**
 * Calculates group total using amount for same-currency transactions, falls back to convertedAmount for multi-currency
 * Excludes transactions that are pending delete
 */
function calculateGroupTotal(transactionList: Transaction[], reportCurrency: string): number {
    let total = 0;
    for (const transaction of transactionList) {
        if (isTransactionPendingDelete(transaction)) {
            continue;
        }

        const transactionCurrency = getCurrency(transaction);
        if (transactionCurrency === reportCurrency) {
            total += getAmount(transaction, true, false, true);
        } else if (transaction.convertedAmount) {
            total += getConvertedAmount(transaction);
        }
    }
    return total;
}

/**
 * Groups transactions by category
 */
function groupTransactionsByCategory(
    transactions: Transaction[],
    report: OnyxEntry<Report>,
    localeCompare: LocaleContextProps['localeCompare'],
    compareLeadingTransactions?: CompareLeadingTransactions,
): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const reportCurrency = report.currency ?? '';
    const groups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
        const category = getCategory(transaction);
        const categoryKey = isCategoryMissing(category) ? '' : getDecodedCategoryName(category);

        if (!groups.has(categoryKey)) {
            groups.set(categoryKey, []);
        }
        groups.get(categoryKey)?.push(transaction);
    }

    const result: GroupedTransactions[] = [];
    for (const [categoryKey, transactionList] of groups) {
        result.push({
            groupName: categoryKey,
            groupKey: categoryKey,
            transactions: transactionList,
            subTotalAmount: calculateGroupTotal(transactionList, reportCurrency),
            isExpanded: true,
        });
    }

    return sortGroupedTransactions(result, localeCompare, compareLeadingTransactions);
}

/**
 * Groups transactions by tag
 */
function groupTransactionsByTag(
    transactions: Transaction[],
    report: OnyxEntry<Report>,
    localeCompare: LocaleContextProps['localeCompare'],
    compareLeadingTransactions?: CompareLeadingTransactions,
): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const reportCurrency = report.currency ?? '';
    const groups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
        const tag = getTag(transaction);
        const tagKey = isTagMissing(tag) ? '' : getDecodedTagName(tag);

        if (!groups.has(tagKey)) {
            groups.set(tagKey, []);
        }
        groups.get(tagKey)?.push(transaction);
    }

    const result: GroupedTransactions[] = [];
    for (const [tagKey, transactionList] of groups) {
        result.push({
            groupName: tagKey,
            groupKey: tagKey,
            transactions: transactionList,
            subTotalAmount: calculateGroupTotal(transactionList, reportCurrency),
            isExpanded: true,
        });
    }

    return sortGroupedTransactions(result, localeCompare, compareLeadingTransactions);
}

export {groupTransactionsByCategory, groupTransactionsByTag};
export type {CompareLeadingTransactions};
