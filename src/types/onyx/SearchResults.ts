import type {ValueOf} from 'type-fest';
import type ReportListItem from '@components/SelectionList/Search/ReportListItem';
import type TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import type {SearchColumnType, SortOrder} from '@libs/SearchUtils';
import type CONST from '@src/CONST';

type SearchDataTypes = ValueOf<typeof CONST.SEARCH_DATA_TYPES>;

type ListItemType<T extends SearchDataTypes> = T extends typeof CONST.SEARCH_DATA_TYPES.TRANSACTION
    ? typeof TransactionListItem
    : T extends typeof CONST.SEARCH_DATA_TYPES.REPORT
    ? typeof ReportListItem
    : never;

type SectionsType<T extends SearchDataTypes> = T extends typeof CONST.SEARCH_DATA_TYPES.TRANSACTION
    ? TransactionListItemType[]
    : T extends typeof CONST.SEARCH_DATA_TYPES.REPORT
    ? ReportListItemType[]
    : never;

type SearchTypeToItemMap = {
    [K in SearchDataTypes]: {
        listItem: ListItemType<K>;
        getSections: (data: SearchResults['data']) => SectionsType<K>;
        getSortedSections: (data: SectionsType<K>, sortBy?: SearchColumnType, sortOrder?: SortOrder) => SectionsType<K>;
    };
};

type SearchResultsInfo = {
    offset: number;
    type: string;
    hasMoreResults: boolean;
    isLoading: boolean;
};

type SearchPersonalDetails = {
    accountID: number;
    avatar: string;
    displayName?: string;
    login?: string;
};

type SearchPolicyDetails = {
    id: string;
    avatarURL: string;
    name: string;
};

type SearchReport = {
    /** The ID of the report */
    reportID?: string;

    /** The name of the report */
    reportName?: string;

    /** The report total amount */
    total?: number;

    /** The report currency */
    currency?: string;

    /** The action that can be performed for the report */
    action?: string;
};

type SearchTransaction = {
    /** The ID of the transaction */
    transactionID: string;

    /** The transaction created date */
    created: string;

    /** The edited transaction created date */
    modifiedCreated: string;

    /** The transaction amount */
    amount: number;

    /** The edited transaction amount */
    modifiedAmount: number;

    /** The transaction currency */
    currency: string;

    /** The edited transaction currency */
    modifiedCurrency: string;

    /** The transaction merchant */
    merchant: string;

    /** The edited transaction merchant */
    modifiedMerchant: string;

    /** The receipt object */
    receipt?: {source?: string};

    /** The transaction tag */
    tag: string;

    /** The transaction description */
    comment: {comment: string};

    /** The transaction category */
    category: string;

    /** The type of request */
    type: ValueOf<typeof CONST.SEARCH_TRANSACTION_TYPE>;

    /** The type of report the transaction is associated with */
    reportType: string;

    /** The ID of the policy the transaction is associated with */
    policyID: string;

    /** The ID of the parent of the transaction */
    parentTransactionID?: string;

    /** If the transaction has an Ereceipt */
    hasEReceipt?: boolean;

    /** The transaction description */
    description: string;

    /** The transaction sender ID */
    accountID: number;

    /** The transaction recipient ID */
    managerID: number;

    /** If the transaction has a Ereceipt */
    hasViolation: boolean;

    /** The transaction tax amount */
    taxAmount?: number;

    /** The ID of the report the transaction is associated with */
    reportID: string;

    /** The report ID of the transaction thread associated with the transaction */
    transactionThreadReportID: string;

    /** The action that can be performed for the transaction */
    action: string;

    /** The MCC Group associated with the transaction */
    mccGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

    /** The modified MCC Group associated with the transaction */
    modifiedMCCGroup?: ValueOf<typeof CONST.MCC_GROUPS>;
};

type SearchAccountDetails = Partial<SearchPolicyDetails & SearchPersonalDetails>;

type SearchTransactionType = ValueOf<typeof CONST.SEARCH_TRANSACTION_TYPE>;

type SearchQuery = ValueOf<typeof CONST.TAB_SEARCH>;

type SearchResults = {
    search: SearchResultsInfo;
    data: Record<string, SearchTransaction & Record<string, SearchPersonalDetails>> & Record<string, SearchPolicyDetails> & Record<string, SearchReport>;
};

export default SearchResults;

export type {
    SearchQuery,
    SearchTransaction,
    SearchTransactionType,
    SearchPersonalDetails,
    SearchPolicyDetails,
    SearchAccountDetails,
    SearchDataTypes,
    SearchTypeToItemMap,
    SearchReport,
    SectionsType,
};
