import {useSearchSelectionContext} from '@components/Search/SearchContext';
import {isRowChecked} from '@components/Search/selectionBuilders';

import type {TransactionListItemType} from './types';

type UseGroupChildrenForShiftRangeArgs = {
    /** The group's original (un-prefixed) key, which its rows are stamped with */
    groupKey: string;

    /** Whether this is the expense-report view, where the rows arrive ready to render */
    isExpenseReportType: boolean;

    /** The rows the group carries */
    groupTransactions: TransactionListItemType[];
};

/** A group's rows stamped with the live selection, for both grouped render paths. */
function useGroupChildrenForShiftRange({groupKey, isExpenseReportType, groupTransactions}: UseGroupChildrenForShiftRangeArgs): {
    transactions: TransactionListItemType[];
    isGroupChecked: boolean;
} {
    const {selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();

    // Where no rows have loaded, the group's own key answers for it — the same question the split layout's header asks.
    const isGroupChecked = isRowChecked({rowKey: groupKey, parentGroupKey: undefined, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected});

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

    return {transactions, isGroupChecked};
}

export default useGroupChildrenForShiftRange;
