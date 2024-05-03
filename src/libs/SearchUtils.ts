import TransactionListItem from '@components/SelectionList/TransactionListItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';
import * as UserUtils from './UserUtils';

type SearchTypeGetters<T> = {
    listItem: T;
    getSections: SearchTransaction[];
}

type SearchTypeToItemMapType = {
    transaction: SearchTypeGetters<typeof TransactionListItem>;
};

type SearchTypes = keyof typeof searchTypeToItemMap;

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
        });
}

const searchTypeToItemMap = {
    transaction: {
        listItem: TransactionListItem,
        getSections: getTransactionsSections,
    },
};

function getListItem<T extends SearchTypes>(type: T): SearchTypeToItemMapType[T]['listItem'] {
    return searchTypeToItemMap[type].listItem;
}

function getSections<T extends SearchTypes>(data: OnyxTypes.SearchResults['data'], type: T): SearchTypeToItemMapType[T]['getSections'] {
    return searchTypeToItemMap[type].getSections(data);
}

function getQueryHash(query: string): number {
    return UserUtils.hashText(query, 2 ** 32);
}

export {getListItem, getQueryHash, getSections, getShouldShowMerchant};
export type {SearchTypes};
