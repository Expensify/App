import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useImperativeHandle, useRef, useState} from 'react';
import type {FlatListProps, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList} from 'react-native';
import FlatList from '@components/FlatList';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';
import CONST from '@src/CONST';

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
        initialNumToRender = CONST.PAGINATION_SIZE,
        ...rest
    } = props;

    const listRef = useRef<(RNFlatList<T> & HTMLElement) | null>(null);
    const [isInitialContentRendered, setIsInitialContentRendered] = useState(false);

    const {displayedData, maintainVisibleContentPosition, handleStartReached, setCurrentDataId, dataIndexDifference} = useFlatListScrollKey<T>({
        initialScrollKey,
        listRef,
        data,
        keyExtractor,
        initialNumToRender,
        inverted: true,
        shouldEnableAutoScrollToTopThreshold,
        isInitialContentRendered,
        onStartReached,
        onInitiallyLoaded,
    });

    const handleContentSizeChange = useCallback(
        (contentWidth: number, contentHeight: number) => {
            onContentSizeChange?.(contentWidth, contentHeight);
            setIsInitialContentRendered(true);
        },
        [onContentSizeChange],
    );

    const handleRenderItem = useCallback(
        ({item, index, separators}: ListRenderItemInfo<T>) => {
            // Adjust the index passed here so it matches the original data.
            return renderItem({item, index: index + dataIndexDifference, separators});
        },
        [renderItem, dataIndexDifference],
    );

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

export type {BaseInvertedFlatListProps};
