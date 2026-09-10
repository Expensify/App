import useDebounce from '@hooks/useDebounce';

import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {LegendListRef} from '@legendapp/list/react-native';
import type {RefObject} from 'react';

type ScrollToIndex = (index: number, animated?: boolean) => void;

type UseSelectionListScrollResult = {
    scrollToIndex: ScrollToIndex;
    debouncedScrollToIndex: ScrollToIndex;
};

/** Bounds-checked scroll-to-index helpers (immediate + debounced) over the component-owned LegendList ref. */
function useSelectionListScroll<TData>(listRef: RefObject<Pick<LegendListRef, 'scrollToIndex'> | null>, data: TData[]): UseSelectionListScrollResult {
    const scrollToIndex: ScrollToIndex = (index, animated = true) => {
        if (index < 0 || index >= data.length || !listRef.current) {
            return;
        }
        const item = data.at(index);
        if (!item) {
            return;
        }
        try {
            Promise.resolve(listRef.current.scrollToIndex({index, animated})).catch((error: unknown) => {
                Log.warn('SelectionList: error scrolling to index', {error});
            });
        } catch (error) {
            // LegendList can throw if this index isn't laid out yet (e.g. rapid search filtering); it resolves on the next render.
            Log.warn('SelectionList: error scrolling to index', {error});
        }
    };

    const debouncedScrollToIndex = useDebounce(scrollToIndex, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME, {leading: true, trailing: true});

    return {scrollToIndex, debouncedScrollToIndex};
}

export default useSelectionListScroll;
