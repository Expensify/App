import type {ForwardedRef} from 'react';
import type {FlatListProps, ListRenderItem, FlatList as RNFlatList} from 'react-native';

type BaseFlatListWithScrollKeyProps<T> = Omit<FlatListProps<T>, 'data' | 'initialScrollIndex' | 'onContentSizeChange'> & {
    data: T[];
    initialScrollKey?: string | null | undefined;
    keyExtractor: (item: T, index: number) => string;
    shouldEnableAutoScrollToTopThreshold?: boolean;
    renderItem: ListRenderItem<T>;
    onContentSizeChange?: (contentWidth: number, contentHeight: number, isInitialData?: boolean) => void;
    ref: ForwardedRef<RNFlatList>;
};

type FlatListWithScrollKeyProps<T> = Omit<BaseFlatListWithScrollKeyProps<T>, 'onContentSizeChange'> & Pick<FlatListProps<T>, 'onContentSizeChange'>;

export type {FlatListWithScrollKeyProps, BaseFlatListWithScrollKeyProps};
