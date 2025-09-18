import {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
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
    const currentDataIndex = useMemo(() => (currentDataId === null ? -1 : data.findIndex((item, index) => keyExtractor(item, index) === currentDataId)), [currentDataId, data, keyExtractor]);
    const [isInitialData, setIsInitialData] = useState(currentDataIndex >= 0);
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
        return data.slice(Math.max(0, currentDataIndex - (isInitialData ? 0 : getInitialPaginationSize)));
    }, [currentDataIndex, data, isInitialData]);

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
        setCurrentDataId(firstDisplayedItem ? keyExtractor(firstDisplayedItem, Math.max(0, currentDataIndex)) : '');
    });

    const handleStartReached = useCallback(
        (info: {distanceFromStart: number}) => {
            renderQueue.add(info);
        },
        [renderQueue],
    );

    useEffect(() => {
        // In cases where the data is empty on the initial render, `handleStartReached` will never be triggered.
        // We'll manually invoke it in this scenario.
        if (inverted || data.length > 0) {
            return;
        }
        handleStartReached({distanceFromStart: 0});
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const [shouldPreserveVisibleContentPosition, setShouldPreserveVisibleContentPosition] = useState(false);
    const maintainVisibleContentPosition = useMemo(() => {
        if (shouldPreserveVisibleContentPosition) {
            return undefined;
        }

        const dataLength = inverted ? data.length : displayedData.length;
        const config: ScrollViewProps['maintainVisibleContentPosition'] = {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: dataLength ? Math.min(1, dataLength - 1) : 0,
        };

        if (shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }

        return config;
    }, [shouldPreserveVisibleContentPosition, inverted, data.length, displayedData.length, shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData]);

    useEffect(() => {
        if (inverted || isInitialData) {
            return;
        }

        // Unlike an inverted FlatList, a non-inverted FlatList can have data.length === 0,
        // which causes the initial value of `minIndexForVisible` to be 0.
        // When data.length increases and `minIndexForVisible` updates accordingly,
        // it can lead to a crash due to inconsistent rendering behavior.
        // Additionally, keeping `minIndexForVisible` at 1 may cause the scroll offset to shift
        // when the height of the ListHeaderComponent changes, as FlatList tries to keep items within the visible viewport.
        InteractionManager.runAfterInteractions(() => {
            setShouldPreserveVisibleContentPosition(true);
        });
    }, [inverted, isInitialData]);

    return {
        handleStartReached,
        setCurrentDataId,
        displayedData,
        maintainVisibleContentPosition,
        isInitialData,
    };
}

export {AUTOSCROLL_TO_TOP_THRESHOLD};
