import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';
import useDebounce from '@hooks/useDebounce';
import CONST from '@src/CONST';

type ScrollToIndex = (index: number, animated?: boolean) => void;

type UseSelectionListScrollResult = {
    scrollToIndex: ScrollToIndex;
    debouncedScrollToIndex: ScrollToIndex;
};

/** Bounds-checked scroll-to-index helpers (immediate + debounced) over the component-owned FlashList ref. */
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
        } catch {
            // FlashList can throw if this index isn't laid out yet (e.g. rapid search filtering); it resolves on the next render, so it's safe to ignore.
        }
    };

    const debouncedScrollToIndex = useDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true});

    return {scrollToIndex, debouncedScrollToIndex};
}

export default useSelectionListScroll;
