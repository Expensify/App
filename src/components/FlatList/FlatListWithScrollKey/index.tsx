import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {FlatListProps, ListRenderItem, FlatList as RNFlatList} from 'react-native';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';
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
    const {shouldEnableAutoScrollToTopThreshold, initialScrollKey, data, onStartReached, renderItem, keyExtractor, ListHeaderComponent, contentContainerStyle, ...rest} = props;
    const {displayedData, maintainVisibleContentPosition, handleStartReached, isInitialData, handleRenderItem, listRef} = useFlatListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        inverted: false,
        onStartReached,
        shouldEnableAutoScrollToTopThreshold,
        renderItem,
        ref,
    });

    return (
        <FlatList
            ref={listRef}
            data={displayedData}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onStartReached={handleStartReached}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
            // Since ListHeaderComponent is always prioritized for rendering before the data,
            // it will be rendered once the data has finished loading.
            // This prevents an unnecessary empty space above the highlighted item.
            ListHeaderComponent={!isInitialData ? ListHeaderComponent : undefined}
            contentContainerStyle={!isInitialData ? contentContainerStyle : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

FlatListWithScrollKey.displayName = 'FlatListWithScrollKey';

export default forwardRef(FlatListWithScrollKey);
