import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import ReportListItem from '@components/SelectionList/Search/ReportListItem';
import TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes, SearchTypeToItemMap} from '@src/types/onyx/SearchResults';
import * as UserUtils from './UserUtils';

function isSearchDataType(type: string): type is SearchDataTypes {
    const searchDataTypes: string[] = Object.values(CONST.SEARCH_DATA_TYPES);
    return searchDataTypes.includes(type);
}

function getSearchType(search: OnyxTypes.SearchResults['search']): SearchDataTypes | undefined {
    if (!isSearchDataType(search.type)) {
        return undefined;
    }

    // @TODO: It's a temporary setting for testing purposes. Uncomment to display ReportListItem.
    // return 'report';
    return search.type;
}

function getShouldShowMerchant(data: OnyxTypes.SearchResults['data']): boolean {
    return Object.values(data).some((item) => {
        const merchant = item.modifiedMerchant ? item.modifiedMerchant : item.merchant ?? '';
        return merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT;
    });
}

function getShouldShowColumn(data: OnyxTypes.SearchResults['data'], columnName: ValueOf<typeof CONST.SEARCH_TABLE_COLUMNS>) {
    return Object.values(data).some((item) => !!item[columnName]);
}

function getTransactionsSections(data: OnyxTypes.SearchResults['data']): TransactionListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    const shouldShowCategory = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.CATEGORY);
    const shouldShowTag = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAG);
    const shouldShowTax = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT);
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
                shouldShowTax,
                keyForList: value.transactionID,
            };
        })
        .sort((a, b) => {
            const createdA = a.modifiedCreated ? a.modifiedCreated : a.created;
            const createdB = b.modifiedCreated ? b.modifiedCreated : b.created;
            return createdB > createdA ? 1 : -1;
        });
}

function getReportSections(data: OnyxTypes.SearchResults['data']): ReportListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    const shouldShowCategory = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.CATEGORY);
    const shouldShowTag = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAG);
    const shouldShowTax = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT);

    const reportIDToTransactions: Record<string, ReportListItemType> = {};
    for (const key in data) {
        if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
            const value = {...data[key]};
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${value.reportID}`;
            reportIDToTransactions[reportKey] = {
                ...value,
                transactions: reportIDToTransactions[reportKey]?.transactions ?? [],
            };
        } else if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const value = {...data[key]};
            const isExpenseReport = value.reportType === CONST.REPORT.TYPE.EXPENSE;
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${value.reportID}`;
            const transaction = {
                ...value,
                from: data.personalDetailsList?.[value.accountID],
                to: isExpenseReport ? data[`${ONYXKEYS.COLLECTION.POLICY}${value.policyID}`] : data.personalDetailsList?.[value.managerID],
                shouldShowMerchant,
                shouldShowCategory,
                shouldShowTag,
                shouldShowTax,
                keyForList: value.transactionID,
            };
            if (reportIDToTransactions[reportKey]?.transactions) {
                reportIDToTransactions[reportKey].transactions.push(transaction);
            } else {
                reportIDToTransactions[reportKey] = {transactions: [transaction]};
            }
        }
    }

    return Object.values(reportIDToTransactions);
}

const searchTypeToItemMap: SearchTypeToItemMap = {
    [CONST.SEARCH_DATA_TYPES.TRANSACTION]: {
        listItem: TransactionListItem,
        getSections: getTransactionsSections,
    },
    [CONST.SEARCH_DATA_TYPES.REPORT]: {
        listItem: ReportListItem,
        getSections: getReportSections,
    },
};

function getListItem<K extends keyof SearchTypeToItemMap>(type: K): SearchTypeToItemMap[K]['listItem'] {
    return searchTypeToItemMap[type].listItem;
}

function getSections<K extends keyof SearchTypeToItemMap>(data: OnyxTypes.SearchResults['data'], type: K): ReturnType<SearchTypeToItemMap[K]['getSections']> {
    return searchTypeToItemMap[type].getSections(data) as ReturnType<SearchTypeToItemMap[K]['getSections']>;
}

function getQueryHash(query: string, policyID?: string): number {
    const textToHash = [query, policyID].filter(Boolean).join('_');
    return UserUtils.hashText(textToHash, 2 ** 32);
}

export {getListItem, getQueryHash, getSearchType, getSections, getShouldShowColumn, getShouldShowMerchant};
