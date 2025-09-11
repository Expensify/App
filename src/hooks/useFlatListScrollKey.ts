import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {FlatList as RNFlatList} from 'react-native';
import RenderTaskQueue from '@components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue';
import type {RenderInfo} from '@components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue';
import type {ScrollViewProps} from '@components/ScrollView';
import CONST from '@src/CONST';
import usePrevious from './usePrevious';

const INITIAL_SCROLL_DELAY = 200;
const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

type FlatListScrollKeyProps<T> = {
    listRef: React.RefObject<(RNFlatList<T> & HTMLElement) | null>;
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    initialScrollKey: string | null | undefined;
    initialNumToRender: number;
    inverted: boolean;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    isInitialContentRendered: boolean;
    onStartReached?: ((info: {distanceFromStart: number}) => void) | null;
    onInitiallyLoaded?: () => void;
};

export default function useFlatListScrollKey<T>({
    listRef,
    data,
    keyExtractor,
    initialScrollKey,
    onStartReached,
    inverted,
    shouldEnableAutoScrollToTopThreshold,
    initialNumToRender,
    onInitiallyLoaded,
    isInitialContentRendered,
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
    const [isInitialData, setIsInitialData] = useState(true);
    const currentDataIndex = useMemo(() => (currentDataId === null ? 0 : data.findIndex((item, index) => keyExtractor(item, index) === currentDataId)), [currentDataId, data, keyExtractor]);

    const {displayedData, negativeScrollIndex} = useMemo(() => {
        if (currentDataIndex <= 0) {
            return {displayedData: data, negativeScrollIndex: data.length};
        }

        // If data.length > 1 and highlighted item is the last element, there will be a bug that does not trigger the `onStartReached` event.
        // So we will need to return at least the last 2 elements in this case.
        const offset = !inverted && currentDataIndex === data.length - 1 ? 1 : 0;
        // We always render the list from the highlighted item to the end of the list because:
        // - With an inverted FlatList, items are rendered from bottom to top,
        //   so the highlighted item stays at the bottom and within the visible viewport.
        // - With a non-inverted (base) FlatList, items are rendered from top to bottom,
        //   making the highlighted item appear at the top of the list.
        // Then, `maintainVisibleContentPosition` ensures the highlighted item remains in place
        // as the rest of the items are appended.

        const itemIndex = Math.max(0, currentDataIndex - (isInitialData ? offset : CONST.PAGINATION_SIZE));
        const minInitialIndex = Math.max(0, data.length - initialNumToRender);
        return {
            displayedData: data.slice(Math.min(itemIndex, minInitialIndex)),
            negativeScrollIndex: Math.min(data.length, data.length - itemIndex),
        };
    }, [currentDataIndex, data, initialNumToRender, inverted, isInitialData]);
    const initialNegativeScrollIndex = useRef(negativeScrollIndex);

    // Queue up updates to the displayed data to avoid adding too many at once and cause jumps in the list.
    const renderQueue = useMemo(() => new RenderTaskQueue(), []);
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
        if (didScroll.current || !isMessageOnFirstPage.current || !isInitialContentRendered) {
            return;
        }

        listRef.current?.scrollToIndex({animated: false, index: displayedData.length - initialNegativeScrollIndex.current});

        // We need to wait for a few milliseconds until the scrolling is done,
        // before we start rendering additional items in the list.
        setTimeout(() => {
            didScroll.current = true;
            renderQueue.start();
        }, INITIAL_SCROLL_DELAY);
    }, [currentDataIndex, data.length, displayedData.length, isInitialContentRendered, initialNumToRender, isInitialData, isMessageOnFirstPage, onInitiallyLoaded, renderQueue, listRef]);

    const isLoadingData = data.length > displayedData.length;
    const wasLoadingData = usePrevious(isLoadingData);
    const remainingItemsToDisplay = data.length - displayedData.length;

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

    const maintainVisibleContentPosition = useMemo<ScrollViewProps['maintainVisibleContentPosition']>(() => {
        const enableAutoScrollToTopThreshold = shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData;

        return {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: data.length ? 0 : 0,
            autoscrollToTopThreshold: enableAutoScrollToTopThreshold ? AUTOSCROLL_TO_TOP_THRESHOLD : undefined,
        };
    }, [data.length, shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData]);

    return {
        handleStartReached,
        setCurrentDataId,
        remainingItemsToDisplay,
        displayedData,
        isInitialData,
        maintainVisibleContentPosition,
    };
}

export {AUTOSCROLL_TO_TOP_THRESHOLD};
