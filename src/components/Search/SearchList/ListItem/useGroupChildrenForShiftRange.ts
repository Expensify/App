import {useSearchSelectionContext} from '@components/Search/SearchContext';
import {isRowChecked} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {TransactionListItemType} from './types';
import type {UseGroupChildRowsArgs} from './useGroupChildRows';

import useGroupChildRows from './useGroupChildRows';
import useRegisterGroupChildrenForShiftRange from './useRegisterGroupChildrenForShiftRange';

type UseGroupChildrenForShiftRangeArgs = UseGroupChildRowsArgs & {
    /** The group's original (un-prefixed) key, which children are registered under */
    groupKey: string;
};

/**
 * One source for a group's children across both grouped render paths: derives them, publishes them for shift+click,
 * and returns them stamped with the live selection.
 */
function useGroupChildrenForShiftRange({groupKey, ...rowArgs}: UseGroupChildrenForShiftRangeArgs): {
    transactions: TransactionListItemType[];
    isGroupSelected: boolean;
} {
    const {selectedTransactions, excludedTransactions = getEmptyObject<SelectedTransactions>(), areAllMatchingItemsSelected} = useSearchSelectionContext();

    // Selection-independent on purpose: folding isSelected in would churn the registered children on every selection change.
    const rangeChildren = useGroupChildRows(rowArgs);

    useRegisterGroupChildrenForShiftRange(groupKey, rangeChildren, !rowArgs.isExpenseReportType);

    // A group selected before its children were fetched is stored under the group key, since no transaction IDs were known yet.
    const isGroupSelected = !!selectedTransactions[groupKey]?.isSelected;

    // Stamp the live selection and the parent key onto each row, which is how a row checks whether its group was excluded. Expense-report rows carry both already.
    const transactions: TransactionListItemType[] = rowArgs.isExpenseReportType
        ? rangeChildren
        : rangeChildren.map((transactionItem) => ({
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

    return {transactions, isGroupSelected};
}

export default useGroupChildrenForShiftRange;
