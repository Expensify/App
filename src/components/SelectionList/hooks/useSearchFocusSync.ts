import {useEffect} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import usePrevious from '@hooks/usePrevious';

type UseSearchFocusSyncParams<TItem extends ListItem, TData = TItem> = {
    /** The current search value from text input */
    searchValue: string | undefined;

    /** Array of items (filtered data) */
    data: TData[];

    /** Count of currently selected options */
    selectedOptionsCount: number;

    /** Function to check if an item is selected */
    isItemSelected: (item: TData) => boolean;

    /** Whether multiple items can be selected */
    canSelectMultiple: boolean;

    /** Whether focus index should be updated when selection changes */
    shouldUpdateFocusedIndex: boolean;

    /** Function to scroll to an index */
    scrollToIndex: (index: number, animated?: boolean) => void;

    /** Function to set the focused index */
    setFocusedIndex: (index: number) => void;

    /** The current focused index — needed to avoid arming scroll suppression when the index won't actually change */
    focusedIndex?: number;

    /** The first focusable index in the list (useful when index 0 is a header). Defaults to 0. */
    firstFocusableIndex?: number;

    /** Optional callback to suppress the scroll that onFocusedIndexChange would otherwise trigger when setFocusedIndex is called */
    suppressNextFocusScroll?: () => void;
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
    focusedIndex,
    firstFocusableIndex = 0,
    suppressNextFocusScroll,
}: UseSearchFocusSyncParams<TItem, TData>) {
    const prevSearchValue = usePrevious(searchValue);
    const prevSelectedOptionsCount = usePrevious(selectedOptionsCount);
    const prevItemsLength = usePrevious(data.length);

    useEffect(() => {
        const searchChanged = prevSearchValue !== searchValue;
        const selectedOptionsChanged = selectedOptionsCount !== prevSelectedOptionsCount;
        const selectionChangedByClicking = !searchChanged && selectedOptionsChanged && shouldUpdateFocusedIndex;

        // Do not change focus if:
        // 1. Input value is the same or
        // 2. Data length is 0 or
        // 3. Selection changed via user interaction (not filtering), so focus is handled externally
        if ((!searchChanged && !selectedOptionsChanged) || data.length === 0 || selectionChangedByClicking) {
            return;
        }

        const hasSearchBeenCleared = prevSearchValue && !searchValue;
        if (hasSearchBeenCleared) {
            const foundSelectedItemIndex = data.findIndex(isItemSelected);

            if (foundSelectedItemIndex !== -1 && !canSelectMultiple) {
                scrollToIndex(foundSelectedItemIndex, false);
                if (foundSelectedItemIndex !== focusedIndex) {
                    suppressNextFocusScroll?.();
                }
                setFocusedIndex(foundSelectedItemIndex);
                return;
            }
        }

        // Remove focus (set focused index to -1) if:
        // 1. If the search is idle or
        // 2. If the user is just toggling options without changing the list content
        // Otherwise (e.g. when filtering/typing), scroll to top and focus on the first focusable item
        const isSearchIdle = !prevSearchValue && !searchValue;
        const shouldResetFocus = isSearchIdle || (selectedOptionsChanged && prevItemsLength === data.length);

        if (shouldResetFocus) {
            setFocusedIndex(-1);
            return;
        }

        // Scroll to top of list and focus on first focusable item (not header)
        scrollToIndex(0, false);
        if (firstFocusableIndex !== focusedIndex) {
            suppressNextFocusScroll?.();
        }
        setFocusedIndex(firstFocusableIndex);
    }, [
        canSelectMultiple,
        data,
        selectedOptionsCount,
        prevItemsLength,
        prevSelectedOptionsCount,
        prevSearchValue,
        scrollToIndex,
        setFocusedIndex,
        shouldUpdateFocusedIndex,
        searchValue,
        isItemSelected,
        focusedIndex,
        firstFocusableIndex,
        suppressNextFocusScroll,
    ]);
}

export default useSearchFocusSync;
export type {UseSearchFocusSyncParams};
