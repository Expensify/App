import React, {useCallback, useRef} from 'react';
import type {LayoutChangeEvent, FlatList as RNFlatList} from 'react-native';
import mergeRefs from '@libs/mergeRefs';
import BaseFlatListWithScrollKey from './BaseFlatListWithScrollKey';
import type {FlatListWithScrollKeyProps} from './types';

/**
 * FlatList component that handles initial scroll key.
 */
function FlatListWithScrollKey<T>({ref, ...props}: FlatListWithScrollKeyProps<T>) {
    const {initialScrollKey, onLayout, onContentSizeChange, ...rest} = props;

    const flatListHeight = useRef(0);
    const shouldScrollToEndRef = useRef(false);
    const listRef = useRef<RNFlatList>(null);

    const onLayoutInner = useCallback(
        (event: LayoutChangeEvent) => {
            onLayout?.(event);

            flatListHeight.current = event.nativeEvent.layout.height;
        },
        [onLayout],
    );

    const onContentSizeChangeInner = useCallback(
        (w: number, h: number, isInitialData?: boolean) => {
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
        [onContentSizeChange, initialScrollKey],
    );

    return (
        <BaseFlatListWithScrollKey
            ref={mergeRefs(ref, listRef)}
            initialScrollKey={initialScrollKey}
            onLayout={onLayoutInner}
            onContentSizeChange={onContentSizeChangeInner}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default FlatListWithScrollKey;
