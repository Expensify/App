import {useEffect, useMemo} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';

type UseSelectedItemFocusSyncParams<TItem extends ListItem, TData = TItem> = {
    /** Array of items to search in */
    data: TData[];

    /** Key of the item to focus initially */
    initiallyFocusedItemKey: string | null | undefined;

    /** Function to check if an item is selected */
    isItemSelected: (item: TData) => boolean;

    /** Current focused index */
    focusedIndex: number;

    /** Current search value - if present, don't sync focus */
    searchValue: string | undefined;

    /** Function to set the focused index */
    setFocusedIndex: (index: number) => void;
};

/**
 * Custom hook that syncs the focused index with the selected item.
 * When the selected item changes (and no search is active), updates the focused index.
 */
function useSelectedItemFocusSync<TItem extends ListItem, TData = TItem>({
    data,
    initiallyFocusedItemKey,
    isItemSelected,
    focusedIndex,
    searchValue,
    setFocusedIndex,
}: UseSelectedItemFocusSyncParams<TItem, TData>) {
    const selectedItemIndex = useMemo(() => (initiallyFocusedItemKey ? data.findIndex(isItemSelected) : -1), [data, initiallyFocusedItemKey, isItemSelected]);

    useEffect(() => {
        if (selectedItemIndex === -1 || selectedItemIndex === focusedIndex || searchValue) {
            return;
        }
        setFocusedIndex(selectedItemIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemIndex]);

    return selectedItemIndex;
}

export default useSelectedItemFocusSync;
export type {UseSelectedItemFocusSyncParams};
