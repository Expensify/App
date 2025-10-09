import type {ValueOf} from 'type-fest';
import type {PaymentMethod} from '@components/KYCWall/types';
import type {ReportActionListItemType, TaskListItemType, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionListWithSections/types';
import type {SearchKey} from '@libs/SearchUIUtils';
import type CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';

/** Model of the selected transaction */
type SelectedTransactionInfo = {
    /** Whether the transaction is selected */
    isSelected: boolean;

    /** If the transaction can be deleted */
    canDelete: boolean;

    /** If the transaction can be put on hold */
    canHold: boolean;

    /** If the transaction can be moved to other report */
    canChangeReport: boolean;

    /** Whether the transaction is currently held */
    isHeld: boolean;

    /** If the transaction can be removed from hold */
    canUnhold: boolean;

    /** The action that can be performed for the transaction */
    action: ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;

    /** The reportID of the transaction */
    reportID: string;

    /** The policyID tied to the report the transaction is reported on */
    policyID: string;

    /** The transaction amount */
    amount: number;

    /** The converted transaction amount into either group currency, or the active policy currency */
    convertedAmount: number;

    /** The currency that the converted amount is in */
    convertedCurrency: string;

    /** Whether it is the only expense of the parent expense report */
    isFromOneTransactionReport?: boolean;
};

/** Model of selected transactions */
type SelectedTransactions = Record<string, SelectedTransactionInfo>;

/** Model of selected reports */
type SelectedReports = {
    reportID: string;
    policyID: string | undefined;
    action: ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;
    allActions: Array<ValueOf<typeof CONST.SEARCH.ACTION_TYPES>>;
    total: number;
};

/** Model of payment data used by Search bulk actions */
type PaymentData = {
    reportID: string;
    amount: number;
    paymentType: ValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
    payAsBusiness?: boolean;
    bankAccountID?: number;
    fundID?: number;
    policyID?: string;
    adminsChatReportID?: number;
    adminsCreatedReportActionID?: number;
    expenseChatReportID?: number;
    expenseCreatedReportActionID?: number;
    customUnitRateID?: string;
    customUnitID?: string;
    ownerEmail?: string;
    policyName?: string;
};

type SortOrder = ValueOf<typeof CONST.SEARCH.SORT_ORDER>;
type SearchColumnType = ValueOf<typeof CONST.SEARCH.TABLE_COLUMNS>;
type ExpenseSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
type InvoiceSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.INVOICE>;
type TripSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.TRIP>;
type TaskSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.TASK>;
type SingularSearchStatus = ExpenseSearchStatus | InvoiceSearchStatus | TripSearchStatus | TaskSearchStatus;
type SearchStatus = SingularSearchStatus | SingularSearchStatus[];
type SearchGroupBy = ValueOf<typeof CONST.SEARCH.GROUP_BY>;
type TableColumnSize = ValueOf<typeof CONST.SEARCH.TABLE_COLUMN_SIZES>;
type SearchDatePreset = ValueOf<typeof CONST.SEARCH.DATE_PRESETS>;
type SearchWithdrawalType = ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>;
type SearchAction = ValueOf<typeof CONST.SEARCH.ACTION_FILTERS>;

type SearchContextData = {
    currentSearchHash: number;
    currentSearchKey: SearchKey | undefined;
    currentSearchQueryJSON: SearchQueryJSON | undefined;
    selectedTransactions: SelectedTransactions;
    selectedTransactionIDs: string[];
    selectedReports: SelectedReports[];
    isOnSearch: boolean;
    shouldTurnOffSelectionMode: boolean;
    shouldResetSearchQuery: boolean;
};

type SearchContextProps = SearchContextData & {
    setCurrentSearchHashAndKey: (hash: number, key: SearchKey | undefined) => void;
    setCurrentSearchQueryJSON: (searchQueryJSON: SearchQueryJSON | undefined) => void;
    /** If you want to set `selectedTransactionIDs`, pass an array as the first argument, object/record otherwise */
    setSelectedTransactions: {
        (selectedTransactionIDs: string[], unused?: undefined): void;
        (selectedTransactions: SelectedTransactions, data: TransactionListItemType[] | TransactionGroupListItemType[] | ReportActionListItemType[] | TaskListItemType[]): void;
    };
    /** If you want to clear `selectedTransactionIDs`, pass `true` as the first argument */
    clearSelectedTransactions: {
        (hash?: number, shouldTurnOffSelectionMode?: boolean): void;
        (clearIDs: true, unused?: undefined): void;
    };
    removeTransaction: (transactionID: string | undefined) => void;
    shouldShowFiltersBarLoading: boolean;
    setShouldShowFiltersBarLoading: (shouldShow: boolean) => void;
    setLastSearchType: (type: string | undefined) => void;
    lastSearchType: string | undefined;
    showSelectAllMatchingItems: boolean;
    shouldShowSelectAllMatchingItems: (shouldShow: boolean) => void;
    areAllMatchingItemsSelected: boolean;
    selectAllMatchingItems: (on: boolean) => void;
    setShouldResetSearchQuery: (shouldReset: boolean) => void;
};

type ASTNode = {
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
    left: ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS> | ASTNode;
    right: string | ASTNode | string[];
};

type QueryFilter = {
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
    value: string | number;
};

type SearchBooleanFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE;

type SearchTextFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID;

type SearchDateFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN;

type SearchAmountFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT;

type SearchCurrencyFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY;

type SearchFilterKey =
    | ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY;

type UserFriendlyKey = ValueOf<typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS>;
type UserFriendlyValue = ValueOf<typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_VALUES_MAP>;

type QueryFilters = Array<{
    key: SearchFilterKey;
    filters: QueryFilter[];
}>;

type SearchQueryString = string;

type SearchQueryAST = {
    type: SearchDataTypes;
    status: SearchStatus;
    sortBy: SearchColumnType;
    sortOrder: SortOrder;
    groupBy?: SearchGroupBy;
    filters: ASTNode;
    policyID?: string[];
};

type SearchQueryJSON = {
    inputQuery: SearchQueryString;
    hash: number;
    /** Hash used for putting queries in recent searches list. It ignores sortOrder and sortBy, because we want to treat queries differing only in sort params as the same query */
    recentSearchHash: number;
    /** Use similarSearchHash to test if two searchers are similar i.e. have same filters but not necessary same values */
    similarSearchHash: number;
    flatFilters: QueryFilters;
} & SearchQueryAST;

type SearchAutocompleteResult = {
    autocomplete: SearchAutocompleteQueryRange | null;
    ranges: SearchAutocompleteQueryRange[];
};

type SearchAutocompleteQueryRange = {
    key: SearchFilterKey;
    length: number;
    start: number;
    value: string;
};

type SearchParams = {
    queryJSON: SearchQueryJSON;
    searchKey: SearchKey | undefined;
    offset: number;
    prevReportsLength?: number;
    shouldCalculateTotals: boolean;
};

type BankAccountMenuItem = {
    text: string;
    description: string;
    icon: IconAsset;
    methodID: number | undefined;
    value: PaymentMethod;
};

export type {
    SelectedTransactionInfo,
    SelectedTransactions,
    SearchColumnType,
    SearchBooleanFilterKeys,
    SearchDateFilterKeys,
    SearchAmountFilterKeys,
    SearchStatus,
    SearchQueryJSON,
    SearchQueryString,
    SortOrder,
    SearchContextProps,
    SearchContextData,
    ASTNode,
    QueryFilter,
    QueryFilters,
    SearchFilterKey,
    UserFriendlyKey,
    ExpenseSearchStatus,
    InvoiceSearchStatus,
    TripSearchStatus,
    TaskSearchStatus,
    SearchAutocompleteResult,
    PaymentData,
    SearchAutocompleteQueryRange,
    SearchParams,
    TableColumnSize,
    SearchGroupBy,
    SingularSearchStatus,
    SearchDatePreset,
    SearchWithdrawalType,
    SearchAction,
    SearchCurrencyFilterKeys,
    UserFriendlyValue,
    SelectedReports,
    SearchTextFilterKeys,
    BankAccountMenuItem,
};
