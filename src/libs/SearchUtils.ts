import type {ValueOf} from 'type-fest';
import type {AllFieldKeys, ASTNode, QueryFilter, QueryFilters, SearchColumnType, SortOrder} from '@components/Search/types';
import ReportListItem from '@components/SelectionList/Search/ReportListItem';
import TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ListItem, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchAccountDetails, SearchDataTypes, SearchPersonalDetails, SearchTransaction, SearchTypeToItemMap, SectionsType} from '@src/types/onyx/SearchResults';
import type SearchResults from '@src/types/onyx/SearchResults';
import DateUtils from './DateUtils';
import getTopmostCentralPaneRoute from './Navigation/getTopmostCentralPaneRoute';
import navigationRef from './Navigation/navigationRef';
import type {AuthScreensParamList, RootStackParamList, State} from './Navigation/types';
import * as searchParser from './SearchParser/searchParser';
import * as TransactionUtils from './TransactionUtils';
import * as UserUtils from './UserUtils';

const columnNamesToSortingProperty = {
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'formattedTo' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: 'date' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: 'tag' as const,
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: 'formattedMerchant' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: 'formattedTotal' as const,
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: 'category' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TYPE]: 'transactionType' as const,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: 'action' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'comment' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: null,
    [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: null,
};

/**
 * @private
 */
function getTransactionItemCommonFormattedProperties(
    transactionItem: SearchTransaction,
    from: SearchPersonalDetails,
    to: SearchAccountDetails,
): Pick<TransactionListItemType, 'formattedFrom' | 'formattedTo' | 'formattedTotal' | 'formattedMerchant' | 'date'> {
    const isExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;

    const formattedFrom = from?.displayName ?? from?.login ?? '';
    const formattedTo = to?.name ?? to?.displayName ?? to?.login ?? '';
    const formattedTotal = TransactionUtils.getAmount(transactionItem, isExpenseReport);
    const date = transactionItem?.modifiedCreated ? transactionItem.modifiedCreated : transactionItem?.created;
    const merchant = TransactionUtils.getMerchant(transactionItem);
    const formattedMerchant = merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || merchant === CONST.TRANSACTION.DEFAULT_MERCHANT ? '' : merchant;

    return {
        formattedFrom,
        formattedTo,
        date,
        formattedTotal,
        formattedMerchant,
    };
}

function isSearchDataType(type: string): type is SearchDataTypes {
    const searchDataTypes: string[] = Object.values(CONST.SEARCH.DATA_TYPES);
    return searchDataTypes.includes(type);
}

function getSearchType(search: OnyxTypes.SearchResults['search']): SearchDataTypes | undefined {
    if (!isSearchDataType(search.type)) {
        return undefined;
    }

    return search.type;
}

function getShouldShowMerchant(data: OnyxTypes.SearchResults['data']): boolean {
    return Object.values(data).some((item) => {
        const merchant = item.modifiedMerchant ? item.modifiedMerchant : item.merchant ?? '';
        return merchant !== '' && merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT;
    });
}

const currentYear = new Date().getFullYear();

function isReportListItemType(item: ListItem): item is ReportListItemType {
    return 'transactions' in item;
}

function isTransactionListItemType(item: TransactionListItemType | ReportListItemType): item is TransactionListItemType {
    const transactionListItem = item as TransactionListItemType;
    return transactionListItem.transactionID !== undefined;
}

function shouldShowYear(data: TransactionListItemType[] | ReportListItemType[] | OnyxTypes.SearchResults['data']): boolean {
    if (Array.isArray(data)) {
        return data.some((item: TransactionListItemType | ReportListItemType) => {
            if (isReportListItemType(item)) {
                // If the item is a ReportListItemType, iterate over its transactions and check them
                return item.transactions.some((transaction) => {
                    const transactionYear = new Date(TransactionUtils.getCreated(transaction)).getFullYear();
                    return transactionYear !== currentYear;
                });
            }

            const createdYear = new Date(item?.modifiedCreated ? item.modifiedCreated : item?.created || '').getFullYear();
            return createdYear !== currentYear;
        });
    }

    for (const [key, transactionItem] of Object.entries(data)) {
        if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const item = transactionItem as SearchTransaction;
            const date = TransactionUtils.getCreated(item);

            if (DateUtils.doesDateBelongToAPastYear(date)) {
                return true;
            }
        }
    }
    return false;
}

