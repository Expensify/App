import {useImperativeHandle} from 'react';
import type {ForwardedRef} from 'react';
import type {FlatList as RNFlatList} from 'react-native';

type FlatListInnerRefType<T> = RNFlatList<T> & HTMLElement;

type UseFlatListHandleProps<T> = {
    forwardedRef: ForwardedRef<RNFlatList> | undefined;
    listRef: React.RefObject<FlatListInnerRefType<T>>;
    setCurrentDataId: (dataId: string | null) => void;
    remainingItemsToDisplay: number;
    onScrollToIndexFailed?: (params: {index: number; averageItemLength: number; highestMeasuredFrameIndex: number}) => void;
};

export default function useFlatListHandle<T>({forwardedRef, listRef, setCurrentDataId, remainingItemsToDisplay, onScrollToIndexFailed}: UseFlatListHandleProps<T>) {
    useImperativeHandle(forwardedRef, () => {
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
                    if (prop === 'scrollToIndex') {
                        return scrollToIndexFn;
                    }
                    return listRef.current?.[prop as keyof RNFlatList];
                },
            },
        ) as RNFlatList;
    });
}

export type {FlatListInnerRefType};
