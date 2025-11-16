import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useRef} from 'react';
import type {FlatListProps, LayoutChangeEvent, ListRenderItem, FlatList as RNFlatList} from 'react-native';
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
        onViewableItemsChanged,
        ...rest
    } = props;
    const {displayedData, maintainVisibleContentPosition, handleStartReached, isInitialData, handleRenderItem, listRef} = useFlatListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        inverted: false,
        onStartReached,
        renderItem,
        shouldEnableAutoScrollToTopThreshold,
        ref,
    });

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
                requestAnimationFrame(() => {
                    listRef.current?.scrollToEnd();
                });
                shouldScrollToEndRef.current = false;
            }
            if (h < flatListHeight.current && isInitialData) {
                shouldScrollToEndRef.current = true;
            }
        },
        [onContentSizeChange, initialScrollKey, isInitialData, listRef],
    );

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
            onLayout={onLayoutInner}
            onContentSizeChange={onContentSizeChangeInner}
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
