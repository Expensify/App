import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import useFlashListScrollKey from '@components/FlashList/useFlashListScrollKey';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
    initialScrollIndexParams: initialScrollIndexParamsProp,
    maintainVisibleContentPosition: maintainVisibleContentPositionProp,
    shouldMaintainVisibleContentPosition,
    ...restProps
}: InvertedFlashListProps<T>) {
    const {onStartReached, maintainVisibleContentPosition: maintainVisibleContentPositionForScrollKey} = useFlashListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        onStartReached: onStartReachedProp,
        shouldMaintainVisibleContentPosition,
    });

    const {windowHeight} = useWindowDimensions();
    const targetIndex = initialScrollKey == null ? -1 : data.findIndex((item, index) => keyExtractor(item, index) === initialScrollKey);
    const initialScrollIndex = targetIndex < 0 ? undefined : targetIndex;

    const viewOffset = initialScrollIndex === undefined ? undefined : -Math.max(windowHeight / 2, 0);
    const defaultInitialScrollIndexParams: FlashListProps<T>['initialScrollIndexParams'] = viewOffset === undefined ? undefined : {viewOffset};
    const initialScrollIndexParams = initialScrollIndexParamsProp === undefined ? defaultInitialScrollIndexParams : initialScrollIndexParamsProp;

    const maintainVisibleContentPosition = maintainVisibleContentPositionProp
        ? {
              ...maintainVisibleContentPositionForScrollKey,
              ...maintainVisibleContentPositionProp,
          }
        : maintainVisibleContentPositionForScrollKey;

    return (
        <FlashList<T>
            {...restProps}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
            onStartReached={onStartReached}
            data={data}
            keyExtractor={keyExtractor}
            CellRendererComponent={CellRendererComponent}
            initialScrollIndex={initialScrollIndex}
            initialScrollIndexParams={initialScrollIndexParams}
        />
    );
}

export default InvertedFlashList;
