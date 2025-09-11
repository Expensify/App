import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useState} from 'react';
import type {FlatListProps, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList} from 'react-native';
import FlatList from '@components/FlatList';
import useFlatListHandle from '@components/FlatList/useFlatListHandle';
import type {FlatListInnerRefType} from '@components/FlatList/useFlatListHandle';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';
import useWithFallbackRef from '@hooks/useWithFallbackRef';
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
        onScrollToIndexFailed,
        initialNumToRender = CONST.PAGINATION_SIZE,
        ...rest
    } = props;

    const listRef = useWithFallbackRef<FlatListInnerRefType<T>, RNFlatList>(ref);

    const [isInitialContentRendered, setIsInitialContentRendered] = useState(false);

    const {displayedData, maintainVisibleContentPosition, handleStartReached, setCurrentDataId, remainingItemsToDisplay} = useFlatListScrollKey<T>({
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
            return renderItem({item, index: index + remainingItemsToDisplay, separators});
        },
        [renderItem, remainingItemsToDisplay],
    );

    useFlatListHandle<T>({
        forwardedRef: ref,
        listRef,
        remainingItemsToDisplay,
        setCurrentDataId,
        onScrollToIndexFailed,
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
