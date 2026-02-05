import type {ValueOf} from 'type-fest';
import type {PaymentMethod} from '@components/KYCWall/types';
import type {ReportActionListItemType, TaskListItemType, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionListWithSections/types';
import type {SearchKey} from '@libs/SearchUIUtils';
import type CONST from '@src/CONST';
import type {Report, ReportAction, SearchResults, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';

/** Model of the selected transaction */
type SelectedTransactionInfo = {
    /** The transaction itself */
    transaction?: Transaction;

    /** Whether the transaction is selected */
    isSelected: boolean;

    /** If the transaction can be rejected */
    canReject: boolean;

    /** If the transaction can be put on hold */
    canHold: boolean;

    /** If the transaction can be splitted */
    canSplit: boolean;

    /** If the transaction has been splitted */
    hasBeenSplit: boolean;

    /** If the transaction can be moved to other report */
    canChangeReport: boolean;

    /** Whether the transaction is currently held */
    isHeld: boolean;

    /** If the transaction can be removed from hold */
    canUnhold: boolean;

    /** The action that can be performed for the transaction */
    action: ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;

    /** The reportID of the transaction */
    reportID?: string;

    /** The policyID tied to the report the transaction is reported on */
    policyID: string | undefined;

    /** The transaction amount */
    amount: number;

    /** The transaction currency */
    currency: string;

    /** The transaction converted amount in `groupCurrency` currency */
    groupAmount?: number;

    /** The group currency if the transaction is grouped. Defaults to the active policy currency if group has no target currency */
    groupCurrency?: string;

    /** The exchange rate of the transaction if the transaction is grouped. Defaults to the exchange rate against the active policy currency if group has no target currency */
    groupExchangeRate?: number;

    /** Whether it is the only expense of the parent expense report */
    isFromOneTransactionReport: boolean;

    /** Account ID of the report owner */
    ownerAccountID?: number;

    reportAction?: ReportAction;

    report?: Report;
};

/** Model of selected transactions */
type SelectedTransactions = Record<string, SelectedTransactionInfo>;

/** Model of selected reports */
type SelectedReports = {
    reportID: string | undefined;
    policyID: string | undefined;
    action: ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;
    allActions: Array<ValueOf<typeof CONST.SEARCH.ACTION_TYPES>>;
    total: number;
    currency?: string;
    chatReportID: string | undefined;
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
    adminsChatReportID?: string;
    adminsCreatedReportActionID?: number;
    expenseChatReportID?: string;
    expenseCreatedReportActionID?: number;
    customUnitRateID?: string;
    customUnitID?: string;
    ownerEmail?: string;
    policyName?: string;
};

type SortOrder = ValueOf<typeof CONST.SEARCH.SORT_ORDER>;
type SearchColumnType = ValueOf<typeof CONST.SEARCH.TABLE_COLUMNS>;
type ExpenseSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
type ExpenseReportSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE_REPORT>;
type InvoiceSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.INVOICE>;
type TripSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.TRIP>;
type TaskSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.TASK>;
type SingularSearchStatus = ExpenseSearchStatus | ExpenseReportSearchStatus | InvoiceSearchStatus | TripSearchStatus | TaskSearchStatus;
type SearchStatus = SingularSearchStatus | SingularSearchStatus[];
type SearchGroupBy = ValueOf<typeof CONST.SEARCH.GROUP_BY>;
type SearchView = ValueOf<typeof CONST.SEARCH.VIEW>;
// LineChart and PieChart are not implemented so we exclude them here to prevent TypeScript errors in `SearchChartView.tsx`.
type ChartView = Exclude<SearchView, 'table' | 'line' | 'pie'>;
type TableColumnSize = ValueOf<typeof CONST.SEARCH.TABLE_COLUMN_SIZES>;
type SearchDatePreset = ValueOf<typeof CONST.SEARCH.DATE_PRESETS>;
type SearchWithdrawalType = ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>;
type SearchAction = ValueOf<typeof CONST.SEARCH.ACTION_FILTERS>;

type SearchCustomColumnIds =
    | ValueOf<typeof CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE>
    | ValueOf<typeof CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE_REPORT>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CARD>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.FROM>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.WITHDRAWAL_ID>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CATEGORY>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MERCHANT>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.TAG>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MONTH>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.WEEK>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.YEAR>
    | ValueOf<typeof CONST.SEARCH.GROUP_CUSTOM_COLUMNS.QUARTER>;

type SearchContextData = {
    currentSearchHash: number;
    currentSearchKey: SearchKey | undefined;
    currentSearchQueryJSON: SearchQueryJSON | undefined;
    currentSearchResults: SearchResults | undefined;
    selectedTransactions: SelectedTransactions;
    selectedTransactionIDs: string[];
    selectedReports: SelectedReports[];
    isOnSearch: boolean;
    shouldTurnOffSelectionMode: boolean;
    shouldResetSearchQuery: boolean;
};

type SearchContextProps = SearchContextData & {
    currentSearchResults: SearchResults | undefined;
    /** Whether we're on a main to-do search and should use live Onyx data instead of snapshots */
    shouldUseLiveData: boolean;
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

// Report fields are dynamic keys, that policies can configure. They match:
// reportField-<key> : Normal report field
// reportField<modifier>-<key> : Report field with a modifier, such as On, After, Before, Not, so that we can handle Dates and negation
type ReportFieldTextKey = `${typeof CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${string}`;
type ReportFieldNegatedKey = `${typeof CONST.SEARCH.REPORT_FIELD.NOT_PREFIX}${string}`;
type ReportFieldDateKey = `${typeof CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX}${ValueOf<typeof CONST.SEARCH.DATE_MODIFIERS>}-${string}`;
type ReportFieldKey = ReportFieldTextKey | ReportFieldDateKey | ReportFieldNegatedKey;

type SearchBooleanFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE;

type SearchTextFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT
    | ReportFieldTextKey;

type SearchDateFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN
    | ReportFieldTextKey;

type SearchAmountFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT;

type SearchCurrencyFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY;

type SearchFilterKey =
    | ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.COLUMNS
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW;

type UserFriendlyKey = ValueOf<typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS>;
type UserFriendlyValue = ValueOf<typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_VALUES_MAP>;

type QueryFilters = Array<{
    key: SearchFilterKey;
    filters: QueryFilter[];
}>;

type RawFilterKey = ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS> | ValueOf<typeof CONST.SEARCH.SYNTAX_ROOT_KEYS>;

type RawQueryFilter = {
    key: RawFilterKey;
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
    value: string | string[];
    isDefault?: boolean;
};

type SearchQueryString = string;

type SearchQueryAST = {
    type: SearchDataTypes;
    status: SearchStatus;
    sortBy: SearchColumnType;
    sortOrder: SortOrder;
    groupBy?: SearchGroupBy;
    view: SearchView;
    filters: ASTNode;
    policyID?: string[];
    rawFilterList?: RawQueryFilter[];
    columns?: SearchCustomColumnIds | SearchCustomColumnIds[];
    limit?: number;
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
    isLoading: boolean;
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
    ReportFieldKey,
    ReportFieldTextKey,
    ReportFieldDateKey,
    ReportFieldNegatedKey,
    SortOrder,
    SearchContextProps,
    SearchContextData,
    ASTNode,
    QueryFilter,
    QueryFilters,
    RawFilterKey,
    RawQueryFilter,
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
    SearchView,
    ChartView,
    SingularSearchStatus,
    SearchDatePreset,
    SearchWithdrawalType,
    SearchAction,
    SearchCurrencyFilterKeys,
    UserFriendlyValue,
    SelectedReports,
    SearchTextFilterKeys,
    BankAccountMenuItem,
    SearchCustomColumnIds,
};
