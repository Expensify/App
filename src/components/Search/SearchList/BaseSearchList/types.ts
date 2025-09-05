import type {FlashListProps} from '@shopify/flash-list';
import type {FlashList} from '@shopify/flash-list';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import type {SearchColumnType} from '@components/Search/types';
import type {ExtendedTargetedEvent, SearchListItem} from '@components/SelectionList/types';

type BaseSearchListProps = {
    /** Scroll event handler */
    onScroll?: FlashListProps<SearchListItem>['onScroll'];
    
    /** Style for the content container */
    contentContainerStyle?: FlashListProps<SearchListItem>['contentContainerStyle'];
    
    /** Called when the list reaches the end */
    onEndReached?: FlashListProps<SearchListItem>['onEndReached'];
    
    /** Threshold for onEndReached */
    onEndReachedThreshold?: FlashListProps<SearchListItem>['onEndReachedThreshold'];
    
    /** Component to render at the bottom */
    ListFooterComponent?: FlashListProps<SearchListItem>['ListFooterComponent'];
    
    /** Viewability change callback */
    onViewableItemsChanged?: FlashListProps<SearchListItem>['onViewableItemsChanged'];
    
    /** Key extractor function */
    keyExtractor?: FlashListProps<SearchListItem>['keyExtractor'];
    
    /** Whether to show vertical scroll indicator */
    showsVerticalScrollIndicator?: FlashListProps<SearchListItem>['showsVerticalScrollIndicator'];
    
    /** Layout callback */
    onLayout?: FlashListProps<SearchListItem>['onLayout'];
    
    /** Estimated item size for performance */
    estimatedItemSize?: number;
} & {
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
    ref: ForwardedRef<FlashList<SearchListItem>>;

    /** The function to scroll to an index */
    scrollToIndex?: (index: number, animated?: boolean) => void;
};

export default BaseSearchListProps;
