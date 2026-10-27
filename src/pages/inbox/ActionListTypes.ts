import type {RefObject} from 'react';

type ScrollToIndexParams = {
    animated?: boolean;
    index: number;
    viewOffset?: number;
    viewPosition?: number;
};

type ScrollToOffsetParams = {
    animated?: boolean;
    offset: number;
};

type ScrollToEndParams = {
    animated?: boolean;
};

/** Common imperative API used by the report scroll manager across FlatList, FlashList, and LegendList. */
type ActionListRef = {
    scrollToIndex: (params: ScrollToIndexParams) => void;
    scrollToOffset: (params: ScrollToOffsetParams) => void;
    scrollToEnd: (params?: ScrollToEndParams) => void;
    getNativeScrollRef?: () => {scrollToEnd?: (params?: ScrollToEndParams) => void} | null | undefined;
    getScrollableNode?: () => unknown;
    getLayout?: (index: number) => unknown;
    computeVisibleIndices?: () => {startIndex: number; endIndex: number} | undefined;
    /** Measured item positions supplied by LegendList. Other list implementations can omit this. */
    getState?: () => {positionByKey: (key: string) => number | undefined; scroll?: number; contentLength?: number; scrollLength?: number} | undefined;
};

/** Ref to the underlying list instance attached via `ref={}`. */
type ActionListRefType = RefObject<ActionListRef | null> | null;

export default ActionListRefType;
export type {ActionListRef};
