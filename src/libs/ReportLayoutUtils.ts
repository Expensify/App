import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {GroupedTransactions} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import {getCategory, getTag} from './TransactionUtils';

/**
 * Groups transactions by category
 * @returns Array of grouped transactions with totals, sorted alphabetically (A→Z)
 */
function groupTransactionsByCategory(transactions: Transaction[], report: OnyxEntry<Report>, localeCompare: LocaleContextProps['localeCompare']): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const groups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
        const category = getCategory(transaction);
        const categoryKey = category || '';

        if (!groups.has(categoryKey)) {
            groups.set(categoryKey, []);
        }
        groups.get(categoryKey)?.push(transaction);
    }

    const result: GroupedTransactions[] = [];
    for (const [categoryKey, transactionList] of groups) {
        // Translation handled at component level
        const displayName = categoryKey;

        const totalAmount = transactionList.reduce((sum, transaction) => {
            // Only include transactions with convertedAmount (already converted to report currency)
            // Skip transactions without convertedAmount to avoid mixing currencies (e.g., offline created expenses)
            if (!transaction.convertedAmount) {
                return sum;
            }
            return sum + transaction.convertedAmount;
        }, 0);

        result.push({
            groupName: displayName,
            groupKey: categoryKey,
            transactions: transactionList,
            totalAmount,
            isExpanded: true,
        });
    }

    // Sort alphabetically (A→Z), empty keys (uncategorized) at the end
    return result.sort((a, b) => {
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
 * Groups transactions by tag
 * @returns Array of grouped transactions with totals, sorted alphabetically (A→Z)
 */
function groupTransactionsByTag(transactions: Transaction[], report: OnyxEntry<Report>, localeCompare: LocaleContextProps['localeCompare']): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const groups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
        const tag = getTag(transaction);
        const tagKey = tag || '';

        if (!groups.has(tagKey)) {
            groups.set(tagKey, []);
        }
        groups.get(tagKey)?.push(transaction);
    }

    const result: GroupedTransactions[] = [];
    for (const [tagKey, transactionList] of groups) {
        // Translation handled at component level
        const displayName = tagKey;

        const totalAmount = transactionList.reduce((sum, transaction) => {
            // Only include transactions with convertedAmount (already converted to report currency)
            // Skip transactions without convertedAmount to avoid mixing currencies (e.g., offline created expenses)
            if (!transaction.convertedAmount) {
                return sum;
            }
            return sum + transaction.convertedAmount;
        }, 0);

        result.push({
            groupName: displayName,
            groupKey: tagKey,
            transactions: transactionList,
            totalAmount,
            isExpanded: true,
        });
    }

    // Sort alphabetically (A→Z), empty keys (untagged) at the end
    return result.sort((a, b) => {
        if (a.groupKey === '' && b.groupKey !== '') {
            return 1;
        }
        if (a.groupKey !== '' && b.groupKey === '') {
            return -1;
        }
        return localeCompare(a.groupKey, b.groupKey);
    });
}

export {groupTransactionsByCategory, groupTransactionsByTag};