function getTransactionsSections(data: OnyxTypes.SearchResults['data'], metadata: OnyxTypes.SearchResults['search']): TransactionListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);

    const doesDataContainAPastYearTransaction = shouldShowYear(data);

    return Object.entries(data)
        .filter(([key]) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))
        .map(([, transactionItem]) => {
            const isExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;
            const from = data.personalDetailsList?.[transactionItem.accountID];
            const to = isExpenseReport
                ? (data[`${ONYXKEYS.COLLECTION.POLICY}${transactionItem.policyID}`] as SearchAccountDetails)
                : (data.personalDetailsList?.[transactionItem.managerID] as SearchAccountDetails);

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(transactionItem, from, to);

            return {
                ...transactionItem,
                from,
                to,
                formattedFrom,
                formattedTo,
                formattedTotal,
                formattedMerchant,
                date,
                shouldShowMerchant,
                shouldShowCategory: metadata?.columnsToShow?.shouldShowCategoryColumn,
                shouldShowTag: metadata?.columnsToShow?.shouldShowTagColumn,
                shouldShowTax: metadata?.columnsToShow?.shouldShowTaxColumn,
                keyForList: transactionItem.transactionID,
                shouldShowYear: doesDataContainAPastYearTransaction,
            };
        });
}

function getReportSections(data: OnyxTypes.SearchResults['data'], metadata: OnyxTypes.SearchResults['search']): ReportListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);

    const doesDataContainAPastYearTransaction = shouldShowYear(data);

    const reportIDToTransactions: Record<string, ReportListItemType> = {};
    for (const key in data) {
        if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
            const reportItem = {...data[key]};
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`;
            const transactions = reportIDToTransactions[reportKey]?.transactions ?? [];
            const isExpenseReport = reportItem.type === CONST.REPORT.TYPE.EXPENSE;

            const to = isExpenseReport
                ? (data[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] as SearchAccountDetails)
                : (data.personalDetailsList?.[reportItem.managerID] as SearchAccountDetails);

            reportIDToTransactions[reportKey] = {
                ...reportItem,
                keyForList: reportItem.reportID,
                from: data.personalDetailsList?.[reportItem.accountID],
                to,
                transactions,
            };
        } else if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const transactionItem = {...data[key]};
            const isExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`;

            const from = data.personalDetailsList?.[transactionItem.accountID];
            const to = isExpenseReport
                ? (data[`${ONYXKEYS.COLLECTION.POLICY}${transactionItem.policyID}`] as SearchAccountDetails)
                : (data.personalDetailsList?.[transactionItem.managerID] as SearchAccountDetails);

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(transactionItem, from, to);

            const transaction = {
                ...transactionItem,
                from,
                to,
                formattedFrom,
                formattedTo,
                formattedTotal,
                formattedMerchant,
                date,
                shouldShowMerchant,
                shouldShowCategory: metadata?.columnsToShow?.shouldShowCategoryColumn,
                shouldShowTag: metadata?.columnsToShow?.shouldShowTagColumn,
                shouldShowTax: metadata?.columnsToShow?.shouldShowTaxColumn,
                keyForList: transactionItem.transactionID,
                shouldShowYear: doesDataContainAPastYearTransaction,
            };
            if (reportIDToTransactions[reportKey]?.transactions) {
                reportIDToTransactions[reportKey].transactions.push(transaction);
            } else {
                reportIDToTransactions[reportKey].transactions = [transaction];
            }
        }
    }

    return Object.values(reportIDToTransactions);
}

const searchTypeToItemMap: SearchTypeToItemMap = {
    [CONST.SEARCH.DATA_TYPES.TRANSACTION]: {
        listItem: TransactionListItem,
        getSections: getTransactionsSections,
        getSortedSections: getSortedTransactionData,
    },
    [CONST.SEARCH.DATA_TYPES.REPORT]: {
        listItem: ReportListItem,
        getSections: getReportSections,
        // sorting for ReportItems not yet implemented
        getSortedSections: getSortedReportData,
    },
};

function getListItem<K extends keyof SearchTypeToItemMap>(type: K): SearchTypeToItemMap[K]['listItem'] {
    return searchTypeToItemMap[type].listItem;
}

function getSections<K extends keyof SearchTypeToItemMap>(
    data: OnyxTypes.SearchResults['data'],
    metadata: OnyxTypes.SearchResults['search'],
    type: K,
): ReturnType<SearchTypeToItemMap[K]['getSections']> {
    return searchTypeToItemMap[type].getSections(data, metadata) as ReturnType<SearchTypeToItemMap[K]['getSections']>;
}

