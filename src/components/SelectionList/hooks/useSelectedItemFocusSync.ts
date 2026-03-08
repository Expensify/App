import {useEffect, useMemo} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';

type UseSelectedItemFocusSyncParams<TItem extends ListItem, TData = TItem> = {
    /** Array of items to search in */
    data: TData[];

    /** Key of the item to focus initially */
    initiallyFocusedItemKey: string | null | undefined;

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
    focusedIndex,
    searchValue,
    setFocusedIndex,
}: UseSelectedItemFocusSyncParams<TItem, TData>) {
    const focusedItemIndex = useMemo(() => {
        if (!initiallyFocusedItemKey) {
            return -1;
        }

        return data.findIndex((item) => item.keyForList === initiallyFocusedItemKey);
    }, [data, initiallyFocusedItemKey]);

    useEffect(() => {
        if (focusedItemIndex === -1 || focusedItemIndex === focusedIndex || searchValue) {
            return;
        }
        setFocusedIndex(focusedItemIndex);

        // Only sync focus when focusedItemIndex changes, not when other dependencies update
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusedItemIndex]);

    return focusedItemIndex;
}

export default useSelectedItemFocusSync;
export type {UseSelectedItemFocusSyncParams};
