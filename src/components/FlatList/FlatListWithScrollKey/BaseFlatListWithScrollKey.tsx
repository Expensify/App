import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useRef} from 'react';
import type {FlatList as RNFlatList} from 'react-native';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';
import FlatList from '..';
import type {BaseFlatListWithScrollKeyProps} from './types';

/**
 * FlatList component that handles initial scroll key.
 */
function BaseFlatListWithScrollKey<T>(props: BaseFlatListWithScrollKeyProps<T>, ref: ForwardedRef<RNFlatList>) {
    const {
        shouldEnableAutoScrollToTopThreshold,
        initialScrollKey,
        data,
        onStartReached,
        renderItem,
        keyExtractor,
        onViewableItemsChanged,
        onContentSizeChange,
        onScrollBeginDrag,
        onWheel,
        onTouchStartCapture,
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
    // Determine whether the user has interacted with the FlatList,
    // ensuring that handleStartReached is only triggered within onViewableItemsChanged after user interaction.
    const hasUserInteractedRef = useRef(false);

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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            data={displayedData}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onStartReached={handleStartReached}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
            // Since ListHeaderComponent is always prioritized for rendering before the data,
            // it will be rendered once the data has finished loading.
            // This prevents an unnecessary empty space above the highlighted item.
            ListHeaderComponent={!isInitialData ? rest.ListHeaderComponent : undefined}
            contentContainerStyle={!isInitialData ? rest.contentContainerStyle : undefined}
            onContentSizeChange={(width, height) => onContentSizeChange?.(width, height, isInitialData)}
            onViewableItemsChanged={(info) => {
                onViewableItemsChanged?.(info);

                if (!hasUserInteractedRef.current || isInitialDataRef.current || !isLoadingData.current || info.viewableItems.length <= 0 || info.viewableItems.at(0)?.index !== 0) {
                    return;
                }
                handleStartReached({distanceFromStart: 0});
            }}
            onScrollBeginDrag={(e) => {
                onScrollBeginDrag?.(e);
                hasUserInteractedRef.current = true;
            }}
            onWheel={(e) => {
                onWheel?.(e);
                hasUserInteractedRef.current = true;
            }}
            onTouchStartCapture={(e) => {
                onTouchStartCapture?.(e);
                hasUserInteractedRef.current = true;
            }}
        />
    );
}

BaseFlatListWithScrollKey.displayName = 'BaseFlatListWithScrollKey';

export default forwardRef(BaseFlatListWithScrollKey);
