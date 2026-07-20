import getInitialPaginationSize from '@components/FlatList/getInitialPaginationSize';
import RenderTaskQueue from '@components/FlatList/RenderTaskQueue';
import type {FlatListInnerRefType} from '@components/FlatList/types';
import type {ScrollViewProps} from '@components/ScrollView';

import usePrevious from '@hooks/usePrevious';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import type {ForwardedRef, RefObject} from 'react';
import type {ListRenderItem, ListRenderItemInfo, FlatList as RNFlatList} from 'react-native';

import {createElement, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import useFlatListHandle from './useFlatListHandle';

type FlatListScrollKeyProps = {
    ref?: ForwardedRef<RNFlatList<unknown>>;
    data: unknown[];
    keyExtractor: (item: unknown, index: number) => string;
    initialScrollKey: string | null | undefined;
    inverted: boolean;
    onStartReached?: ((info: {distanceFromStart: number}) => void) | null;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    renderItem: ListRenderItem<unknown>;
    remainingItemsToDisplay?: number;
    onScrollToIndexFailed?: (params: {index: number; averageItemLength: number; highestMeasuredFrameIndex: number}) => void;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useFlatListScrollKeyImpl({
    data,
    keyExtractor,
    initialScrollKey,
    onStartReached,
    inverted,
    shouldEnableAutoScrollToTopThreshold,
    renderItem,
    ref,
    remainingItemsToDisplay,
    onScrollToIndexFailed,
}: FlatListScrollKeyProps) {
    const [currentDataId, setCurrentDataId] = useState(() => {
        if (initialScrollKey) {
            return initialScrollKey;
        }
        return null;
    });
    const currentDataIndex = currentDataId === null ? -1 : data.findIndex((item, index) => keyExtractor(item, index) === currentDataId);
    const [isInitialData, setIsInitialData] = useState(currentDataIndex >= 0);
    const [isQueueRendering, setIsQueueRendering] = useState(false);

    const shouldDuplicateData = !inverted && data.length === 1 && isInitialData && getPlatform() === CONST.PLATFORM.WEB;

    const displayedData = (() => {
        if (shouldDuplicateData) {
            return [{...(data.at(0) as Record<string, unknown>), reportActionID: '0'}, ...data];
        }
        if (currentDataIndex <= 0) {
            return data;
        }
        const offset = !inverted && currentDataIndex === data.length - 1 ? 1 : 0;
        return data.slice(Math.max(0, currentDataIndex - (isInitialData ? offset : getInitialPaginationSize)));
    })();

    const isLoadingData = data.length > displayedData.length;
    const wasLoadingData = usePrevious(isLoadingData);
    const dataIndexDifference = data.length - displayedData.length;

    const renderQueue = useMemo(() => new RenderTaskQueue(setIsQueueRendering), []);

    useEffect(() => {
        return () => {
            renderQueue.cancel();
        };
    }, [renderQueue]);

    renderQueue.setHandler((info) => {
        if (!isLoadingData) {
            onStartReached?.(info);
        }
        setIsInitialData(false);
        const firstDisplayedItem = displayedData.at(0);
        setCurrentDataId(firstDisplayedItem ? keyExtractor(firstDisplayedItem, Math.max(0, currentDataIndex)) : null);
    });

    const handleStartReached = (info: {distanceFromStart: number}) => {
        renderQueue.add(info);
    };

    useEffect(() => {
        if (inverted || data.length > 0) {
            return;
        }
        handleStartReached({distanceFromStart: 0});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [shouldPreserveVisibleContentPosition, setShouldPreserveVisibleContentPosition] = useState(true);
    const maintainVisibleContentPosition = (() => {
        if ((!initialScrollKey && (!isInitialData || !isQueueRendering)) || !shouldPreserveVisibleContentPosition) {
            return undefined;
        }

        const config: ScrollViewProps['maintainVisibleContentPosition'] = {
            minIndexForVisible: data.length ? Math.min(1, data.length - 1) : 0,
        };

        if (shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }

        return config;
    })();

    const handleRenderItem = ({item, index, separators}: ListRenderItemInfo<unknown>) => {
        if (shouldDuplicateData && index === 1) {
            return createElement(View, {style: {opacity: 0}}, renderItem({item, index: index + dataIndexDifference, separators}));
        }

        return renderItem({item, index: index + dataIndexDifference, separators});
    };

    useEffect(() => {
        if (inverted || isInitialData || isQueueRendering) {
            return;
        }

        requestAnimationFrame(() => {
            setShouldPreserveVisibleContentPosition(false);
        });
    }, [inverted, isInitialData, isQueueRendering]);

    const listRef = useRef<FlatListInnerRefType<unknown> | null>(null);
    useFlatListHandle({
        ref,
        listRef,
        remainingItemsToDisplay,
        setCurrentDataId,
        onScrollToIndexFailed,
    });

    return {
        handleStartReached,
        setCurrentDataId,
        displayedData,
        maintainVisibleContentPosition,
        isInitialData,
        handleRenderItem,
        listRef,
    };
}

type FlatListScrollKeyPropsGeneric<T> = {
    ref?: ForwardedRef<RNFlatList<T>>;
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    initialScrollKey: string | null | undefined;
    inverted: boolean;
    onStartReached?: ((info: {distanceFromStart: number}) => void) | null;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    renderItem: ListRenderItem<T>;
    remainingItemsToDisplay?: number;
    onScrollToIndexFailed?: (params: {index: number; averageItemLength: number; highestMeasuredFrameIndex: number}) => void;
};

export default function useFlatListScrollKey<T>(props: FlatListScrollKeyPropsGeneric<T>) {
    return useFlatListScrollKeyImpl(props as FlatListScrollKeyProps) as ReturnType<typeof useFlatListScrollKeyImpl> & {
        displayedData: T[];
        handleRenderItem: ListRenderItem<T>;
        listRef: RefObject<FlatListInnerRefType<T> | null>;
    };
}

export {AUTOSCROLL_TO_TOP_THRESHOLD};
