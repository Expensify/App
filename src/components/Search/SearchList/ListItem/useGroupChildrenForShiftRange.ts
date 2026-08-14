import {useSearchSelectionContext} from '@components/Search/SearchContext';
import {countCheckedGroupChildren, isGroupChecked, isRowChecked} from '@components/Search/selectionBuilders';

import {isTransactionPendingDelete} from '@libs/TransactionUtils';

import type {TransactionListItemType} from './types';

type UseGroupChildrenForShiftRangeArgs = {
    /** The group's original (un-prefixed) key, which its rows are stamped with */
    groupKey: string;

    /** Whether this is the expense-report view, where the rows arrive ready to render */
    isExpenseReportType: boolean;

    /** The rows the group carries */
    groupTransactions: TransactionListItemType[];
};

/** A group's rows stamped with the live selection, and the state its checkbox reads, for both grouped render paths. */
function useGroupChildrenForShiftRange({groupKey, isExpenseReportType, groupTransactions}: UseGroupChildrenForShiftRangeArgs): {
    transactions: TransactionListItemType[];
    isSelectAllChecked: boolean;
    isIndeterminate: boolean;
} {
    const {selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();

    // One derivation for both layouts: they disagreed for a round over whether a row being deleted counts, and the checkbox is what the user compares.
    const params = {groupKey, children: groupTransactions, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected};
    const selectableTransactions = groupTransactions.filter((transaction) => !isTransactionPendingDelete(transaction));
    const selectedCount = countCheckedGroupChildren({...params, children: selectableTransactions});

    // Stamp the live selection and the parent key onto each row, which is how a row checks whether its group was excluded. Expense-report rows carry both already.
    const transactions: TransactionListItemType[] = isExpenseReportType
        ? groupTransactions
        : groupTransactions.map((transactionItem) => ({
              ...transactionItem,
              isSelected: isRowChecked({
                  rowKey: transactionItem.keyForList,
                  parentGroupKey: groupKey,
                  selectedTransactions,
                  excludedTransactions,
                  areAllMatchingItemsSelected,
              }),
              selectionGroupKey: groupKey,
          }));

    return {transactions, isSelectAllChecked: isGroupChecked(params), isIndeterminate: selectedCount > 0 && selectedCount !== selectableTransactions.length};
}

export default useGroupChildrenForShiftRange;
