/**
 * Lets `HorizontalTableScroll` hand a Search list its table's sideways scroll. Two contexts, so readers of the flag don't re-render
 * when the table's width changes.
 */
import type {ScrollableNodeHolder} from '@hooks/useVerticalScrollbarWidth/types';

import type {ViewStyle} from 'react-native';

import {createContext, useContext} from 'react';

/** Whether the list also scrolls sideways. */
const ListScrollAxesContext = createContext(false);

type ListScroller = {
    /** The width of the table the list scrolls across. Its rows are absolutely positioned, so they can't widen its content. */
    contentWidthStyle?: ViewStyle;

    /** Marks the list's scroller for what measures or holds it: the sticky header and a column resize drag. */
    scrollerDataSet?: Record<string, boolean>;

    measureScrollbarRef?: (instance: ScrollableNodeHolder | null) => void;
};

const NO_LIST_SCROLLER: ListScroller = {};

const ListScrollerContext = createContext<ListScroller>(NO_LIST_SCROLLER);

function useIsListScrollingBothAxes(): boolean {
    return useContext(ListScrollAxesContext);
}

function useListScroller(): ListScroller {
    return useContext(ListScrollerContext);
}

export {ListScrollAxesContext, ListScrollerContext, useIsListScrollingBothAxes, useListScroller};
