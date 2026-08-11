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
    getNativeScrollRef?: () => unknown;
};

/** Ref to the underlying list instance attached via `ref={}`. */
type FlatListRefType = RefObject<ActionListRef | null> | null;

export default FlatListRefType;
export type {ActionListRef};
