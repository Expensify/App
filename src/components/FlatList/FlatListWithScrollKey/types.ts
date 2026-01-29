import type {ForwardedRef} from 'react';
import type {ListRenderItem, FlatList as RNFlatList} from 'react-native';
import type {CustomFlatListProps} from '@components/FlatList/types';

type BaseFlatListWithScrollKeyProps<T> = Omit<CustomFlatListProps<T>, 'data' | 'initialScrollIndex' | 'onContentSizeChange'> & {
    data: T[];
    initialScrollKey?: string | null | undefined;
    keyExtractor: (item: T, index: number) => string;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    renderItem: ListRenderItem<T>;
    onContentSizeChange?: (contentWidth: number, contentHeight: number, isInitialData?: boolean) => void;
    ref: ForwardedRef<RNFlatList>;
};

type FlatListWithScrollKeyProps<T> = Omit<BaseFlatListWithScrollKeyProps<T>, 'onContentSizeChange'> & Pick<CustomFlatListProps<T>, 'onContentSizeChange'>;

export type {FlatListWithScrollKeyProps, BaseFlatListWithScrollKeyProps};
