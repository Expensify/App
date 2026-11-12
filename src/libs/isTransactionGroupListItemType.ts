import type {TransactionGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {ListItem} from '@components/SelectionList/types';

/**
 * Type guard that checks if something is a TransactionGroupListItemType
 */
function isTransactionGroupListItemType(item: ListItem): item is TransactionGroupListItemType {
    return 'transactions' in item;
}

export default isTransactionGroupListItemType;
