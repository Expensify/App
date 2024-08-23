import type {ValueOf} from 'type-fest';
import type {ASTNode, QueryFilter, QueryFilters, SearchColumnType, SearchQueryJSON, SearchQueryString, SearchStatus, SortOrder} from '@components/Search/types';
import ReportListItem from '@components/SelectionList/Search/ReportListItem';
import TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ListItem, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type * as OnyxTypes from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import type {ListItemDataType, ListItemType, SearchDataTypes, SearchPersonalDetails, SearchReport, SearchTransaction} from '@src/types/onyx/SearchResults';
import * as CurrencyUtils from './CurrencyUtils';
import DateUtils from './DateUtils';
import {translateLocal} from './Localize';
import navigationRef from './Navigation/navigationRef';
import type {AuthScreensParamList, BottomTabNavigatorParamList, RootStackParamList, State} from './Navigation/types';
import * as searchParser from './SearchParser/searchParser';
import * as TransactionUtils from './TransactionUtils';
import * as UserUtils from './UserUtils';

type KeysOfFilterKeysObject = keyof typeof CONST.SEARCH.SYNTAX_FILTER_KEYS;

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

// This map contains signs with spaces that match each operator
const operatorToSignMap = {
    [CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO]: ':' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN]: '<' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO]: '<=' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN]: '>' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO]: '>=' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO]: '!=' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.AND]: ',' as const,
    [CONST.SEARCH.SYNTAX_OPERATORS.OR]: ' ' as const,
};

/**
 * @private
 */
