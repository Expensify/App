import type {LegendListProps, LegendListRef, LegendListRenderItemProps} from '@legendapp/list';
import {LegendList} from '@legendapp/list';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import getInitialPaginationSize from './getInitialPaginationSize';

type LegendListType = typeof LegendList;

const INITIAL_PAGINATION_SIZE = 50;
const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

// Adapted from https://github.com/facebook/react-native/blob/29a0d7c3b201318a873db0d1b62923f4ce720049/packages/virtualized-lists/Lists/VirtualizeUtils.js#L237
function defaultKeyExtractor<T>(item: T | {key: string} | {id: string}, index: number): string {
    if (item != null) {
        if (typeof item === 'object' && 'key' in item) {
            return item.key;
        }
        if (typeof item === 'object' && 'id' in item) {
            return item.id;
        }
    }
    return String(index);
}

type BaseInvertedFlatListProps<T> = Omit<LegendListProps<T>, 'data' | 'renderItem' | 'initialScrollIndex'> & {
    data: T[];
    renderItem: LegendListProps<T>['renderItem'];
    initialScrollKey?: string | null;
};

function BaseInvertedFlatList<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<LegendListType>) {
    const {initialScrollKey, data, onEndReached, renderItem, keyExtractor = defaultKeyExtractor, style, contentContainerStyle, columnWrapperStyle, onRefresh, ...rest} = props;
    // `initialScrollIndex` doesn't work properly with FlatList, this uses an alternative approach to achieve the same effect.
    // What we do is start rendering the list from `initialScrollKey` and then whenever we reach the start we render more
    // previous items, until everything is rendered. We also progressively render new data that is added at the start of the
    // list to make sure `maintainVisibleContentPosition` works as expected.

    const [currentDataId, setCurrentDataId] = useState(() => {
        if (initialScrollKey) {
            return initialScrollKey;
        }
        return null;
    });
    const [isInitialData, setIsInitialData] = useState(true);

    const currentDataIndex = useMemo(() => (currentDataId === null ? 0 : data.findIndex((item, index) => keyExtractor(item, index) === currentDataId)), [currentDataId, data, keyExtractor]);

    const displayedData = useMemo(() => {
        if (currentDataIndex <= 0) {
            // Show initial batch of messages (50 items initially, then all if we've loaded older)
            const initialSize = isInitialData ? INITIAL_PAGINATION_SIZE : data.length;
            return data.slice(0, initialSize).reverse();
        }
        // Show from currentDataIndex backward with expansion
        const sliceStart = Math.max(0, currentDataIndex - (isInitialData ? 0 : getInitialPaginationSize));
        return data.slice(sliceStart).reverse();
    }, [currentDataIndex, data, isInitialData]);

    const isLoadingData = data.length > displayedData.length;
    const dataIndexDifference = data.length - displayedData.length;

    const firstDisplayedItemIndex = useMemo(() => displayedData.length - 1, [displayedData.length]);

    const handleStartReached = useCallback(
        (info: {distanceFromStart: number}) => {
            if (!isLoadingData) {
                onEndReached?.({distanceFromEnd: info.distanceFromStart});
            }
            setIsInitialData(false);
            // Get the first item in reversed displayedData (which is the oldest item we're currently showing)
            const firstDisplayedItem = displayedData.at(firstDisplayedItemIndex);
            if (firstDisplayedItem) {
                // Find this item's original index in the data array
                const originalIndex = data.findIndex((item) => keyExtractor(item, 0) === keyExtractor(firstDisplayedItem, 0));
                setCurrentDataId(keyExtractor(firstDisplayedItem, originalIndex));
            } else {
                setCurrentDataId('');
            }
        },
        [isLoadingData, onEndReached, displayedData, firstDisplayedItemIndex, data, keyExtractor],
    );

    const handleRenderItem = useCallback(
        ({item, index}: LegendListRenderItemProps<T>) => {
            // Since we've reversed the displayedData, calculate the correct original index
            // The last item in displayedData (index 0 after reverse) should have the highest original index
            const reversedIndex = firstDisplayedItemIndex - index;
            const originalIndex = reversedIndex + dataIndexDifference;

            return renderItem?.({
                item,
                index: originalIndex,
                extraData: {},
            });
        },
        [renderItem, dataIndexDifference, firstDisplayedItemIndex],
    );

    const shouldMaintainVisibleContentPosition = useMemo(() => {
        return data.length > 0;
    }, [data.length]);

    const initialScrollIndex = useMemo(() => {
        // Start at the end of the reversed list (newest messages at bottom)
        return Math.max(0, firstDisplayedItemIndex);
    }, [firstDisplayedItemIndex]);

    const listRef = useRef<LegendListRef | null>(null);

    useImperativeHandle(ref, () => {
        // Create a proxy that mimics RNFlatList interface but delegates to LegendListRef
        const scrollToOffsetFn = (params: {offset: number; animated?: boolean}) => {
            if (params.offset === 0) {
                setCurrentDataId(null);
                // For scroll-to-bottom (offset: 0), scroll to the end since data is reversed
                requestAnimationFrame(() => {
                    listRef.current?.scrollToEnd?.({
                        animated: params.animated ?? false,
                    });
                });
                return;
            }
            requestAnimationFrame(() => {
                listRef.current?.scrollToOffset?.(params);
            });
        };

        return new Proxy(
            {},
            {
                get: (_target, prop) => {
                    if (prop === 'scrollToOffset') {
                        return scrollToOffsetFn;
                    }
                    return listRef.current?.[prop as keyof LegendListRef];
                },
            },
        ) as LegendListType;
    });

    // Estimate item sizes based on content type to prevent layout jumping
    const getEstimatedItemSize = useCallback((index: number, item: T) => {
        if (item && typeof item === 'object') {
            const reportAction = item as Record<string, unknown>;

            // Money request previews have complex async layout calculations
            // They contain: onCarouselLayout, onWrapperLayout, onTextLayoutChange, dynamic transaction carousel
            if (reportAction.actionName === 'REPORTPREVIEW') {
                const originalMessage = reportAction.originalMessage as Record<string, unknown>;

                if (originalMessage?.type === 'SUBMITTED' || originalMessage?.type === 'APPROVED') {
                    // Simple submitted/approved states - still need room for potential carousel
                    return 400;
                }

                return 500;
            }

            // Task items (based on measurements: ~68px)
            if (reportAction.childType === 'task') {
                return 70;
            }

            // Thread replies
            if (typeof reportAction.childVisibleActionCount === 'number' && reportAction.childVisibleActionCount > 0) {
                return 120;
            }

            // Attachment messages
            const message = reportAction.message as Array<Record<string, unknown>> | undefined;
            const messageText = (message?.[0]?.text as string) || '';
            if (messageText === '[Attachment]') {
                return 100;
            }

            // Regular text messages - vary by length (measured: 36-56px for short messages)
            const messageLength = messageText.length;
            if (messageLength > 50) {
                return 60;
            }
        }

        return 45;
    }, []);

    return (
        <LegendList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={listRef}
            data={displayedData}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
            maintainVisibleContentPosition={shouldMaintainVisibleContentPosition}
            getEstimatedItemSize={getEstimatedItemSize}
            initialScrollIndex={initialScrollIndex}
            onStartReached={handleStartReached}
            columnWrapperStyle={columnWrapperStyle ?? undefined}
            onRefresh={onRefresh ?? undefined}
            alignItemsAtEnd
            waitForInitialLayout
            maintainScrollAtEnd={!isLoadingData}
            style={style}
            contentContainerStyle={contentContainerStyle}
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default forwardRef(BaseInvertedFlatList);
export {AUTOSCROLL_TO_TOP_THRESHOLD};

export type {BaseInvertedFlatListProps};
