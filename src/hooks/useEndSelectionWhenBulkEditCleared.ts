/**
 * Ends a list's selection once the bulk-edit page it was handed to is saved. That page clears the items it was given
 * after saving, so the list watches how many items the bulk edit holds and clears its own selection when none are left.
 */
import {useState} from 'react';

function useEndSelectionWhenBulkEditCleared(bulkEditSelectionCount: number, clearSelection: () => void) {
    const [prevBulkEditSelectionCount, setPrevBulkEditSelectionCount] = useState(bulkEditSelectionCount);
    if (prevBulkEditSelectionCount === bulkEditSelectionCount) {
        return;
    }

    setPrevBulkEditSelectionCount(bulkEditSelectionCount);
    if (!bulkEditSelectionCount) {
        clearSelection();
    }
}

export default useEndSelectionWhenBulkEditCleared;
