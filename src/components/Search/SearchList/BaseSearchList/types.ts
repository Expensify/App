import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import type {SearchFlashListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SelectedTransactions} from '@components/Search/types';
import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';
import type {CardList, Policy, Transaction} from '@src/types/onyx';

type BaseSearchListProps = Pick<
    FlashListProps<SearchFlashListItem>,
    | 'onScroll'
    | 'contentContainerStyle'
    | 'onEndReached'
    | 'onEndReachedThreshold'
    | 'ListFooterComponent'
    | 'onViewableItemsChanged'
    | 'keyExtractor'
    | 'showsVerticalScrollIndicator'
    | 'onLayout'
    | 'stickyHeaderIndices'
    | 'getItemType'
> & {
    /** The data to display in the list */
    data: SearchFlashListItem[];

    /** The function to render each item in the list */
    renderItem: (item: SearchFlashListItem, index: number, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => React.JSX.Element | null;

    /** The columns that might change to trigger re-render via extraData */
    columns: SearchColumnType[];

    /** The transactions that might trigger re-render via extraData */
    newTransactions: Transaction[];

    /** The length of the flattened items in the list */
    flattenedItemsLength: number;

    /** The callback, which is run when a row is pressed */
    onSelectRow: (item: SearchFlashListItem) => void;

    /** The ref to the list */
    ref: ForwardedRef<FlashListRef<SearchFlashListItem>>;

    /** The function to scroll to an index */
    scrollToIndex?: (index: number, animated?: boolean) => void;

    /** Selected transactions for triggering re-render via extraData */
    selectedTransactions?: SelectedTransactions;

    /** Policy for moving expenses for triggering re-render via extraData */
    policyForMovingExpenses?: Policy;

    /** Non-personal and workspace cards for triggering re-render via extraData */
    nonPersonalAndWorkspaceCards?: CardList;
};

export default BaseSearchListProps;
