import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {GroupedTransactions} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import {isCategoryMissing} from './CategoryUtils';
import isTagMissing from './TagUtils';
import {getCategory, getTag} from './TransactionUtils';

/**
 * Sorts grouped transactions alphabetically (A→Z) with empty keys at the end
 */
function sortGroupedTransactions(groups: GroupedTransactions[], localeCompare: LocaleContextProps['localeCompare']): GroupedTransactions[] {
    return groups.sort((a, b) => {
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
 * Groups transactions by category
 * @returns Array of grouped transactions sorted alphabetically (A→Z)
 */
function groupTransactionsByCategory(transactions: Transaction[], report: OnyxEntry<Report>, localeCompare: LocaleContextProps['localeCompare']): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const groups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
        const category = getCategory(transaction);
        const categoryKey = isCategoryMissing(category) ? '' : category;

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
            isExpanded: true,
        });
    }

    return sortGroupedTransactions(result, localeCompare);
}

/**
 * Groups transactions by tag
 * @returns Array of grouped transactions sorted alphabetically (A→Z)
 */
function groupTransactionsByTag(transactions: Transaction[], report: OnyxEntry<Report>, localeCompare: LocaleContextProps['localeCompare']): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const groups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
        const tag = getTag(transaction);
        const tagKey = isTagMissing(tag) ? '' : tag;

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
            isExpanded: true,
        });
    }

    return sortGroupedTransactions(result, localeCompare);
}

export {groupTransactionsByCategory, groupTransactionsByTag};
