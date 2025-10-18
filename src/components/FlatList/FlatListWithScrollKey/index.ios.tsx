import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useRef} from 'react';
import type {FlatListProps, LayoutChangeEvent, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList} from 'react-native';
import {InteractionManager} from 'react-native';
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
        onLayout,
        onContentSizeChange,
        contentContainerStyle,
        ...rest
    } = props;
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
    const flatListRef = useRef<RNFlatList>(null);
    const flatListHeight = useRef(0);
    const shouldScrollToEndRef = useRef(false);

    const onLayoutInner = useCallback(
        (event: LayoutChangeEvent) => {
            onLayout?.(event);

            flatListHeight.current = event.nativeEvent.layout.height;
        },
        [onLayout],
    );

    const onContentSizeChangeInner = useCallback(
        (w: number, h: number) => {
            onContentSizeChange?.(w, h);

            if (!initialScrollKey) {
                return;
            }
            // Since the ListHeaderComponent is only rendered after the data has finished rendering, iOS locks the entire current viewport.
            // As a result, the viewport does not automatically scroll down to fill the gap at the bottom.
            // We will check during the initial render (isInitialData === true). If the content height is less than the layout height,
            // it means there is a gap at the bottom.
            // Then, once the render is complete (isInitialData === false), we will manually scroll to the bottom.
            if (shouldScrollToEndRef.current) {
                InteractionManager.runAfterInteractions(() => {
                    flatListRef.current?.scrollToEnd();
                });
                shouldScrollToEndRef.current = false;
            }
            if (h < flatListHeight.current && isInitialData) {
                shouldScrollToEndRef.current = true;
            }
        },
        [onContentSizeChange, isInitialData, initialScrollKey],
    );

    return (
        <FlatList
            ref={(el) => {
                flatListRef.current = el;
                if (typeof ref === 'function') {
                    ref(el);
                } else if (ref) {
                    // eslint-disable-next-line no-param-reassign
                    ref.current = el;
                }
            }}
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
            onLayout={onLayoutInner}
            onContentSizeChange={onContentSizeChangeInner}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

FlatListWithScrollKey.displayName = 'FlatListWithScrollKey';

export default forwardRef(FlatListWithScrollKey);