function getTransactionItemCommonFormattedProperties(
    transactionItem: SearchTransaction,
    from: SearchPersonalDetails,
    to: SearchPersonalDetails,
): Pick<TransactionListItemType, 'formattedFrom' | 'formattedTo' | 'formattedTotal' | 'formattedMerchant' | 'date'> {
    const isExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;

    const formattedFrom = from?.displayName ?? from?.login ?? '';
    const formattedTo = to?.displayName ?? to?.login ?? '';
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

function getSearchType(search: OnyxTypes.SearchResults['search'] | undefined): SearchDataTypes | undefined {
    if (!search) {
        return undefined;
    }

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
            const from = data.personalDetailsList?.[transactionItem.accountID];
            const to = data.personalDetailsList?.[transactionItem.managerID];

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

function getIOUReportName(data: OnyxTypes.SearchResults['data'], reportItem: SearchReport) {
    const payerPersonalDetails = data.personalDetailsList?.[reportItem.managerID ?? 0];
    const payerName = payerPersonalDetails?.displayName ?? payerPersonalDetails?.login ?? translateLocal('common.hidden');
    const formattedAmount = CurrencyUtils.convertToDisplayString(reportItem.total ?? 0, reportItem.currency ?? CONST.CURRENCY.USD);
    if (reportItem.action === CONST.SEARCH.ACTION_TYPES.VIEW) {
        return translateLocal('iou.payerOwesAmount', {
            payer: payerName,
            amount: formattedAmount,
        });
    }

    if (reportItem.action === CONST.SEARCH.ACTION_TYPES.PAID) {
        return translateLocal('iou.payerPaidAmount', {
            payer: payerName,
            amount: formattedAmount,
        });
    }

    return reportItem.reportName;
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
            const isIOUReport = reportItem.type === CONST.REPORT.TYPE.IOU;

            reportIDToTransactions[reportKey] = {
                ...reportItem,
                keyForList: reportItem.reportID,
                from: data.personalDetailsList?.[reportItem.accountID],
                to: data.personalDetailsList?.[reportItem.managerID],
                transactions,
                reportName: isIOUReport ? getIOUReportName(data, reportItem) : reportItem.reportName,
            };
        } else if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const transactionItem = {...data[key]};
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`;

            const from = data.personalDetailsList?.[transactionItem.accountID];
            const to = data.personalDetailsList?.[transactionItem.managerID];

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
            } else if (reportIDToTransactions[reportKey]) {
                reportIDToTransactions[reportKey].transactions = [transaction];
            }
        }
    }

    return Object.values(reportIDToTransactions);
}

function getListItem(type: SearchDataTypes, status: SearchStatus): ListItemType<typeof status> {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.TRANSACTION:
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        case CONST.SEARCH.DATA_TYPES.REPORT:
        case CONST.SEARCH.DATA_TYPES.INVOICE:
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return status === CONST.SEARCH.STATUS.EXPENSE.ALL ? TransactionListItem : ReportListItem;
        default:
            return TransactionListItem;
    }
}

function getSections(type: SearchDataTypes, status: SearchStatus, data: OnyxTypes.SearchResults['data'], metadata: OnyxTypes.SearchResults['search']) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.TRANSACTION:
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        case CONST.SEARCH.DATA_TYPES.REPORT:
        case CONST.SEARCH.DATA_TYPES.INVOICE:
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return status === CONST.SEARCH.STATUS.EXPENSE.ALL ? getTransactionsSections(data, metadata) : getReportSections(data, metadata);
        default:
            return getTransactionsSections(data, metadata);
    }
}

function getSortedSections(type: SearchDataTypes, status: SearchStatus, data: ListItemDataType<typeof status>, sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.TRANSACTION:
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        case CONST.SEARCH.DATA_TYPES.REPORT:
        case CONST.SEARCH.DATA_TYPES.INVOICE:
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return status === CONST.SEARCH.STATUS.EXPENSE.ALL
                ? getSortedTransactionData(data as TransactionListItemType[], sortBy, sortOrder)
                : getSortedReportData(data as ReportListItemType[]);
        default:
            return getSortedTransactionData(data as TransactionListItemType[], sortBy, sortOrder);
    }
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
        const aValue = sortingProperty === 'comment' ? a.comment?.comment : a[sortingProperty];
        const bValue = sortingProperty === 'comment' ? b.comment?.comment : b[sortingProperty];

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

function getCurrentSearchParams() {
    const rootState = navigationRef.getRootState() as State<RootStackParamList>;

    const lastSearchCentralPaneRoute = rootState.routes.filter((route) => route.name === SCREENS.SEARCH.CENTRAL_PANE).at(-1);
    const lastSearchBottomTabRoute = rootState.routes[0].state?.routes.filter((route) => route.name === SCREENS.SEARCH.BOTTOM_TAB).at(-1);

    if (lastSearchCentralPaneRoute) {
        return lastSearchCentralPaneRoute.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
    }

    if (lastSearchBottomTabRoute) {
        const {policyID, ...rest} = lastSearchBottomTabRoute.params as BottomTabNavigatorParamList[typeof SCREENS.SEARCH.BOTTOM_TAB];
        const params: AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE] = {policyIDs: policyID, ...rest};
        return params;
    }
}

function isSearchResultsEmpty(searchResults: SearchResults) {
    return !Object.keys(searchResults?.data).some((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION));
}

function getQueryHashFromString(query: SearchQueryString): number {
    return UserUtils.hashText(query, 2 ** 32);
}

function buildSearchQueryJSON(query: SearchQueryString, policyID?: string) {
    try {
        // Add the full input and hash to the results
        const result = searchParser.parse(query) as SearchQueryJSON;
        result.inputQuery = query;

        // Temporary solution until we move policyID filter into the AST - then remove this line and keep only query
        const policyIDPart = policyID ?? '';
        result.hash = getQueryHashFromString(query + policyIDPart);
        return result;
    } catch (e) {
        console.error(e);
    }
}

function buildSearchQueryString(queryJSON?: SearchQueryJSON) {
    const queryParts: string[] = [];
    const defaultQueryJSON = buildSearchQueryJSON('');

    // For this const values are lowercase version of the keys. We are using lowercase for ast keys.
    for (const [, key] of Object.entries(CONST.SEARCH.SYNTAX_ROOT_KEYS)) {
        if (queryJSON?.[key]) {
            queryParts.push(`${key}:${queryJSON[key]}`);
        } else if (defaultQueryJSON) {
            queryParts.push(`${key}:${defaultQueryJSON[key]}`);
        }
    }

    if (!queryJSON) {
        return queryParts.join(' ');
    }

    const filters = getFilters(queryJSON);

    for (const [, filterKey] of Object.entries(CONST.SEARCH.SYNTAX_FILTER_KEYS)) {
        const queryFilter = filters[filterKey];

        if (queryFilter) {
            const filterValueString = buildFilterString(filterKey, queryFilter);
            queryParts.push(filterValueString);
        }
    }

    return queryParts.join(' ');
}

/**
 * Update string query with all the default params that are set by parser
 */
function normalizeQuery(query: string) {
    const normalizedQueryJSON = buildSearchQueryJSON(query);
    return buildSearchQueryString(normalizedQueryJSON);
}

/**
 * @private
 * returns Date filter query string part, which needs special logic
 */
function buildDateFilterQuery(filterValues: Partial<SearchAdvancedFiltersForm>) {
    const dateBefore = filterValues[FILTER_KEYS.DATE_BEFORE];
    const dateAfter = filterValues[FILTER_KEYS.DATE_AFTER];

    let dateFilter = '';
    if (dateBefore) {
        dateFilter += `${CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}<${dateBefore}`;
    }
    if (dateBefore && dateAfter) {
        dateFilter += ' ';
    }
    if (dateAfter) {
        dateFilter += `${CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}>${dateAfter}`;
    }

    return dateFilter;
}

/**
 * @private
 * returns Date filter query string part, which needs special logic
 */
function buildAmountFilterQuery(filterValues: Partial<SearchAdvancedFiltersForm>) {
    const lessThan = filterValues[FILTER_KEYS.LESS_THAN];
    const greaterThan = filterValues[FILTER_KEYS.GREATER_THAN];

    let amountFilter = '';
    if (greaterThan) {
        amountFilter += `${CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}>${greaterThan}`;
    }
    if (lessThan && greaterThan) {
        amountFilter += ' ';
    }
    if (lessThan) {
        amountFilter += `${CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}<${lessThan}`;
    }

    return amountFilter;
}

function sanitizeString(str: string) {
    if (str.includes(' ') || str.includes(',')) {
        return `"${str}"`;
    }
    return str;
}

function getExpenseTypeTranslationKey(expenseType: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>): TranslationPaths {
    // eslint-disable-next-line default-case
    switch (expenseType) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return 'common.distance';
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return 'common.card';
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
            return 'iou.cash';
    }
}

/**
 * Given object with chosen search filters builds correct query string from them
 */
function buildQueryStringFromFilters(filterValues: Partial<SearchAdvancedFiltersForm>) {
    const filtersString = Object.entries(filterValues).map(([filterKey, filterValue]) => {
        if ((filterKey === FILTER_KEYS.MERCHANT || filterKey === FILTER_KEYS.DESCRIPTION || filterKey === FILTER_KEYS.REPORT_ID || filterKey === FILTER_KEYS.KEYWORD) && filterValue) {
            const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as KeysOfFilterKeysObject[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);
            if (keyInCorrectForm) {
                return `${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${filterValue as string}`;
            }
        }

        if (
            (filterKey === FILTER_KEYS.CATEGORY ||
                filterKey === FILTER_KEYS.CARD_ID ||
                filterKey === FILTER_KEYS.TAX_RATE ||
                filterKey === FILTER_KEYS.EXPENSE_TYPE ||
                filterKey === FILTER_KEYS.TAG ||
                filterKey === FILTER_KEYS.CURRENCY ||
                filterKey === FILTER_KEYS.FROM ||
                filterKey === FILTER_KEYS.TO) &&
            Array.isArray(filterValue) &&
            filterValue.length > 0
        ) {
            const filterValueArray = filterValues[filterKey] ?? [];
            const keyInCorrectForm = (Object.keys(CONST.SEARCH.SYNTAX_FILTER_KEYS) as KeysOfFilterKeysObject[]).find((key) => CONST.SEARCH.SYNTAX_FILTER_KEYS[key] === filterKey);
            if (keyInCorrectForm) {
                return `${CONST.SEARCH.SYNTAX_FILTER_KEYS[keyInCorrectForm]}:${filterValueArray.map(sanitizeString).join(',')}`;
            }
        }

        return undefined;
    });

    const dateFilter = buildDateFilterQuery(filterValues);
    filtersString.push(dateFilter);

    const amountFilter = buildAmountFilterQuery(filterValues);
    filtersString.push(amountFilter);

    return filtersString.filter(Boolean).join(' ');
}

function getFilters(queryJSON: SearchQueryJSON) {
    const filters = {} as QueryFilters;
    const filterKeys = Object.values(CONST.SEARCH.SYNTAX_FILTER_KEYS);

    function traverse(node: ASTNode) {
        if (!node.operator) {
            return;
        }

        if (typeof node?.left === 'object' && node.left) {
            traverse(node.left);
        }

        if (typeof node?.right === 'object' && node.right) {
            traverse(node.right);
        }

        const nodeKey = node.left as ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>;
        if (!filterKeys.includes(nodeKey)) {
            return;
        }

        if (!filters[nodeKey]) {
            filters[nodeKey] = [];
        }

        // the "?? []" is added only for typescript because otherwise TS throws an error, in newer TS versions this should be fixed
        const filterArray = filters[nodeKey] ?? [];
        filterArray.push({
            operator: node.operator,
            value: node.right as string | number,
        });
    }

    if (queryJSON.filters) {
        traverse(queryJSON.filters);
    }

    return filters;
}

function buildFilterString(filterName: string, queryFilters: QueryFilter[]) {
    let filterValueString = '';
    queryFilters.forEach((queryFilter, index) => {
        // If the previous queryFilter has the same operator (this rule applies only to eq and neq operators) then append the current value
        if ((queryFilter.operator === 'eq' && queryFilters[index - 1]?.operator === 'eq') || (queryFilter.operator === 'neq' && queryFilters[index - 1]?.operator === 'neq')) {
            filterValueString += ` ${sanitizeString(queryFilter.value.toString())}`;
        } else {
            filterValueString += ` ${filterName}${operatorToSignMap[queryFilter.operator]}${queryFilter.value}`;
        }
    });

    return filterValueString;
}

function getSearchHeaderTitle(queryJSON: SearchQueryJSON) {
    const {type, status} = queryJSON;
    const filters = getFilters(queryJSON) ?? {};

    let title = `type:${type} status:${status}`;

    Object.keys(filters).forEach((key) => {
        const queryFilter = filters[key as ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>] ?? [];
        title += buildFilterString(key, queryFilter);
    });

    return title;
}

export {
    buildQueryStringFromFilters,
    buildSearchQueryJSON,
    buildSearchQueryString,
    getCurrentSearchParams,
    getFilters,
    getListItem,
    getQueryHash,
    getSearchHeaderTitle,
    getSearchType,
    getSections,
    getShouldShowMerchant,
    getSortedSections,
    isReportListItemType,
    isSearchResultsEmpty,
    isTransactionListItemType,
    normalizeQuery,
    shouldShowYear,
    getExpenseTypeTranslationKey,
};
