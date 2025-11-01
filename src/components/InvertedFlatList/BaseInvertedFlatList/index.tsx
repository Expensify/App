import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {FlatListProps, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList, ScrollViewProps} from 'react-native';
import FlatList from '@components/FlatList';
import useFlatListHandle from '@hooks/useFlatListHandle';
import type {FlatListInnerRefType} from '@hooks/useFlatListHandle';
import usePrevious from '@hooks/usePrevious';
import type {RenderInfo} from './RenderTaskQueue';
import RenderTaskQueue from './RenderTaskQueue';

const PAGINATION_SIZE = 15;
const INITIAL_SCROLL_DELAY = 200;

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

type BaseInvertedFlatListProps<T> = Omit<FlatListProps<T>, 'data' | 'renderItem' | 'initialScrollIndex'> & {
    shouldEnableAutoScrollToTopThreshold?: boolean;
    data: T[];
    renderItem: ListRenderItem<T>;
    initialScrollKey?: string | null;
    onInitiallyLoaded?: () => void;
    ref?: ForwardedRef<RNFlatList>;
    shouldDisableVisibleContentPosition?: boolean;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

function BaseInvertedFlatList<T>({
    shouldEnableAutoScrollToTopThreshold = false,
    initialScrollKey,
    data,
    onStartReached,
    renderItem,
    keyExtractor = defaultKeyExtractor,
    onInitiallyLoaded,
    onContentSizeChange,
    onScrollToIndexFailed,
    initialNumToRender = 10,
    ref,
    ...rest
}: BaseInvertedFlatListProps<T>) {
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
    const [isQueueRendering, setIsQueueRendering] = useState(false);

    const currentDataIndex = useMemo(() => (currentDataId === null ? 0 : data.findIndex((item, index) => keyExtractor(item, index) === currentDataId)), [currentDataId, data, keyExtractor]);

    const {displayedData, negativeScrollIndex} = useMemo(() => {
        if (currentDataIndex <= 0) {
            return {displayedData: data, negativeScrollIndex: data.length};
        }

        const itemIndex = Math.max(0, currentDataIndex - (isInitialData ? 0 : PAGINATION_SIZE));
        const minInitialIndex = Math.max(0, data.length - initialNumToRender);
        return {
            displayedData: data.slice(Math.min(itemIndex, minInitialIndex)),
            negativeScrollIndex: Math.min(data.length, data.length - itemIndex),
        };
    }, [currentDataIndex, data, initialNumToRender, isInitialData]);
    const initialNegativeScrollIndex = useRef(negativeScrollIndex);

    const isLoadingData = data.length > displayedData.length;
    const wasLoadingData = usePrevious(isLoadingData);
    const remainingItemsToDisplay = data.length - displayedData.length;

    const listRef = useRef<FlatListInnerRefType<T>>(null);
    useFlatListHandle({forwardedRef: ref, listRef, setCurrentDataId, remainingItemsToDisplay, onScrollToIndexFailed});

    // Queue up updates to the displayed data to avoid adding too many at once and cause jumps in the list.
    const renderQueue = useMemo(() => new RenderTaskQueue(setIsQueueRendering), []);
    useEffect(() => {
        return () => {
            renderQueue.cancel();
        };
    }, [renderQueue]);

    // If the unread message is on the first page, scroll to the end once the content is measured and the data is loaded
    const isMessageOnFirstPage = useRef(currentDataIndex > Math.max(0, data.length - initialNumToRender));
    const didScroll = useRef(false);
    const [didInitialContentRender, setDidInitialContentRender] = useState(false);

    const handleContentSizeChange = useCallback(
        (contentWidth: number, contentHeight: number) => {
            onContentSizeChange?.(contentWidth, contentHeight);
            setDidInitialContentRender(true);
        },
        [onContentSizeChange],
    );

    // When we are initially showing a message on the first page of the whole dataset,
    // we don't want to immediately start rendering the list.
    // Instead, we wait for the initial data to be displayed, scroll to the item manually and
    // then start rendering more items.
    useEffect(() => {
        if (didScroll.current || !isMessageOnFirstPage.current || !didInitialContentRender) {
            return;
        }

        listRef.current?.scrollToIndex({animated: false, index: displayedData.length - initialNegativeScrollIndex.current});

        // We need to wait for a few milliseconds until the scrolling is done,
        // before we start rendering additional items in the list.
        setTimeout(() => {
            didScroll.current = true;
            renderQueue.start();
        }, INITIAL_SCROLL_DELAY);
    }, [currentDataIndex, data.length, displayedData.length, didInitialContentRender, initialNumToRender, isInitialData, isMessageOnFirstPage, onInitiallyLoaded, renderQueue, listRef]);

    renderQueue.setHandler((info: RenderInfo) => {
        if (!isLoadingData) {
            onStartReached?.(info);
        }

        if (isInitialData) {
            setIsInitialData(false);
            onInitiallyLoaded?.();
        }

        const firstDisplayedItem = displayedData.at(0);
        setCurrentDataId(firstDisplayedItem ? keyExtractor(firstDisplayedItem, currentDataIndex) : '');
    });

    const handleStartReached = useCallback(
        (info: RenderInfo) => {
            // Same as above, we want to prevent rendering more items until the linked item on the first page has been scrolled to.
            const startRendering = didScroll.current || !isMessageOnFirstPage.current;
            renderQueue.add(info, startRendering);
        },
        [renderQueue],
    );

    const handleRenderItem = useCallback(
        ({item, index, separators}: ListRenderItemInfo<T>) => {
            // Adjust the index passed here so it matches the original data.
            return renderItem({item, index: index + remainingItemsToDisplay, separators});
        },
        [renderItem, remainingItemsToDisplay],
    );

    const maintainVisibleContentPosition = useMemo<ScrollViewProps['maintainVisibleContentPosition']>(() => {
        if (!initialScrollKey && (!isInitialData || !isQueueRendering)) {
            return undefined;
        }

        const enableAutoScrollToTopThreshold = shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData;

        return {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: data.length ? 0 : 0,
            autoscrollToTopThreshold: enableAutoScrollToTopThreshold ? AUTOSCROLL_TO_TOP_THRESHOLD : undefined,
        };
    }, [initialScrollKey, isInitialData, isQueueRendering, shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData, data.length]);

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={listRef}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
            data={displayedData}
            initialNumToRender={initialNumToRender}
            onStartReached={handleStartReached}
            onContentSizeChange={handleContentSizeChange}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default BaseInvertedFlatList;

export {AUTOSCROLL_TO_TOP_THRESHOLD};

export type {BaseInvertedFlatListProps};
