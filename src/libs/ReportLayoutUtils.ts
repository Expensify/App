import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {GroupedTransactions} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import {getDecodedCategoryName, isCategoryMissing} from './CategoryUtils';
import {getDecodedTagName, isTagMissing} from './TagUtils';
import {getAmount, getCategory, getCurrency, getTag, isTransactionPendingDelete} from './TransactionUtils';

/**
 * Sorts groups with RBR-flagged groups first, then alphabetically (A→Z) with empty keys at the end.
 * When rbrTransactionIDs is provided, groups containing at least one RBR transaction are ordered before
 * groups without any RBR transactions. Within each RBR band, the existing alphabetical sort applies.
 */
function sortGroupedTransactions(groups: GroupedTransactions[], localeCompare: LocaleContextProps['localeCompare']): GroupedTransactions[] {
    return groups.sort((a, b) => {
        // RBR groups first
        if (!!a.hasRBR !== !!b.hasRBR) {
            return a.hasRBR ? -1 : 1;
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
    rbrTransactionIDs?: Set<string>,
): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const reportCurrency = report.currency ?? '';
    const groups = new Map<string, {transactions: Transaction[]; hasRBR: boolean}>();

    for (const transaction of transactions) {
        const category = getCategory(transaction);
        const categoryKey = isCategoryMissing(category) ? '' : getDecodedCategoryName(category);

        if (!groups.has(categoryKey)) {
            groups.set(categoryKey, {transactions: [], hasRBR: false});
        }
        const group = groups.get(categoryKey);
        group?.transactions.push(transaction);
        if (rbrTransactionIDs?.has(transaction.transactionID) && group) {
            group.hasRBR = true;
        }
    }

    const result: GroupedTransactions[] = [];
    for (const [categoryKey, {transactions: transactionList, hasRBR}] of groups) {
        result.push({
            groupName: categoryKey,
            groupKey: categoryKey,
            transactions: transactionList,
            subTotalAmount: calculateGroupTotal(transactionList, reportCurrency),
            isExpanded: true,
            hasRBR,
        });
    }

    return sortGroupedTransactions(result, localeCompare);
}

/**
 * Groups transactions by tag
 */
function groupTransactionsByTag(
    transactions: Transaction[],
    report: OnyxEntry<Report>,
    localeCompare: LocaleContextProps['localeCompare'],
    rbrTransactionIDs?: Set<string>,
): GroupedTransactions[] {
    if (!report) {
        return [];
    }

    const reportCurrency = report.currency ?? '';
    const groups = new Map<string, {transactions: Transaction[]; hasRBR: boolean}>();

    for (const transaction of transactions) {
        const tag = getTag(transaction);
        const tagKey = isTagMissing(tag) ? '' : getDecodedTagName(tag);

        if (!groups.has(tagKey)) {
            groups.set(tagKey, {transactions: [], hasRBR: false});
        }
        const group = groups.get(tagKey);
        group?.transactions.push(transaction);
        if (rbrTransactionIDs?.has(transaction.transactionID) && group) {
            group.hasRBR = true;
        }
    }

    const result: GroupedTransactions[] = [];
    for (const [tagKey, {transactions: transactionList, hasRBR}] of groups) {
        result.push({
            groupName: tagKey,
            groupKey: tagKey,
            transactions: transactionList,
            subTotalAmount: calculateGroupTotal(transactionList, reportCurrency),
            isExpanded: true,
            hasRBR,
        });
    }

    return sortGroupedTransactions(result, localeCompare);
}

export {groupTransactionsByCategory, groupTransactionsByTag};
