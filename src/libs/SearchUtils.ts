import TransactionListItem from '@components/SelectionList/TemporaryTransactionListItem';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';
import * as UserUtils from './UserUtils';

function getTransactionsSections(data: OnyxTypes.SearchResults['data']): SearchTransaction[] {
    return Object.entries(data)
        .filter(([key]) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))
        .map(([, value]) => value);
}

const searchTypeToItemMap = {
    transaction: {
        listItem: TransactionListItem,
        getSections: getTransactionsSections,
    },
};

/**
 * TODO: in future make this function generic and return specific item component based on type
 * For now only 1 search item type exists in the app so this function is simplified
 */
function getListItem(): typeof TransactionListItem {
    return searchTypeToItemMap.transaction.listItem;
}

function getSections(data: OnyxTypes.SearchResults['data']): SearchTransaction[] {
    return searchTypeToItemMap.transaction.getSections(data);
}

function getQueryHash(query: string): number {
    return UserUtils.hashText(query, 2 ** 32);
}

export {getQueryHash, getListItem, getSections};
