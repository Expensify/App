import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useImperativeHandle, useMemo, useRef} from 'react';
import type {FlatListProps, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList, ScrollViewProps} from 'react-native';
import FlatList from '@components/FlatList';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';
import usePrevious from '@hooks/usePrevious';

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
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

function BaseInvertedFlatList<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<RNFlatList>) {
    const {shouldEnableAutoScrollToTopThreshold, initialScrollKey, data, onStartReached, renderItem, keyExtractor = defaultKeyExtractor, ...rest} = props;
    const {handleStartReached, setCurrentDataId, displayedData, isLoadingData} = useFlatListScrollKey<T>(data, keyExtractor, initialScrollKey, true, onStartReached);

    const wasLoadingData = usePrevious(isLoadingData);
    const dataIndexDifference = data.length - displayedData.length;

    const handleRenderItem = useCallback(
        ({item, index, separators}: ListRenderItemInfo<T>) => {
            // Adjust the index passed here so it matches the original data.
            return renderItem({item, index: index + dataIndexDifference, separators});
        },
        [renderItem, dataIndexDifference],
    );

    const maintainVisibleContentPosition = useMemo(() => {
        const config: ScrollViewProps['maintainVisibleContentPosition'] = {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: data.length ? Math.min(1, data.length - 1) : 0,
        };

        if (shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }

        return config;
    }, [data.length, shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData]);

    const listRef = useRef<RNFlatList | null>(null);
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

        return new Proxy(
            {},
            {
                get: (_target, prop) => {
                    if (prop === 'scrollToOffset') {
                        return scrollToOffsetFn;
                    }
                    return listRef.current?.[prop as keyof RNFlatList];
                },
            },
        ) as RNFlatList;
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

export default forwardRef(BaseInvertedFlatList);

export {AUTOSCROLL_TO_TOP_THRESHOLD};

export type {BaseInvertedFlatListProps};
