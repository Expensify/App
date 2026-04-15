import React, {useCallback, useEffect, useEffectEvent, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList} from 'react-native';
import {View} from 'react-native';
import RenderTaskQueue from '@components/FlatList/InvertedFlatList/RenderTaskQueue';
import type {RenderInfo} from '@components/FlatList/InvertedFlatList/RenderTaskQueue';
import type {FlatListInnerRefType} from '@components/FlatList/types';
import type {ScrollViewProps} from '@components/ScrollView';
import usePrevious from '@hooks/usePrevious';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import useFlatListHandle from './useFlatListHandle';

const PAGINATION_SIZE = 15;
const INITIAL_SCROLL_DELAY = 200;
const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

type FlatListScrollKeyProps<T> = {
    ref?: ForwardedRef<RNFlatList<T>>;
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    initialScrollKey: string | null | undefined;
    inverted: boolean;
    onStartReached?: ((info: {distanceFromStart: number}) => void) | null;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    renderItem: ListRenderItem<T>;
    initialNumToRender?: number;
    didInitialContentRender?: boolean;
    onScrollToIndexFailed?: (params: {index: number; averageItemLength: number; highestMeasuredFrameIndex: number}) => void;
    onInitiallyLoaded?: () => void;
};

function useFlatListScrollKey<T>({
    data,
    keyExtractor,
    initialScrollKey,
    onStartReached,
    inverted,
    shouldEnableAutoScrollToTopThreshold,
    renderItem,
    ref,
    initialNumToRender = 10,
    didInitialContentRender = true,
    onScrollToIndexFailed,
    onInitiallyLoaded,
}: FlatListScrollKeyProps<T>) {
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
    const currentDataIndex = useMemo(() => (currentDataId === null ? -1 : data.findIndex((item, index) => keyExtractor(item, index) === currentDataId)), [currentDataId, data, keyExtractor]);
    const [isInitialData, setIsInitialData] = useState(currentDataIndex >= 0);
    const [isQueueRendering, setIsQueueRendering] = useState(false);

    // On the web platform, when data.length === 1, `maintainVisibleContentPosition` does not work.
    // Therefore, we need to duplicate the data to ensure data.length >= 2
    const shouldDuplicateData = useMemo(() => !inverted && data.length === 1 && isInitialData && getPlatform() === CONST.PLATFORM.WEB, [data.length, inverted, isInitialData]);

    const {displayedData, negativeScrollIndex} = useMemo(() => {
        if (shouldDuplicateData) {
            return {displayedData: [{...data.at(0), reportActionID: '0'} as T, ...data], negativeScrollIndex: data.length};
        }

        // If no initially linked item is set, we render the entire dataset.
        if (currentDataIndex <= 0) {
            return {displayedData: data, negativeScrollIndex: data.length};
        }

        // If data.length > 1 and highlighted item is the last element, there will be a bug that does not trigger the `onStartReached` event.
        // So we will need to return at least the last 2 elements in this case.
        const offset = !inverted && currentDataIndex === data.length - 1 ? 1 : 0;

        // On first render, we only render the items up to the initially linked item.
        // This allows `maintainVisibleContentPosition` to render the initially linked item at the bottom of the list.
        const itemIndex = Math.max(0, currentDataIndex - (isInitialData ? offset : PAGINATION_SIZE));

        // On the first render, we need to ensure that we render at least the initial number of items.
        // If the initially linked item is closer to the end of the list, we need to render more items and
        // therefore the initially linked element will not be rendered right at the bottom of the list.
        const minInitialIndex = Math.max(0, data.length - initialNumToRender);
        const firstItemIndex = Math.min(itemIndex, minInitialIndex);

        return {
            // We always render the list from the highlighted item to the end of the list because:
            // - With an inverted FlatList, items are rendered from bottom to top,
            //   so the highlighted item stays at the bottom and within the visible viewport.
            // - With a non-inverted (base) FlatList, items are rendered from top to bottom,
            //   making the highlighted item appear at the top of the list.
            // Then, `maintainVisibleContentPosition` ensures the highlighted item remains in place
            // as the rest of the items are appended and
            // the dataset only contains items up to the initially linked item.
            displayedData: data.slice(firstItemIndex),
            // This is needed to allow scrolling to the initially linked item, when it's on the first page of the dataset.
            negativeScrollIndex: Math.min(data.length, data.length - itemIndex),
        };
    }, [currentDataIndex, data, initialNumToRender, inverted, isInitialData, shouldDuplicateData]);

    const initialNegativeScrollIndex = useRef(negativeScrollIndex);
    const isLoadingData = data.length > displayedData.length;
    const wasLoadingData = usePrevious(isLoadingData);
    const remainingItemsToDisplay = data.length - displayedData.length;

    const listRef = useRef<FlatListInnerRefType<T> | null>(null);

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
    }, [currentDataIndex, data.length, displayedData.length, didInitialContentRender, initialNumToRender, isMessageOnFirstPage, renderQueue, listRef]);

    renderQueue.setHandler((info: RenderInfo) => {
        if (!isLoadingData) {
            onStartReached?.(info);
        }

        if (isInitialData) {
            setIsInitialData(false);
            onInitiallyLoaded?.();
        }

        const firstDisplayedItem = displayedData.at(0);
        setCurrentDataId(firstDisplayedItem ? keyExtractor(firstDisplayedItem, Math.max(0, currentDataIndex)) : null);
    });

    const handleStartReached = useCallback(
        (info: RenderInfo) => {
            // Same as above, we want to prevent rendering more items until the linked item on the first page has been scrolled to.
            const startRendering = didScroll.current || !isMessageOnFirstPage.current;
            renderQueue.add(info, startRendering);
        },
        [renderQueue],
    );

    const onInitialEmptyDataset = useEffectEvent(() => {
        // In cases where the data is empty on the initial render, `handleStartReached` will never be triggered.
        // We'll manually invoke it in this scenario.
        if (inverted || data.length > 0) {
            return;
        }
        handleStartReached({distanceFromStart: 0});
    });

    useEffect(() => {
        onInitialEmptyDataset();
    }, []);

    const [shouldPreserveVisibleContentPosition, setShouldPreserveVisibleContentPosition] = useState(true);
    const maintainVisibleContentPosition = useMemo<ScrollViewProps['maintainVisibleContentPosition']>(() => {
        if ((!initialScrollKey && (!isInitialData || !isQueueRendering)) || !shouldPreserveVisibleContentPosition) {
            return undefined;
        }

        const enableAutoScrollToTopThreshold = shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData;

        return {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: displayedData.length ? Math.min(1, displayedData.length - 1) : 0,
            autoscrollToTopThreshold: enableAutoScrollToTopThreshold ? AUTOSCROLL_TO_TOP_THRESHOLD : undefined,
        };
    }, [initialScrollKey, isInitialData, isQueueRendering, shouldPreserveVisibleContentPosition, shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData, displayedData.length]);

    const handleRenderItem = useCallback(
        ({item, index, separators}: ListRenderItemInfo<T>) => {
            // Adjust the index passed here so it matches the original data.
            if (shouldDuplicateData && index === 1) {
                return React.createElement(View, {style: {opacity: 0}}, renderItem({item, index: index + remainingItemsToDisplay, separators}));
            }

            return renderItem({item, index: index + remainingItemsToDisplay, separators});
        },
        [shouldDuplicateData, renderItem, remainingItemsToDisplay],
    );

    useEffect(() => {
        if (inverted || isInitialData || isQueueRendering) {
            return;
        }

        // Unlike an inverted FlatList, a non-inverted FlatList can have data.length === 0,
        // which causes the initial value of `minIndexForVisible` to be 0.
        // When data.length increases and `minIndexForVisible` updates accordingly,
        // it can lead to a crash due to inconsistent rendering behavior.
        // Additionally, keeping `minIndexForVisible` at 1 may cause the scroll offset to shift
        // when the height of the ListHeaderComponent changes, as FlatList tries to keep items within the visible viewport.
        requestAnimationFrame(() => {
            setShouldPreserveVisibleContentPosition(false);
        });
    }, [inverted, isInitialData, isQueueRendering]);

    useFlatListHandle<T>({
        ref,
        listRef,
        remainingItemsToDisplay,
        setCurrentDataId,
        onScrollToIndexFailed,
    });

    return {
        handleStartReached,
        setCurrentDataId,
        displayedData,
        maintainVisibleContentPosition,
        isInitialData,
        handleRenderItem,
        listRef,
    };
}

export default useFlatListScrollKey;

export {AUTOSCROLL_TO_TOP_THRESHOLD};
