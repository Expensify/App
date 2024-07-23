import type {ValueOf} from 'type-fest';
import type {SearchColumnType, SortOrder} from '@components/Search/types';
import type ReportListItem from '@components/SelectionList/Search/ReportListItem';
import type TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import type CONST from '@src/CONST';

/** Types of search data */
type SearchDataTypes = ValueOf<typeof CONST.SEARCH.DATA_TYPES>;

/** Model of search result list item */
type ListItemType<T extends SearchDataTypes> = T extends typeof CONST.SEARCH.DATA_TYPES.TRANSACTION
    ? typeof TransactionListItem
    : T extends typeof CONST.SEARCH.DATA_TYPES.REPORT
    ? typeof ReportListItem
    : never;

/** Model of search result section */
type SectionsType<T extends SearchDataTypes> = T extends typeof CONST.SEARCH.DATA_TYPES.TRANSACTION
    ? TransactionListItemType[]
    : T extends typeof CONST.SEARCH.DATA_TYPES.REPORT
    ? ReportListItemType[]
    : never;

/** Mapping of search results to list item */
type SearchTypeToItemMap = {
    [K in SearchDataTypes]: {
        /** Collection of search result list item */
        listItem: ListItemType<K>;

        /** Returns search results sections based on search results data */
        getSections: (data: SearchResults['data'], metadata: SearchResults['search']) => SectionsType<K>;

        /** Returns sorted search results sections based on search results data */
        getSortedSections: (data: SectionsType<K>, sortBy?: SearchColumnType, sortOrder?: SortOrder) => SectionsType<K>;
    };
};

/** Model of columns to show for search results */
type ColumnsToShow = {
    /** Whether the category column should be shown */
    shouldShowCategoryColumn: boolean;

    /** Whether the tag column should be shown */
    shouldShowTagColumn: boolean;

    /** Whether the tax column should be shown */
    shouldShowTaxColumn: boolean;
};

/** Model of search result state */
type SearchResultsInfo = {
    /** Current search results offset/cursor */
    offset: number;

    /** Type of search */
    type: string;

    /** Whether the user can fetch more search results */
    hasMoreResults: boolean;

    /** Whether the search results are currently loading */
    isLoading: boolean;

    /** The optional columns that should be shown according to policy settings */
    columnsToShow: ColumnsToShow;
};

/** Model of personal details search result */
type SearchPersonalDetails = {
    /** ID of user account */
    accountID: number;

    /** User's avatar URL */
    avatar: string;

    /** User's display name */
    displayName?: string;

    /** User's email */
    login?: string;
};

/** Model of policy details search result */
type SearchPolicyDetails = {
    /** ID of the policy */
    id: string;

    /** Policy avatar URL */
    avatarURL: string;

    /** Policy name */
    name: string;
};

/** The action that can be performed for the transaction */
type SearchTransactionAction = ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;

/** Model of report search result */
type SearchReport = {
    /** The ID of the report */
    reportID?: string;

    /** The name of the report */
    reportName?: string;

    /** The report total amount */
    total?: number;

    /** The report currency */
    currency?: string;

    /** The report type */
    type?: ValueOf<typeof CONST.REPORT.TYPE>;

    /** The accountID of the report manager */
    managerID?: number;

    /** The accountID of the user who created the report  */
    accountID?: number;

    /** The policyID of the report */
    policyID?: string;

    /** The date the report was created */
    created?: string;

    /** The action that can be performed for the report */
    action?: SearchTransactionAction;
};

/** Model of transaction search result */
type SearchTransaction = {
    /** The ID of the transaction */
    transactionID: string;

    /** The transaction created date */
    created: string;

    /** The edited transaction created date */
    modifiedCreated: string;

    /** The transaction amount */
    amount: number;

    /** If the transaction can be deleted */
    canDelete: boolean;

    /** If the transaction can be put on hold */
    canHold: boolean;

    /** If the transaction can be removed from hold */
    canUnhold: boolean;

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
    receipt?: {
        /** Source of the receipt */
        source?: string;

        /** State of the receipt */
        state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    };

    /** The transaction tag */
    tag: string;

    /** The transaction description */
    comment: {
        /** Content of the transaction description */
        comment: string;
    };

    /** The transaction category */
    category: string;

    /** The type of request */
    transactionType: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>;

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
    action: SearchTransactionAction;

    /** The MCC Group associated with the transaction */
    mccGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

    /** The modified MCC Group associated with the transaction */
    modifiedMCCGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

    /** The ID of the money request reportAction associated with the transaction */
    moneyRequestReportActionID?: string;
};

/** Model of account details search result */
type SearchAccountDetails = Partial<SearchPolicyDetails & SearchPersonalDetails>;

/** Types of searchable transactions */
type SearchTransactionType = ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>;

/** Types of search queries */
type SearchQuery = ValueOf<typeof CONST.SEARCH.TAB>;

/** Model of search results */
type SearchResults = {
    /** Current search results state */
    search: SearchResultsInfo;

    /** Search results data */
    data: Record<string, SearchTransaction & Record<string, SearchPersonalDetails>> & Record<string, SearchPolicyDetails> & Record<string, SearchReport>;

    /** Whether search data is being fetched from server */
    isLoading?: boolean;
};

export default SearchResults;

export type {
    SearchQuery,
    SearchTransaction,
    SearchTransactionType,
    SearchTransactionAction,
    SearchPersonalDetails,
    SearchPolicyDetails,
    SearchAccountDetails,
    SearchDataTypes,
    SearchTypeToItemMap,
    SearchReport,
    SectionsType,
};
