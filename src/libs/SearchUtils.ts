import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import TransactionListItem from '@components/SelectionList/TransactionListItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';
import * as UserUtils from './UserUtils';

function getShouldShowMerchant(data: OnyxTypes.SearchResults['data']): boolean {
    return Object.values(data).some((item) => {
        const merchant = item.modifiedMerchant ? item.modifiedMerchant : item.merchant ?? '';
        return merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT;
    });
}

function getShouldShowColumn(data: OnyxTypes.SearchResults['data'], columnName: ValueOf<typeof CONST.SEARCH_TABLE_COLUMNS>) {
    return Object.values(data).some((item) => !!item[columnName]);
}

function getTransactionsSections(data: OnyxTypes.SearchResults['data']): SearchTransaction[] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    const shouldShowCategory = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.CATEGORY);
    const shouldShowTag = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAG);
    return Object.entries(data)
        .filter(([key]) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))
        .map(([, value]) => {
            const isExpenseReport = value.reportType === CONST.REPORT.TYPE.EXPENSE;
            return {
                ...value,
                from: data.personalDetailsList?.[value.accountID],
                to: isExpenseReport ? data[`${ONYXKEYS.COLLECTION.POLICY}${value.policyID}`] : data.personalDetailsList?.[value.managerID],
                shouldShowMerchant,
                shouldShowCategory,
                shouldShowTag,
                keyForList: value.transactionID,
            };
        })
        .sort((a, b) => {
            const createdA = a.modifiedCreated ? a.modifiedCreated : a.created;
            const createdB = b.modifiedCreated ? b.modifiedCreated : b.created;
            return createdB > createdA ? 1 : -1;
        });
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

export {getListItem, getQueryHash, getSections, getShouldShowMerchant, getShouldShowColumn};
