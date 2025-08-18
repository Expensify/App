import type {FlashList, FlashListProps} from '@shopify/flash-list';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
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
> & {
    data: SearchListItem[];

    renderItem: (item: SearchListItem, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => React.JSX.Element;

    flattenedItemsLength: number;

    onSelectRow: (item: SearchListItem) => void;

    /** Invoked on mount and layout changes */
    onLayout?: () => void;

    /** Styles to apply to the content container */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** The estimated height of an item in the list */
    estimatedItemSize?: number;

    calculatedListHeight: number;

    isFocused?: boolean;

    ref: ForwardedRef<FlashList<SearchListItem>>;

    scrollToIndex?: (index: number, animated?: boolean) => void;
};

export default BaseSearchListProps;
