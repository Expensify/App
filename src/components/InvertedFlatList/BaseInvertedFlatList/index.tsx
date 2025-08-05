import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {FlatListProps, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList, ScrollViewProps} from 'react-native';
import FlatList from '@components/FlatList';
import usePrevious from '@hooks/usePrevious';
import CONST from '@src/CONST';
import type {RenderInfo} from './RenderTaskQueue';
import RenderTaskQueue from './RenderTaskQueue';

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
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

function BaseInvertedFlatList<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<RNFlatList>) {
    const {
        shouldEnableAutoScrollToTopThreshold = false,
        initialScrollKey,
        data,
        onStartReached,
        renderItem,
        keyExtractor = defaultKeyExtractor,
        onInitiallyLoaded,
        onContentSizeChange,
        initialNumToRender = 10,
        ...rest
    } = props;
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

        const itemIndex = Math.max(0, currentDataIndex - (isInitialData ? 0 : CONST.PAGINATION_SIZE));
        const minInitialIndex = Math.max(0, data.length - initialNumToRender);
        return {
            displayedData: data.slice(Math.min(itemIndex, minInitialIndex)),
            negativeScrollIndex: Math.min(data.length, data.length - itemIndex),
        };
    }, [currentDataIndex, data, initialNumToRender, isInitialData]);
    const initialNegativeScrollIndex = useRef(negativeScrollIndex);

    const listRef = useRef<(RNFlatList & HTMLElement) | null>(null);

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
    }, [currentDataIndex, data.length, displayedData.length, didInitialContentRender, initialNumToRender, isInitialData, isMessageOnFirstPage, onInitiallyLoaded, renderQueue]);

    const isLoadingData = data.length > displayedData.length;
    const wasLoadingData = usePrevious(isLoadingData);
    const dataIndexDifference = data.length - displayedData.length;

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
            return renderItem({item, index: index + dataIndexDifference, separators});
        },
        [renderItem, dataIndexDifference],
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

        const scrollToIndexFn: RNFlatList['scrollToIndex'] = (params) => {
            const actualIndex = params.index - dataIndexDifference;
            try {
                listRef.current?.scrollToIndex({...params, index: actualIndex});
            } catch (ex) {
                // It is possible that scrolling fails since the item we are trying to scroll to
                // has not been rendered yet. In this case, we call the onScrollToIndexFailed.
                props.onScrollToIndexFailed?.({
                    index: actualIndex,
                    // These metrics are not implemented.
                    averageItemLength: 0,
                    highestMeasuredFrameIndex: 0,
                });
            }
        };

        return new Proxy(
            {},
            {
                get: (_target, prop) => {
                    if (prop === 'scrollToOffset') {
                        return scrollToOffsetFn;
                    }
                    if (prop === 'scrollToIndex') {
                        return scrollToIndexFn;
                    }
                    return listRef.current?.[prop as keyof RNFlatList];
                },
            },
        ) as RNFlatList;
    });

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

export default forwardRef(BaseInvertedFlatList);

export {AUTOSCROLL_TO_TOP_THRESHOLD};

export type {BaseInvertedFlatListProps};
