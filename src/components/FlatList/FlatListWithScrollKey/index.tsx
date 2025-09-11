import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useState} from 'react';
import type {FlatListProps, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList} from 'react-native';
import useFlatListHandle from '@components/FlatList/useFlatListHandle';
import type {FlatListInnerRefType} from '@components/FlatList/useFlatListHandle';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';
import useWithFallbackRef from '@hooks/useWithFallbackRef';
import CONST from '@src/CONST';
import FlatList from '..';

type FlatListWithScrollKeyProps<T> = Omit<FlatListProps<T>, 'data' | 'initialScrollIndex'> & {
    data: T[];
    initialScrollKey?: string | null | undefined;
    keyExtractor: (item: T, index: number) => string;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    renderItem: ListRenderItem<T>;
};

/**
 * FlatList component that handles initial scroll key.
 */
function FlatListWithScrollKey<T>(props: FlatListWithScrollKeyProps<T>, ref: ForwardedRef<RNFlatList>) {
    const {
        shouldEnableAutoScrollToTopThreshold,
        initialScrollKey,
        data,
        onStartReached,
        renderItem,
        keyExtractor,
        ListHeaderComponent,
        onContentSizeChange,
        onScrollToIndexFailed,
        initialNumToRender = CONST.PAGINATION_SIZE,
        ...rest
    } = props;

    const listRef = useWithFallbackRef<FlatListInnerRefType<T>, RNFlatList>(ref);

    const [isInitialContentRendered, setIsInitialContentRendered] = useState(false);

    const {displayedData, maintainVisibleContentPosition, handleStartReached, isInitialData, remainingItemsToDisplay, setCurrentDataId} = useFlatListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        inverted: false,
        listRef,
        onStartReached,
        initialNumToRender,
        isInitialContentRendered,
        shouldEnableAutoScrollToTopThreshold,
    });
    const dataIndexDifference = data.length - displayedData.length;

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

    useFlatListHandle<T>({
        forwardedRef: ref,
        listRef,
        remainingItemsToDisplay,
        setCurrentDataId,
        onScrollToIndexFailed,
    });

    return (
        <FlatList
            ref={ref}
            data={displayedData}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onStartReached={handleStartReached}
            onContentSizeChange={handleContentSizeChange}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
            // Since ListHeaderComponent is always prioritized for rendering before the data,
            // it will be rendered once the data has finished loading.
            // This prevents an unnecessary empty space above the highlighted item.
            ListHeaderComponent={!initialScrollKey || (!!initialScrollKey && !isInitialData) ? ListHeaderComponent : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

FlatListWithScrollKey.displayName = 'FlatListWithScrollKey';

export default forwardRef(FlatListWithScrollKey);
