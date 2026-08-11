import type FlatListRefType from '@components/FlashList/types';
import type {ActionListRef} from '@components/FlashList/types';

import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';

import type {LegendListProps, LegendListRef, LegendListRenderItemProps, OnViewableItemsChangedInfo, ViewToken as LegendListViewToken} from '@legendapp/list/react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';

import {LegendList} from '@legendapp/list/react-native';
import React, {useImperativeHandle, useMemo, useRef} from 'react';

type InitialScrollIndexParams = {
    viewOffset?: number;
    viewPosition?: number;
};

type MaintainVisibleContentPosition = {
    animateAutoScrollToBottom?: boolean;
    autoscrollToBottomThreshold?: number;
    disabled?: boolean;
};

function getOppositeIndex(itemCount: number, index: number) {
    return itemCount - index - 1;
}

function getOppositeViewPosition(viewPosition: number | undefined) {
    return viewPosition === undefined ? undefined : 1 - viewPosition;
}

function getOppositeViewOffset(viewOffset: number | undefined) {
    return viewOffset === undefined ? undefined : -viewOffset;
}

type InvertedLegendListProps<T> = Omit<
    LegendListProps<T>,
    'data' | 'initialScrollIndex' | 'keyExtractor' | 'maintainVisibleContentPosition' | 'onViewableItemsChanged' | 'ref' | 'renderItem'
> & {
    /** The array of items to render in newest-to-oldest order. */
    data: T[];

    /** Positioning params paired with the external, inverted initial index. */
    initialScrollIndexParams?: InitialScrollIndexParams;

    /** The initial index in the external, newest-to-oldest data. */
    initialScrollIndex?: number;

    /** Function that extracts a unique key using the external, inverted index. */
    keyExtractor: (item: T, index: number) => string;

    /** FlashList-compatible visible-content configuration used by ReportActionsList. */
    maintainVisibleContentPosition?: MaintainVisibleContentPosition;

    /** Receives view tokens whose indices match the external, newest-to-oldest data. */
    onViewableItemsChanged?: (info: {viewableItems: Array<ViewToken<T>>; changed: Array<ViewToken<T>>}) => void;

    /** Ref consumed by the shared report scroll manager. */
    ref: FlatListRefType;

    /** Renders an item with its index in the external, newest-to-oldest data. */
    renderItem: (info: LegendListRenderItemProps<T>) => React.ReactNode;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the component.
 * OXC bails on type parameters inside components.
 */
function InvertedLegendListImpl({
    data,
    getItemType,
    initialScrollIndex,
    initialScrollIndexParams,
    keyExtractor,
    ListFooterComponent,
    ListFooterComponentStyle,
    ListHeaderComponent,
    ListHeaderComponentStyle,
    maintainVisibleContentPosition,
    onContentSizeChange,
    onEndReached,
    onEndReachedThreshold,
    onLayout,
    onScroll,
    onStartReached,
    onStartReachedThreshold,
    onViewableItemsChanged,
    ref,
    renderItem,
    ...restProps
}: InvertedLegendListProps<unknown>) {
    const legendListRef = useRef<LegendListRef>(null);
    const contentHeightRef = useRef(0);
    const viewportHeightRef = useRef(0);
    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true, inverted: true});

    const reversedData = useMemo(() => data.toReversed(), [data]);
    useImperativeHandle(
        ref,
        (): ActionListRef => ({
            getNativeScrollRef: () => ({
                scrollToEnd: ({animated = true}: {animated?: boolean} = {}) => legendListRef.current?.scrollToIndex({animated, index: 0}),
            }),
            scrollToEnd: ({animated = true} = {}) => {
                legendListRef.current?.scrollToIndex({animated, index: 0});
            },
            scrollToIndex: ({index, viewOffset, viewPosition, ...options}) => {
                legendListRef.current?.scrollToIndex({
                    ...options,
                    index: getOppositeIndex(data.length, index),
                    viewOffset: getOppositeViewOffset(viewOffset),
                    viewPosition: getOppositeViewPosition(viewPosition),
                });
            },
            scrollToOffset: ({offset, ...options}) => {
                const maxOffset = Math.max(0, contentHeightRef.current - viewportHeightRef.current);
                legendListRef.current?.scrollToOffset({...options, offset: Math.max(0, maxOffset - offset)});
            },
        }),
        [data.length],
    );

    const handleLayout = (event: LayoutChangeEvent) => {
        viewportHeightRef.current = event.nativeEvent.layout.height;
        onLayout?.(event);
    };

    const handleContentSizeChange = (width: number, height: number) => {
        contentHeightRef.current = height;
        onContentSizeChange?.(width, height);
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
        const maxOffset = Math.max(0, contentSize.height - layoutMeasurement.height);
        const invertedEvent = {
            ...event,
            nativeEvent: {
                ...event.nativeEvent,
                contentOffset: {...contentOffset, y: Math.max(0, maxOffset - contentOffset.y)},
            },
        };

        onScroll?.(invertedEvent);
        emitComposerScrollEvents();
    };

    const mapViewToken = (token: LegendListViewToken<unknown>): ViewToken<unknown> => ({...token, index: getOppositeIndex(data.length, token.index)});
    const handleViewableItemsChanged = ({viewableItems, changed}: OnViewableItemsChangedInfo<unknown>) => {
        onViewableItemsChanged?.({
            viewableItems: viewableItems.map(mapViewToken),
            changed: changed.map(mapViewToken),
        });
    };

    const legendInitialScrollIndex =
        initialScrollIndex === undefined
            ? undefined
            : {
                  index: getOppositeIndex(data.length, initialScrollIndex),
                  viewOffset: getOppositeViewOffset(initialScrollIndexParams?.viewOffset),
                  viewPosition: getOppositeViewPosition(initialScrollIndexParams?.viewPosition),
              };

    return (
        <LegendList<unknown>
            {...restProps}
            ref={legendListRef}
            data={reversedData}
            renderItem={(info) => renderItem({...info, data, index: getOppositeIndex(data.length, info.index)})}
            keyExtractor={(item, index) => keyExtractor(item, getOppositeIndex(data.length, index))}
            getItemType={getItemType ? (item, index) => getItemType(item, getOppositeIndex(data.length, index)) : undefined}
            initialScrollAtEnd={initialScrollIndex === undefined}
            initialScrollIndex={legendInitialScrollIndex}
            alignItemsAtEnd={!ListHeaderComponentStyle}
            maintainVisibleContentPosition={maintainVisibleContentPosition?.disabled ? false : {data: true}}
            onEndReached={onStartReached ? ({distanceFromEnd}) => onStartReached({distanceFromStart: distanceFromEnd}) : undefined}
            onEndReachedThreshold={onStartReachedThreshold}
            onStartReached={onEndReached ? ({distanceFromStart}) => onEndReached({distanceFromEnd: distanceFromStart}) : undefined}
            onStartReachedThreshold={onEndReachedThreshold}
            ListHeaderComponent={ListFooterComponent}
            ListHeaderComponentStyle={ListFooterComponentStyle}
            ListFooterComponent={ListHeaderComponent}
            ListFooterComponentStyle={ListHeaderComponentStyle}
            onLayout={handleLayout}
            onContentSizeChange={handleContentSizeChange}
            onScroll={handleScroll}
            onViewableItemsChanged={handleViewableItemsChanged}
        />
    );
}

function InvertedLegendList<T>(props: InvertedLegendListProps<T>) {
    // The implementation preserves T at runtime; this only erases the generic for OXC's component transform.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return <InvertedLegendListImpl {...(props as InvertedLegendListProps<unknown>)} />;
}

export default InvertedLegendList;
