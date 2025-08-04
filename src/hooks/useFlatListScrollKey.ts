import {useCallback, useEffect, useMemo, useState} from 'react';
import RenderTaskQueue from '@components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue';
import type {ScrollViewProps} from '@components/ScrollView';
import getInitialPaginationSize from '@src/components/InvertedFlatList/BaseInvertedFlatList/getInitialPaginationSize';
import usePrevious from './usePrevious';

type FlatListScrollKeyProps<T> = {
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    initialScrollKey: string | null | undefined;
    inverted: boolean;
    onStartReached?: ((info: {distanceFromStart: number}) => void) | null;
    shouldEnableAutoScrollToTopThreshold?: boolean;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

export default function useFlatListScrollKey<T>({data, keyExtractor, initialScrollKey, onStartReached, inverted, shouldEnableAutoScrollToTopThreshold}: FlatListScrollKeyProps<T>) {
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
            return data;
        }
        // We always render the list from the highlighted item to the end of the list because:
        // - With an inverted FlatList, items are rendered from bottom to top,
        //   so the highlighted item stays at the bottom and within the visible viewport.
        // - With a non-inverted (base) FlatList, items are rendered from top to bottom,
        //   making the highlighted item appear at the top of the list.
        // Then, `maintainVisibleContentPosition` ensures the highlighted item remains in place
        // as the rest of the items are appended.
        if (inverted) {
            return data.slice(Math.max(0, currentDataIndex - (isInitialData ? 0 : getInitialPaginationSize)));
        }
        // If data.length > 1 and highlighted item is the last element, there will be a bug that does not trigger the `onStartReached` event.
        // So we will need to return at least the last 2 elements in this case.
        return !isInitialData ? data : data.slice(Math.max(0, currentDataIndex === data.length - 1 ? currentDataIndex - 1 : currentDataIndex));
    }, [currentDataIndex, data, isInitialData, inverted]);

    const isLoadingData = data.length > displayedData.length;
    const wasLoadingData = usePrevious(isLoadingData);

    // Queue up updates to the displayed data to avoid adding too many at once and cause jumps in the list.
    const renderQueue = useMemo(() => new RenderTaskQueue(), []);
    useEffect(() => {
        return () => {
            renderQueue.cancel();
        };
    }, [renderQueue]);

    renderQueue.setHandler((info) => {
        if (!isLoadingData) {
            onStartReached?.(info);
        }
        setIsInitialData(false);
        const firstDisplayedItem = displayedData.at(0);
        setCurrentDataId(firstDisplayedItem ? keyExtractor(firstDisplayedItem, currentDataIndex) : '');
    });

    const handleStartReached = useCallback(
        (info: {distanceFromStart: number}) => {
            renderQueue.add(info);
        },
        [renderQueue],
    );

    const maintainVisibleContentPosition = useMemo(() => {
        const config: ScrollViewProps['maintainVisibleContentPosition'] = {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: data.length ? Math.min(1, data.length - 1) : 0,
        };

        if (shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }

        return config;
    }, [data.length, shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData]);

    return {
        handleStartReached,
        setCurrentDataId,
        displayedData,
        maintainVisibleContentPosition,
        isInitialData,
    };
}

export {AUTOSCROLL_TO_TOP_THRESHOLD};