function getSortedSections<K extends keyof SearchTypeToItemMap>(
    type: K,
    data: SectionsType<K>,
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
): ReturnType<SearchTypeToItemMap[K]['getSortedSections']> {
    return searchTypeToItemMap[type].getSortedSections(data, sortBy, sortOrder) as ReturnType<SearchTypeToItemMap[K]['getSortedSections']>;
}

function getQueryHash(query: string, policyID?: string, sortBy?: string, sortOrder?: string): number {
    const textToHash = [query, policyID, sortOrder, sortBy].filter(Boolean).join('_');
    return UserUtils.hashText(textToHash, 2 ** 32);
}

function getSortedTransactionData(data: TransactionListItemType[], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    if (!sortBy || !sortOrder) {
        return data;
    }

    const sortingProperty = columnNamesToSortingProperty[sortBy];

    if (!sortingProperty) {
        return data;
    }

    return data.sort((a, b) => {
        const aValue = sortingProperty === 'comment' ? a.comment.comment : a[sortingProperty];
        const bValue = sortingProperty === 'comment' ? b.comment.comment : b[sortingProperty];

        if (aValue === undefined || bValue === undefined) {
            return 0;
        }

        // We are guaranteed that both a and b will be string or number at the same time
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === CONST.SEARCH.SORT_ORDER.ASC ? aValue.toLowerCase().localeCompare(bValue) : bValue.toLowerCase().localeCompare(aValue);
        }

        const aNum = aValue as number;
        const bNum = bValue as number;

        return sortOrder === CONST.SEARCH.SORT_ORDER.ASC ? aNum - bNum : bNum - aNum;
    });
}

function getSortedReportData(data: ReportListItemType[]) {
    return data.sort((a, b) => {
        const aValue = a?.created;
        const bValue = b?.created;

        if (aValue === undefined || bValue === undefined) {
            return 0;
        }

        return bValue.toLowerCase().localeCompare(aValue);
    });
}

function getSearchParams() {
    const topmostCentralPaneRoute = getTopmostCentralPaneRoute(navigationRef.getRootState() as State<RootStackParamList>);
    return topmostCentralPaneRoute?.params as AuthScreensParamList['Search_Central_Pane'];
}

function isSearchResultsEmpty(searchResults: SearchResults) {
    return !Object.keys(searchResults?.data).some((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION));
}

function getQueryHashFromString(query: string): number {
    return UserUtils.hashText(query, 2 ** 32);
}

type JSONQuery = {
    input: string;
    hash: number;
    type: string;
    status: string;
    sortBy: string;
    sortOrder: string;
    offset: number;
    filters: ASTNode;
};

function buildJSONQuery(query: string) {
    try {
        // Add the full input and hash to the results
        const result = searchParser.parse(query) as JSONQuery;
        result.input = query;
        result.hash = getQueryHashFromString(query);
        return result;
    } catch (e) {
        console.error(e);
    }
}

function getFilters(query: string, fields: Array<Partial<AllFieldKeys>>) {
    let jsonQuery;
    try {
        jsonQuery = searchParser.parse(query) as JSONQuery;
    } catch (e) {
        console.error(e);
        return;
    }

    const filters = {} as QueryFilters;

    fields.forEach((field) => {
        const rootFieldKey = field as ValueOf<typeof CONST.SEARCH.SYNTAX_ROOT_KEYS>;
        if (jsonQuery[rootFieldKey] === undefined) {
            return;
        }

        filters[field] = {
            operator: 'eq',
            value: jsonQuery[rootFieldKey],
        };
    });

    function traverse(node: ASTNode) {
        if (!node.operator) {
            return;
        }

        if (typeof node?.left === 'object') {
            traverse(node.left);
        }

        if (typeof node?.right === 'object') {
            traverse(node.right);
        }

        const nodeKey = node.left as ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>;
        if (!fields.includes(nodeKey)) {
            return;
        }

        if (!filters[nodeKey]) {
            filters[nodeKey] = [];
        }

        const filterArray = filters[nodeKey] as QueryFilter[];
        filterArray.push({
            operator: node.operator,
            value: node.right as string | number,
        });
    }

    if (jsonQuery.filters) {
        traverse(jsonQuery.filters);
    }

    return filters;
}

export {
    buildJSONQuery,
    getListItem,
    getQueryHash,
    getSections,
    getSortedSections,
    getShouldShowMerchant,
    getSearchType,
    getSearchParams,
    shouldShowYear,
    isReportListItemType,
    isTransactionListItemType,
    isSearchResultsEmpty,
    getFilters,
};
