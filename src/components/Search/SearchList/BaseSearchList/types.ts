import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import type {SearchColumnType} from '@components/Search/types';
import type {ExtendedTargetedEvent, SearchListItem} from '@components/SelectionList/types';

type BaseSearchListProps = Pick<
    FlashListProps<SearchListItem>,
    | 'onScroll'
    | 'contentContainerStyle'
    | 'onEndReached'
    | 'onEndReachedThreshold'
    | 'ListFooterComponent'
    | 'onViewableItemsChanged'
    | 'keyExtractor'
    | 'showsVerticalScrollIndicator'
    | 'onLayout'
> & {
    /** The data to display in the list */
    data: SearchListItem[];

    /** The function to render each item in the list */
    renderItem: (item: SearchListItem, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => React.JSX.Element;

    /** The columns that might change to trigger re-render via extraData */
    columns: SearchColumnType[];

    /** The length of the flattened items in the list */
    flattenedItemsLength: number;

    /** The callback, which is run when a row is pressed */
    onSelectRow: (item: SearchListItem) => void;

    /** Whether the screen containing the list is focused */
    isFocused?: boolean;

    /** The ref to the list */
    ref: ForwardedRef<FlashListRef<SearchListItem>>;

    /** The function to scroll to an index */
    scrollToIndex?: (index: number, animated?: boolean) => void;
};

export default BaseSearchListProps;
