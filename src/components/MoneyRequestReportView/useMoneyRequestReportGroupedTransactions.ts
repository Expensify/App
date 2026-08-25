import useLocalize from '@hooks/useLocalize';

import {groupTransactionsByCategory, groupTransactionsByTag} from '@libs/ReportLayoutUtils';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {StableReport} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';

import type {TransactionWithOptionalHighlight} from './useMoneyRequestReportSortedTransactions';

type TransactionListItemData = {type: 'section-header'; groupKey: string; group: OnyxTypes.GroupedTransactions} | {type: 'transaction'; transaction: TransactionWithOptionalHighlight};

type UseMoneyRequestReportGroupedTransactionsParams = {
    /** The money request report containing the transactions */
    report: StableReport;

    /** Transactions sorted by the current column/direction */
    sortedTransactions: TransactionWithOptionalHighlight[];

    /** `sortedTransactions` with card fields resolved — the array the view renders */
    resolvedTransactions: TransactionWithOptionalHighlight[];

    /** The attribute transactions are grouped by */
    currentGroupBy: OnyxTypes.ReportLayoutGroupBy;

    /** Whether the transactions should be rendered in groups at all */
    shouldGroupTransactions: boolean;

    /** Whether the network is offline — pending-delete rows stay visible offline */
    isOffline: boolean;
};

type UseMoneyRequestReportGroupedTransactionsResult = {
    /** Transactions bucketed by the current group-by attribute; empty when grouping is off */
    groupedTransactions: OnyxTypes.GroupedTransactions[];

    /** Flat list of section headers + transactions in render order */
    listItems: TransactionListItemData[];

    /** Transaction IDs in the exact order the user sees them, used to seed the transaction-thread carousel */
    visualOrderTransactionIDs: string[];

    /** ID of the visually last transaction, so its row can skip the bottom border */
    lastTransactionID: string | undefined;
};

/**
 * Derives the grouped/flattened list-item arrays from the sorted transactions and the current group-by mode.
 *
 * Lives in its own hook so React Compiler can memoize the chain — inline in the component the array building
 * interleaves with other hook calls and the whole chain becomes ineligible for a reactive scope.
 *
 * Note: unlike the previous manual `useMemo`, grouping recomputes whenever the report projection changes, not
 * only on reportID/currency changes. `report` is the StableReport projection, so read-state churn (e.g.
 * lastReadTime) never reaches this hook and the extra recomputes are rare.
 */
function useMoneyRequestReportGroupedTransactions({
    report,
    sortedTransactions,
    resolvedTransactions,
    currentGroupBy,
    shouldGroupTransactions,
    isOffline,
}: UseMoneyRequestReportGroupedTransactionsParams): UseMoneyRequestReportGroupedTransactionsResult {
    const {localeCompare} = useLocalize();

    let groupedTransactions: OnyxTypes.GroupedTransactions[] = [];
    if (shouldGroupTransactions) {
        groupedTransactions =
            currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.TAG
                ? groupTransactionsByTag(resolvedTransactions, report, localeCompare)
                : groupTransactionsByCategory(resolvedTransactions, report, localeCompare);
    }

    const visualOrderTransactionIDs =
        !shouldGroupTransactions || groupedTransactions.length === 0
            ? sortedTransactions.filter((transaction) => !isTransactionPendingDelete(transaction)).map((transaction) => transaction.transactionID)
            : groupedTransactions.flatMap((group) => group.transactions.filter((transaction) => !isTransactionPendingDelete(transaction)).map((transaction) => transaction.transactionID));

    const allTransactions = shouldGroupTransactions ? groupedTransactions.flatMap((group) => group.transactions) : resolvedTransactions;
    const visibleTransactions = allTransactions.filter((t) => isOffline || !isTransactionPendingDelete(t));
    const lastTransactionID = visibleTransactions.at(-1)?.transactionID;

    const listItems: TransactionListItemData[] = [];
    if (shouldGroupTransactions) {
        for (const group of groupedTransactions) {
            listItems.push({type: 'section-header', groupKey: group.groupKey, group});
            for (const transaction of group.transactions) {
                listItems.push({type: 'transaction', transaction});
            }
        }
    } else {
        for (const transaction of resolvedTransactions) {
            listItems.push({type: 'transaction', transaction});
        }
    }

    return {
        groupedTransactions,
        listItems,
        visualOrderTransactionIDs,
        lastTransactionID,
    };
}

export default useMoneyRequestReportGroupedTransactions;
export type {TransactionListItemData};
