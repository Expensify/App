/**
 * A search group's rows and its checkbox state, read from the live selection, so the header and the rows below it
 * cannot disagree about what the group shows.
 */
import {useSearchSelectionContext} from '@components/Search/SearchContext';
import {getGroupCheckboxState, isRowChecked} from '@components/Search/selectionBuilders';

import type {TransactionListItemType} from './types';

type GroupCheckboxArgs = {
    /** The group's original (un-prefixed) key, which its rows are stamped with */
    groupKey: string;

    /** The rows the group carries */
    groupTransactions: TransactionListItemType[];

    /** How many rows the group holds, loaded or not, or undefined where the group carries no count */
    groupCount: number | undefined;
};

/** What a group's checkbox shows. Every surface that draws one reads it from here, so they cannot disagree. */
function useGroupCheckboxState({groupKey, groupTransactions, groupCount}: GroupCheckboxArgs): {isSelectAllChecked: boolean; isIndeterminate: boolean} {
    const {selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();

    return getGroupCheckboxState({groupKey, children: groupTransactions, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected, groupCount});
}

/** The same, plus the group's rows stamped with the live selection, for the call sites that render those rows. */
function useGroupChildren({groupKey, groupTransactions, groupCount}: GroupCheckboxArgs): {
    transactions: TransactionListItemType[];
    isSelectAllChecked: boolean;
    isIndeterminate: boolean;
} {
    // Read once: the checkbox state and the stamp answer the same question of the same three values, and must not diverge.
    const {selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const params = {groupKey, children: groupTransactions, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected, groupCount};

    // Stamp the live selection and the parent key onto each row, which is how a row checks whether its group was excluded.
    const transactions: TransactionListItemType[] = groupTransactions.map((transactionItem) => ({
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

    return {transactions, ...getGroupCheckboxState(params)};
}

export default useGroupChildren;
export {useGroupCheckboxState};
