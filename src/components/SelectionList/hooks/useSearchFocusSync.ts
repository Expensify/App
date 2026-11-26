import type {ListItem} from '@components/SelectionList/ListItem/types';

import usePrevious from '@hooks/usePrevious';

import {useEffect} from 'react';

type UseSearchFocusSyncParams<TItem extends ListItem, TData = TItem> = {
    /** The current search value from text input */
    searchValue: string | undefined;

    /** Array of items (filtered data) */
    data: TData[];

    selectedOptionsCount: number;

    /** Function to check if an item is selected */
    isItemSelected: (item: TData) => boolean;

    /** Whether multiple items can be selected */
    canSelectMultiple: boolean;

    /** Whether focus index should be updated when selection changes */
    shouldUpdateFocusedIndex: boolean;

    scrollToIndex: (index: number, animated?: boolean) => void;
    setFocusedIndex: (index: number) => void;

    /** The first focusable index in the list (useful when index 0 is a header). Defaults to 0. */
    firstFocusableIndex?: number;
};

/**
 * Custom hook that manages focus synchronization when search value or selection changes.
 * This handles:
 * - Resetting focus when search is cleared
 * - Scrolling to selected item when search is cleared
 * - Setting focus to first item when filtering
 */
function useSearchFocusSync<TItem extends ListItem, TData = TItem>({
    searchValue,
    data,
    selectedOptionsCount,
    isItemSelected,
    canSelectMultiple,
    shouldUpdateFocusedIndex,
    scrollToIndex,
    setFocusedIndex,
    firstFocusableIndex = 0,
}: UseSearchFocusSyncParams<TItem, TData>) {
    const prevSearchValue = usePrevious(searchValue);
    const prevSelectedOptionsCount = usePrevious(selectedOptionsCount);
    const prevItemsLength = usePrevious(data.length);
    const searchChanged = prevSearchValue !== searchValue;
    const selectedOptionsChanged = selectedOptionsCount !== prevSelectedOptionsCount;
    const selectionChangedByClicking = !searchChanged && selectedOptionsChanged && shouldUpdateFocusedIndex;

    let nextFocusedIndex: number | undefined;
    let scrollIndex: number | undefined;
    if ((searchChanged || selectedOptionsChanged) && data.length > 0 && !selectionChangedByClicking) {
        const selectedIndex = prevSearchValue && !searchValue && !canSelectMultiple ? data.findIndex(isItemSelected) : -1;
        const isSearchIdle = !prevSearchValue && !searchValue;
        const shouldResetFocus = isSearchIdle || (selectedOptionsChanged && prevItemsLength === data.length);
        if (selectedIndex !== -1) {
            nextFocusedIndex = selectedIndex;
            scrollIndex = selectedIndex;
        } else if (shouldResetFocus) {
            nextFocusedIndex = -1;
        } else {
            nextFocusedIndex = firstFocusableIndex;
            scrollIndex = 0;
        }
    }

    useEffect(() => {
        if (nextFocusedIndex === undefined) {
            return;
        }
        if (scrollIndex !== undefined) {
            scrollToIndex(scrollIndex, false);
        }
        setFocusedIndex(nextFocusedIndex);
    }, [nextFocusedIndex, scrollIndex, scrollToIndex, setFocusedIndex, searchValue]);

    // The displayed rows and their focus must agree at commit, before the scroll effect runs.
    return searchChanged ? nextFocusedIndex : undefined;
}

export default useSearchFocusSync;
