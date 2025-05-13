import {useCallback, useEffect, useMemo, useState} from 'react';
import RenderTaskQueue from '@components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue';
import getInitialPaginationSize from '@src/components/InvertedFlatList/BaseInvertedFlatList/getInitialPaginationSize';

export default function useFlatListScrollKey<T>(
    data: T[],
    keyExtractor: (item: T, index: number) => string,
    initialScrollKey: string | null | undefined,
    inverted?: boolean,
    onStartReached?: ((info: {distanceFromStart: number}) => void) | null,
    onEndReached?: ((info: {distanceFromEnd: number}) => void) | null,
) {
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
    const lastIndex = inverted ? 0 : data.length - 1;
    const currentDataIndex = useMemo(
        () => (currentDataId === null ? lastIndex : data.findIndex((item, index) => keyExtractor(item, index) === currentDataId)),
        [currentDataId, data, keyExtractor, lastIndex],
    );

    const displayedData = useMemo(() => {
        if (inverted) {
            if (currentDataIndex <= 0) {
                return data;
            }
            return data.slice(Math.max(0, currentDataIndex - (isInitialData ? 0 : getInitialPaginationSize)));
        }
        if (currentDataIndex >= data.length - 1) {
            return data;
        }
        return data.slice(0, isInitialData ? currentDataIndex + 1 : data.length);
    }, [currentDataIndex, data, isInitialData, inverted]);

    const isLoadingData = data.length > displayedData.length;

    // Queue up updates to the displayed data to avoid adding too many at once and cause jumps in the list.
    const renderQueue = useMemo(() => new RenderTaskQueue(), []);

    useEffect(() => {
        return () => {
            renderQueue.cancel();
        };
    }, [renderQueue]);

    renderQueue.setHandler((info) => {
        if (!isLoadingData) {
            if (inverted) {
                onStartReached?.(
                    info as {
                        distanceFromStart: number;
                    },
                );
            } else {
                onEndReached?.(
                    info as {
                        distanceFromEnd: number;
                    },
                );
            }
        }
        setIsInitialData(false);
        const firstDisplayedItem = displayedData.at(inverted ? 0 : 0);
        setCurrentDataId(firstDisplayedItem ? keyExtractor(firstDisplayedItem, currentDataIndex) : '');
    });

    const handleStartReached = useCallback(
        (info: {distanceFromStart: number}) => {
            renderQueue.add(info);
        },
        [renderQueue],
    );

    const handleEndReached = useCallback(
        (info: {distanceFromEnd: number}) => {
            renderQueue.add(info);
        },
        [renderQueue],
    );

    return {
        handleStartReached,
        handleEndReached,
        setCurrentDataId,
        displayedData,
        isLoadingData,
    };
}
