import type {ForwardedRef} from 'react';
import type {ListRenderItem, FlatList as RNFlatList} from 'react-native';
import type {CustomFlatListProps} from '@components/FlatList/types';

type InvertedFlatListProps<T> = Omit<CustomFlatListProps<T>, 'data' | 'renderItem' | 'initialScrollIndex'> & {
    shouldEnableAutoScrollToTopThreshold?: boolean;
    data: T[];
    renderItem: ListRenderItem<T>;
    initialScrollKey?: string | null;
    ref?: ForwardedRef<RNFlatList>;
};

// eslint-disable-next-line import/prefer-default-export
export type {InvertedFlatListProps};
