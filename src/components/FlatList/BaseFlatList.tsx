import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback} from 'react';
import type {FlatListProps, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList} from 'react-native';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';
import FlatList from '.';

type BaseFlatListProps<T> = Omit<FlatListProps<T>, 'data' | 'initialScrollIndex'> & {
    data: T[];
    initialScrollKey?: string | null | undefined;
    keyExtractor: (item: T, index: number) => string;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    renderItem: ListRenderItem<T>;
};

function BaseFlatList<T>(props: BaseFlatListProps<T>, ref: ForwardedRef<RNFlatList>) {
    const {shouldEnableAutoScrollToTopThreshold, initialScrollKey, data, onStartReached, renderItem, keyExtractor, ListHeaderComponent, ...rest} = props;
    const {displayedData, maintainVisibleContentPosition, handleStartReached, isInitialData} = useFlatListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        inverted: false,
        onStartReached,
        shouldEnableAutoScrollToTopThreshold,
    });
    const dataIndexDifference = data.length - displayedData.length;

    const handleRenderItem = useCallback(
        ({item, index, separators}: ListRenderItemInfo<T>) => {
            // Adjust the index passed here so it matches the original data.
            return renderItem({item, index: index + dataIndexDifference, separators});
        },
        [renderItem, dataIndexDifference],
    );

    return (
        <FlatList
            ref={ref}
            data={displayedData}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onStartReached={handleStartReached}
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

BaseFlatList.displayName = 'BaseFlatList';

export default forwardRef(BaseFlatList);
