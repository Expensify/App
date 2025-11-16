import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useRef} from 'react';
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
    const {
        shouldEnableAutoScrollToTopThreshold,
        initialScrollKey,
        data,
        onStartReached,
        renderItem,
        keyExtractor,
        ListHeaderComponent,
        contentContainerStyle,
        onViewableItemsChanged,
        ...rest
    } = props;
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

    const isLoadingData = useRef(true);
    const isInitialDataRef = useRef(isInitialData);
    useEffect(() => {
        isInitialDataRef.current = isInitialData;

        if (!isLoadingData.current || data.length > displayedData.length) {
            return;
        }

        isLoadingData.current = false;
    }, [data.length, displayedData.length, isInitialData]);

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
            onViewableItemsChanged={(info) => {
                onViewableItemsChanged?.(info);

                if (info.viewableItems.length <= 0 || info.viewableItems.at(0)?.index !== 0 || isInitialDataRef.current || !isLoadingData.current) {
                    return;
                }
                handleStartReached({distanceFromStart: 0});
            }}
        />
    );
}

FlatListWithScrollKey.displayName = 'FlatListWithScrollKey';

export default forwardRef(FlatListWithScrollKey);
