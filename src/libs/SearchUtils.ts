import type React from 'react';
import ExpenseListItem from '@components/SelectionList/TemporaryExpenseListItem';
import type * as OnyxTypes from '@src/types/onyx';

const searchTypeToItemMap = {
    transaction: {
        listItem: ExpenseListItem,
    },
};

const getTransactionsSections = (data: OnyxTypes.SearchResults['data']) =>
    Object.entries(data)
        .filter(([key]) => key.startsWith('transactions_'))
        .map(([, value]) => value);

/**
 * TODO: in future make this function generic and return specific item component based on type
 * For now only 1 search item type exists in the app so this function is simplified
 */
function getListItem(type?: string): typeof ExpenseListItem {
    return searchTypeToItemMap.transaction.listItem;
}

export {getTransactionsSections, getListItem};
