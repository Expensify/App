import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import useFlashListScrollKey from '@components/FlashList/useFlashListScrollKey';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

type InvertedFlashListProps<T> = FlashListProps<T> & {
    /** Key of the item to initially scroll to when the list first renders. */
    initialScrollKey?: string | null;

    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;

    /** Ref to the underlying list instance. */
    ref: FlatListRefType;

    /** Whether the list should handle `maintainVisibleContentPosition` */
    shouldMaintainVisibleContentPosition?: boolean;
};

function InvertedFlashList<T>({
    data,
    keyExtractor,
    initialScrollKey,
    onStartReached: onStartReachedProp,
    maintainVisibleContentPosition: maintainVisibleContentPositionProp,
    shouldMaintainVisibleContentPosition,
    initialScrollIndex: initialScrollIndexProp,
    initialScrollIndexParams: initialScrollIndexParamsProp,
    ...restProps
}: InvertedFlashListProps<T>) {
    const {
        displayedData,
        onStartReached,
        maintainVisibleContentPosition: maintainVisibleContentPositionForScrollKey,
        initialScrollIndex: initialScrollIndexForScrollKey,
        initialScrollIndexParams: initialScrollIndexParamsForScrollKey,
    } = useFlashListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        onStartReached: onStartReachedProp,
        shouldMaintainVisibleContentPosition,
    });

    const maintainVisibleContentPosition = maintainVisibleContentPositionProp
        ? {
              ...maintainVisibleContentPositionForScrollKey,
              ...maintainVisibleContentPositionProp,
          }
        : maintainVisibleContentPositionForScrollKey;

    // While the deep-link handoff is active the hook owns the initial scroll target; otherwise
    // fall back to the props (used e.g. to align money request reports to the top on mount).
    const isScrollKeyHandoffActive = initialScrollIndexForScrollKey !== undefined;
    const initialScrollIndex = isScrollKeyHandoffActive ? initialScrollIndexForScrollKey : initialScrollIndexProp;
    const initialScrollIndexParams = isScrollKeyHandoffActive ? initialScrollIndexParamsForScrollKey : initialScrollIndexParamsProp;

    return (
        <FlashList<T>
            {...restProps}
            inverted
            onStartReached={onStartReached}
            data={displayedData}
            keyExtractor={keyExtractor}
            CellRendererComponent={CellRendererComponent}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            initialScrollIndex={initialScrollIndex}
            initialScrollIndexParams={initialScrollIndexParams}
        />
    );
}

export default InvertedFlashList;
