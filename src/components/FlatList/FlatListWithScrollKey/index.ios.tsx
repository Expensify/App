import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import type {FlatListProps, LayoutChangeEvent, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList} from 'react-native';
import {InteractionManager} from 'react-native';
import type {FlatListInnerRefType} from '@components/FlatList/types';
import useFlatListHandle from '@components/FlatList/useFlatListHandle';
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
        onLayout,
        onContentSizeChange,
        onScrollToIndexFailed,
        initialNumToRender = CONST.PAGINATION_SIZE,
        ...rest
    } = props;

    const listRef = useWithFallbackRef<FlatListInnerRefType<T>, RNFlatList>(ref);

    const {
        displayedData,
        maintainVisibleContentPosition: maintainVisibleContentPositionProp,
        handleStartReached,
        isInitialData,
        remainingItemsToDisplay,
        setCurrentDataId,
    } = useFlatListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        listRef,
        initialNumToRender,
        isInitialContentRendered: true,
        inverted: false,
        onStartReached,
        shouldEnableAutoScrollToTopThreshold,
    });

    const handleRenderItem = useCallback(
        ({item, index, separators}: ListRenderItemInfo<T>) => {
            // Adjust the index passed here so it matches the original data.
            return renderItem({item, index: index + remainingItemsToDisplay, separators});
        },
        [renderItem, remainingItemsToDisplay],
    );
    const [maintainVisibleContentPosition, setMaintainVisibleContentPosition] = useState<typeof maintainVisibleContentPositionProp | undefined>(maintainVisibleContentPositionProp);
    const flatListRef = useRef<RNFlatList>(null);
    const flatListHeight = useRef(0);
    const shouldScrollToEndRef = useRef(false);

    useEffect(() => {
        if (isInitialData || initialScrollKey) {
            return;
        }
        // On iOS, after the initial render is complete, if the ListHeaderComponent's height decreases shortly afterward,
        // the maintainVisibleContentPosition mechanism on iOS keeps the viewport fixed and does not automatically scroll to fill the empty space above.
        // Therefore, once rendering is complete and the highlighted item is kept in the viewport, we disable maintainVisibleContentPosition.
        InteractionManager.runAfterInteractions(() => {
            setMaintainVisibleContentPosition(undefined);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isInitialData]);

    const handleLayout = useCallback(
        (event: LayoutChangeEvent) => {
            onLayout?.(event);

            flatListHeight.current = event.nativeEvent.layout.height;
        },
        [onLayout],
    );

    const handleContentSizeChange = useCallback(
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

    useFlatListHandle<T>({
        forwardedRef: ref,
        listRef,
        remainingItemsToDisplay,
        setCurrentDataId,
        onScrollToIndexFailed,
    });

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
            ListHeaderComponent={!initialScrollKey || (!!initialScrollKey && !isInitialData) ? ListHeaderComponent : undefined}
            onLayout={handleLayout}
            onContentSizeChange={handleContentSizeChange}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

FlatListWithScrollKey.displayName = 'FlatListWithScrollKey';

export default forwardRef(FlatListWithScrollKey);
