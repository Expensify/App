import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useMemo, useState} from 'react';
import type {FlatListProps, ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList, ScrollViewProps} from 'react-native';
import FlatList from '@components/FlatList';
import usePrevious from '@hooks/usePrevious';
import getInitialPaginationSize from './getInitialPaginationSize';

type BaseInvertedFlatListProps<T> = Omit<FlatListProps<T>, 'data' | 'renderItem'> & {
    shouldEnableAutoScrollToTopThreshold?: boolean;
    data: T[];
    renderItem: ListRenderItem<T>;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

function BaseInvertedFlatList<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<RNFlatList>) {
    const {shouldEnableAutoScrollToTopThreshold, initialScrollIndex, data, onStartReached, renderItem, ...rest} = props;

    // `initialScrollIndex` doesn't work properly with FlatList, this uses an alternative approach to achieve the same effect.
    // What we do is start rendering the list from `initialScrollIndex` and then whenever we reach the start we render more
    // previous items, until everything is rendered.
    const [currentDataIndex, setCurrentDataIndex] = useState(initialScrollIndex ?? 0);
    const displayedData = useMemo(() => {
        if (currentDataIndex > 0) {
            return data.slice(currentDataIndex);
        }
        return data;
    }, [data, currentDataIndex]);
    const isLoadingData = data.length > displayedData.length;
    const wasLoadingData = usePrevious(isLoadingData);
    const dataIndexDifference = data.length - displayedData.length;

    const handleStartReached = useCallback(
        (info: {distanceFromStart: number}) => {
            if (isLoadingData) {
                setCurrentDataIndex((prevIndex) => prevIndex - getInitialPaginationSize);
            } else {
                onStartReached?.(info);
            }
        },
        [onStartReached, isLoadingData],
    );

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
            minIndexForVisible: 1,
        };

        if (shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }

        return config;
    }, [shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData]);

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={ref}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
            data={displayedData}
            onStartReached={handleStartReached}
            renderItem={handleRenderItem}
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default forwardRef(BaseInvertedFlatList);

export {AUTOSCROLL_TO_TOP_THRESHOLD};

export type {BaseInvertedFlatListProps};
