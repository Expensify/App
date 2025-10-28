import type {ForwardedRef} from 'react';
import React from 'react';
import type {FlatListProps, ListRenderItem, FlatList as RNFlatList} from 'react-native';
import FlatList from '@components/FlatList';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';

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
    ref?: ForwardedRef<RNFlatList>;
    shouldDisableVisibleContentPosition?: boolean;
};

function BaseInvertedFlatList<T>({ref, ...props}: BaseInvertedFlatListProps<T>) {
    const {shouldEnableAutoScrollToTopThreshold, initialScrollKey, data, onStartReached, renderItem, keyExtractor = defaultKeyExtractor, ...rest} = props;
    const {displayedData, maintainVisibleContentPosition, handleStartReached, handleRenderItem, listRef} = useFlatListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        inverted: true,
        onStartReached,
        shouldEnableAutoScrollToTopThreshold,
        renderItem,
        ref,
    });

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={listRef}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
            data={displayedData}
            onStartReached={handleStartReached}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default BaseInvertedFlatList;

export type {BaseInvertedFlatListProps};
