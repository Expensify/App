import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList, ScrollView} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {View} from 'react-native';
import getInitialPaginationSize from '@components/InvertedFlatList/getInitialPaginationSize';
import RenderTaskQueue from '@components/InvertedFlatList/RenderTaskQueue';
import type {ScrollViewProps} from '@components/ScrollView';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import usePrevious from './usePrevious';

type FlatListScrollKeyProps<T> = {
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    initialScrollKey: string | null | undefined;
    inverted: boolean;
    onStartReached?: ((info: {distanceFromStart: number}) => void) | null;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    renderItem: ListRenderItem<T>;
    ref?: ForwardedRef<RNFlatList>;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

export default function useFlatListScrollKey<T>({
    data,
    keyExtractor,
    initialScrollKey,
    onStartReached,
    inverted,
    shouldEnableAutoScrollToTopThreshold,
    renderItem,
    ref,
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

    const displayedData = useMemo(() => {
        if (shouldDuplicateData) {
            return [{...data.at(0), reportActionID: '0'} as T, ...data];
        }
        if (currentDataIndex <= 0) {
            return data;
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
        return data.slice(Math.max(0, currentDataIndex - (isInitialData ? offset : getInitialPaginationSize)));
    }, [currentDataIndex, data, inverted, isInitialData, shouldDuplicateData]);

    const isLoadingData = data.length > displayedData.length;
    const wasLoadingData = usePrevious(isLoadingData);
    const dataIndexDifference = data.length - displayedData.length;

    // Queue up updates to the displayed data to avoid adding too many at once and cause jumps in the list.
    const renderQueue = useMemo(() => new RenderTaskQueue(setIsQueueRendering), []);
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
        setCurrentDataId(firstDisplayedItem ? keyExtractor(firstDisplayedItem, Math.max(0, currentDataIndex)) : null);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [shouldPreserveVisibleContentPosition, setShouldPreserveVisibleContentPosition] = useState(true);
    const maintainVisibleContentPosition = useMemo(() => {
        if ((!initialScrollKey && (!isInitialData || !isQueueRendering)) || !shouldPreserveVisibleContentPosition) {
            return {
                minIndexForVisible: null as unknown as number,
            };
        }

        const config: ScrollViewProps['maintainVisibleContentPosition'] = {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: data.length ? Math.min(1, data.length - 1) : 0,
        };

        if (shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }

        return config;
    }, [initialScrollKey, isInitialData, isQueueRendering, shouldPreserveVisibleContentPosition, data.length, shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData]);

    const handleRenderItem = useCallback(
        ({item, index, separators}: ListRenderItemInfo<T>) => {
            // Adjust the index passed here so it matches the original data.
            if (shouldDuplicateData && index === 1) {
                return React.createElement(View, {style: {opacity: 0}}, renderItem({item, index: index + dataIndexDifference, separators}));
            }

            return renderItem({item, index: index + dataIndexDifference, separators});
        },
        [shouldDuplicateData, renderItem, dataIndexDifference],
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

    const listRef = useRef<RNFlatList | null>(null);
    useImperativeHandle(ref, () => {
        // If we're trying to scroll at the start of the list we need to make sure to
        // render all items.
        const scrollToOffsetFn: RNFlatList['scrollToOffset'] = (params) => {
            if (params.offset === 0) {
                setCurrentDataId(null);
            }
            requestAnimationFrame(() => {
                listRef.current?.scrollToOffset(params);
            });
        };

        const scrollToEndFn: RNFlatList['scrollToEnd'] = (params) => {
            const scrollViewRef = listRef.current?.getNativeScrollRef();
            // Try to scroll on underlying scrollView if available, fallback to usual listRef
            if (scrollViewRef && 'scrollToEnd' in scrollViewRef) {
                (scrollViewRef as ScrollView).scrollToEnd({animated: !!params?.animated});
                return;
            }
            listRef.current?.scrollToEnd(params);
        };

        return new Proxy(
            {},
            {
                get: (_target, prop) => {
                    if (prop === 'scrollToOffset') {
                        return scrollToOffsetFn;
                    }
                    if (prop === 'scrollToEnd') {
                        return scrollToEndFn;
                    }
                    return listRef.current?.[prop as keyof RNFlatList];
                },
            },
        ) as RNFlatList;
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

export {AUTOSCROLL_TO_TOP_THRESHOLD};
