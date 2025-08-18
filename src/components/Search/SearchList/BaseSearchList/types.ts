import type {FlashList, FlashListProps} from '@shopify/flash-list';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import type {ExtendedTargetedEvent, SearchListItem} from '@components/SelectionList/types';

type BaseSearchListProps = Pick<
    FlashListProps<SearchListItem>,
    | 'onScroll'
    | 'contentContainerStyle'
    | 'onEndReached'
    | 'onEndReachedThreshold'
    | 'ListFooterComponent'
    | 'onViewableItemsChanged'
    | 'estimatedItemSize'
    | 'overrideItemLayout'
    | 'estimatedListSize'
    | 'keyExtractor'
    | 'showsVerticalScrollIndicator'
    | 'removeClippedSubviews'
    | 'drawDistance'
    | 'onLayout'
> & {
    data: SearchListItem[];

    renderItem: (item: SearchListItem, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => React.JSX.Element;

    flattenedItemsLength: number;

    onSelectRow: (item: SearchListItem) => void;

    calculatedListHeight: number;

    isFocused?: boolean;

    ref: ForwardedRef<FlashList<SearchListItem>>;

    scrollToIndex?: (index: number, animated?: boolean) => void;
};

export default BaseSearchListProps;
