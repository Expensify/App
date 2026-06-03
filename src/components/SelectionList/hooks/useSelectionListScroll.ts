import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';
import useDebounce from '@hooks/useDebounce';
import Log from '@libs/Log';
import CONST from '@src/CONST';

type ScrollToIndex = (index: number, animated?: boolean) => void;

type UseSelectionListScrollResult = {
    /** Scrolls to the item at the given index, guarding out-of-bounds and not-yet-laid-out indexes */
    scrollToIndex: ScrollToIndex;

    /** Debounced scrollToIndex (leading + trailing), for high-frequency callers like search filtering */
    debouncedScrollToIndex: ScrollToIndex;
};

/**
 * Bounds-checked scroll-to-index helpers (immediate + debounced) over a SelectionList's FlashList ref,
 * shared by BaseSelectionList (flat) and BaseSelectionListWithSections (sectioned). The ref is owned by
 * the component (it is attached to the FlashList and exposed via the component's imperative handle).
 */
function useSelectionListScroll<TData>(listRef: RefObject<FlashListRef<TData> | null>, data: TData[]): UseSelectionListScrollResult {
    const scrollToIndex: ScrollToIndex = (index, animated = true) => {
        if (index < 0 || index >= data.length || !listRef.current) {
            return;
        }
        const item = data.at(index);
        if (!item) {
            return;
        }
        try {
            listRef.current.scrollToIndex({index, animated});
        } catch (error) {
            // FlashList may throw if the layout for this index doesn't exist yet — e.g. when data
            // changes rapidly during search filtering. The layout is computed on the next render,
            // so this is safe to ignore.
            Log.warn('SelectionList: error scrolling to index', {error});
        }
    };

    const debouncedScrollToIndex = useDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true});

    return {scrollToIndex, debouncedScrollToIndex};
}

export default useSelectionListScroll;
