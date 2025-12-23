import {useImperativeHandle} from 'react';
import type {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {FlatList as RNFlatList, ScrollView} from 'react-native';
import type {FlatListInnerRefType} from '@components/FlatList/types';

type UseFlatListHandleProps<T> = {
    ref?: ForwardedRef<RNFlatList<T>>;
    listRef: React.RefObject<FlatListInnerRefType<T> | null>;
    setCurrentDataId: (dataId: string | null) => void;
    remainingItemsToDisplay?: number;
    onScrollToIndexFailed?: (params: {index: number; averageItemLength: number; highestMeasuredFrameIndex: number}) => void;
};

function useFlatListHandle<T>({ref, listRef, setCurrentDataId, remainingItemsToDisplay = 0, onScrollToIndexFailed}: UseFlatListHandleProps<T>) {
    useImperativeHandle(ref, () => {
        // If we're trying to scroll at the start of the list we need to make sure to
        // render all items.
        const scrollToOffsetFn: RNFlatList['scrollToOffset'] = (params) => {
            if (params.offset === 0) {
                setCurrentDataId(null);
            }
            requestAnimationFrame(() => {
                listRef.current?.scrollToOffset(params);
            });
        };

        const scrollToEndFn: RNFlatList['scrollToEnd'] = (params) => {
            const scrollViewRef = listRef.current?.getNativeScrollRef();
            // Try to scroll on underlying scrollView if available, fallback to usual listRef
            if (scrollViewRef && 'scrollToEnd' in scrollViewRef) {
                (scrollViewRef as ScrollView).scrollToEnd({animated: !!params?.animated});
                return;
            }
            listRef.current?.scrollToEnd(params);
        };

        const scrollToIndexFn: RNFlatList['scrollToIndex'] = (params) => {
            const actualIndex = params.index - remainingItemsToDisplay;
            try {
                listRef.current?.scrollToIndex({...params, index: actualIndex});
            } catch (ex) {
                // It is possible that scrolling fails since the item we are trying to scroll to
                // has not been rendered yet. In this case, we call the onScrollToIndexFailed.
                onScrollToIndexFailed?.({
                    index: actualIndex,
                    // These metrics are not implemented.
                    averageItemLength: 0,
                    highestMeasuredFrameIndex: 0,
                });
            }
        };

        return new Proxy(
            {},
            {
                get: (_target, prop) => {
                    if (prop === 'scrollToOffset') {
                        return scrollToOffsetFn;
                    }
                    if (prop === 'scrollToEnd') {
                        return scrollToEndFn;
                    }
                    if (prop === 'scrollToIndex') {
                        return scrollToIndexFn;
                    }
                    return listRef.current?.[prop as keyof RNFlatList];
                },
            },
        ) as RNFlatList;
    });
}

export default useFlatListHandle;
export type {FlatListInnerRefType};
