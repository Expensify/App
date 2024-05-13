import TransactionListItem from '@components/SelectionList/TransactionListItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes, SearchTransaction, SearchTypeToItemMap} from '@src/types/onyx/SearchResults';
import * as UserUtils from './UserUtils';

function getSearchType(search: OnyxTypes.SearchResults['search']): SearchDataTypes | undefined {
    switch (search.type) {
        case CONST.SEARCH_DATA_TYPES.TRANSACTION:
            return CONST.SEARCH_DATA_TYPES.TRANSACTION;
        default:
            return undefined;
    }
}

function getShouldShowMerchant(data: OnyxTypes.SearchResults['data']): boolean {
    return Object.values(data).some((item) => {
        const merchant = item.modifiedMerchant ? item.modifiedMerchant : item.merchant ?? '';
        return merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT;
    });
}

function getTransactionsSections(data: OnyxTypes.SearchResults['data']): SearchTransaction[] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    return Object.entries(data)
        .filter(([key]) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))
        .map(([, value]) => {
            const isExpenseReport = value.reportType === CONST.REPORT.TYPE.EXPENSE;
            return {
                ...value,
                from: data.personalDetailsList?.[value.accountID],
                to: isExpenseReport ? data[`${ONYXKEYS.COLLECTION.POLICY}${value.policyID}`] : data.personalDetailsList?.[value.managerID],
                shouldShowMerchant,
                keyForList: value.transactionID,
            };
        })
        .sort((a, b) => {
            const createdA = a.modifiedCreated ? a.modifiedCreated : a.created;
            const createdB = b.modifiedCreated ? b.modifiedCreated : b.created;
            return createdB > createdA ? 1 : -1;
        });
}

const searchTypeToItemMap: SearchTypeToItemMap = {
    [CONST.SEARCH_DATA_TYPES.TRANSACTION]: {
        listItem: TransactionListItem,
        getSections: getTransactionsSections,
    },
};

function getListItem<K extends keyof SearchTypeToItemMap>(type: K): SearchTypeToItemMap[K]['listItem'] {
    return searchTypeToItemMap[type].listItem;
}

function getSections<K extends keyof SearchTypeToItemMap>(data: OnyxTypes.SearchResults['data'], type: K): ReturnType<SearchTypeToItemMap[K]['getSections']> {
    return searchTypeToItemMap[type].getSections(data) as ReturnType<SearchTypeToItemMap[K]['getSections']>;
}

function getQueryHash(query: string): number {
    return UserUtils.hashText(query, 2 ** 32);
}

export {getListItem, getQueryHash, getSections, getShouldShowMerchant, getSearchType};
