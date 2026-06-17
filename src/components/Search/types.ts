import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {UnitPosition, UnitWithFallback} from '@components/Charts';
import type {PaymentMethod} from '@components/KYCWall/types';
import type {SelectionListStyle} from '@components/SelectionList/types';
import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';
import type CONST from '@src/CONST';
import type {Report, ReportAction, SearchResults, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import type {
    ReportActionListItemType,
    TaskListItemType,
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMemberGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionYearGroupListItemType,
} from './SearchList/ListItem/types';

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

    /** The currency conversion rate from the transaction currency to the report currency */
    currencyConversionRate?: string;

    /** Whether it is the only expense of the parent expense report */
    isFromOneTransactionReport: boolean;

    /** Account ID of the report owner */
    ownerAccountID?: number;

    reportAction?: ReportAction;

    report?: Report;

    /** The group key this transaction belongs to when in a grouped view */
    groupKey?: string;
};

/** Model of selected transactions */
type SelectedTransactions = Record<string, SelectedTransactionInfo>;

/** Model of selected reports */
type SelectedReports = {
    reportID: string | undefined;
    policyID: string | undefined;
    action: ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;
    canPay: boolean;
    canApprove: boolean;
    canSubmit: boolean;
    canChangeApprover: boolean;
    total: number;
    currency?: string;
    chatReportID: string | undefined;
    managerID?: number;
    ownerAccountID?: number;
    parentReportActionID?: string;
    parentReportID?: string;
    type?: string;
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
type BulkPaySelectionData = {
    bankAccountID?: number;
    payAsBusiness?: boolean;
    paymentMethod?: string;
};

type SortOrder = ValueOf<typeof CONST.SEARCH.SORT_ORDER>;
type SearchColumnType = ValueOf<typeof CONST.SEARCH.TABLE_COLUMNS>;
type SearchSortBy = SearchColumnType | ValueOf<typeof CONST.SEARCH.SORT_BY_COLUMNS>;
type ExpenseSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
type ExpenseReportSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE_REPORT>;
type InvoiceSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.INVOICE>;
type TripSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.TRIP>;
type TaskSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.TASK>;
type SingularSearchStatus = ExpenseSearchStatus | ExpenseReportSearchStatus | InvoiceSearchStatus | TripSearchStatus | TaskSearchStatus;
type SearchStatus = SingularSearchStatus | SingularSearchStatus[];
type SearchGroupBy = ValueOf<typeof CONST.SEARCH.GROUP_BY>;
type SearchView = ValueOf<typeof CONST.SEARCH.VIEW>;
// PieChart is not implemented so we exclude it here to prevent TypeScript errors in `SearchChartView.tsx`.
type ChartView = Exclude<SearchView, 'table'>;
type TableColumnSize = ValueOf<typeof CONST.SEARCH.TABLE_COLUMN_SIZES>;
type SearchDatePreset = ValueOf<typeof CONST.SEARCH.DATE_PRESETS>;
type SearchWithdrawalType = ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>;
type SearchWithdrawalStatus = Array<ValueOf<typeof CONST.SEARCH.SETTLEMENT_STATUS>>;
type SyntaxFilterKey = ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>;

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

type SearchQueryContextValue = {
    currentSearchHash: number;
    currentSimilarSearchHash: number;
    currentSearchKey: SearchKey | undefined;
    currentSearchQueryJSON: Readonly<SearchQueryJSON> | undefined;
    suggestedSearches: Record<SearchKey, SearchTypeMenuItem>;
    shouldResetSearchQuery: boolean;
};

type SearchQueryActionsValue = {
    setShouldResetSearchQuery: (shouldReset: boolean) => void;
};

type SearchResultsContextValue = {
    currentSearchResults: SearchResults | undefined;
    /** Whether we're on a main to-do search and should use live Onyx data instead of snapshots */
    shouldUseLiveData: boolean;
    sortedReportIDs: ReadonlyArray<string | undefined>;
    shouldShowFiltersBarLoading: boolean;
    lastSearchType: string | undefined;
};

type SearchResultsActionsValue = {
    setSortedReportIDs: (ids: ReadonlyArray<string | undefined>) => void;
    setShouldShowFiltersBarLoading: (shouldShow: boolean) => void;
    setLastSearchType: (type: string | undefined) => void;
};

type SearchSelectionContextValue = {
    currentSelectedTransactionReportID: string | undefined;
    selectedTransactions: SelectedTransactions;
    selectedTransactionIDs: string[];
    selectedReports: SelectedReports[];
    shouldTurnOffSelectionMode: boolean;
    /** True when at least one transaction is selected. */
    hasSelectedTransactions: boolean;
    areAllMatchingItemsSelected: boolean;
};

type SearchSelectionActionsValue = {
    /**
     * If you want to set `selectedTransactionIDs`, pass an array as the first argument, object/record otherwise.
     * The optional `data` argument lets callers atomically update `selectedReports` in the same commit
     * to avoid a transient render where the two pieces of state are out of sync.
     */
    setSelectedTransactions: {
        (selectedTransactionIDs: string[], unused?: undefined): void;
        (selectedTransactions: SelectedTransactions, data?: TransactionListItemType[] | TransactionGroupListItemType[] | ReportActionListItemType[] | TaskListItemType[]): void;
    };
    setSelectedReports: (reports: SelectedReports[]) => void;
    setCurrentSelectedTransactionReportID: (reportID: string | undefined) => void;
    /** If you want to clear `selectedTransactionIDs`, pass `true` as the first argument */
    clearSelectedTransactions: {
        (hash?: number, shouldTurnOffSelectionMode?: boolean): void;
        (clearIDs: true, unused?: undefined): void;
    };
    removeTransaction: (transactionID: string | undefined) => void;
    selectAllMatchingItems: (on: boolean) => void;
};

/** Composed value of all three Search state contexts. Kept as a union for callers that need the full bag shape (e.g. test fixtures, action `searchContext` payloads). */
type SearchStateContextValue = SearchQueryContextValue & SearchResultsContextValue & SearchSelectionContextValue;

/** Composed value of all three Search actions contexts. See `SearchStateContextValue`. */
type SearchActionsContextValue = SearchQueryActionsValue & SearchResultsActionsValue & SearchSelectionActionsValue;

type ASTNode = {
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
    left: SyntaxFilterKey | ASTNode;
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

type SearchDateKey = `${SearchDateFilterKeys}${ValueOf<typeof CONST.SEARCH.DATE_MODIFIERS>}` | ReportFieldDateKey;

type SearchAmountFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT;
type SearchAmountValues = Record<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS>, string | undefined>;

type SearchCurrencyFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY;

type SearchFilterKey =
    | SyntaxFilterKey
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

type SearchQueryString = string;

type SearchQueryAST = {
    type: SearchDataTypes;
    status: SearchStatus;
    sortBy: SearchSortBy;
    sortOrder: SortOrder;
    groupBy?: SearchGroupBy;
    view: SearchView;
    filters: ASTNode;
    policyID?: string[];
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
    queryJSON: Readonly<SearchQueryJSON>;
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

/** Union type representing all possible grouped transaction item types used in chart views */
type GroupedItem =
    | TransactionMemberGroupListItemType
    | TransactionCardGroupListItemType
    | TransactionWithdrawalIDGroupListItemType
    | TransactionCategoryGroupListItemType
    | TransactionMerchantGroupListItemType
    | TransactionTagGroupListItemType
    | TransactionMonthGroupListItemType
    | TransactionWeekGroupListItemType
    | TransactionYearGroupListItemType
    | TransactionQuarterGroupListItemType;

type SearchChartProps = {
    /** Grouped transaction data from search results */
    data: GroupedItem[];

    /** Function to extract label from grouped item */
    getLabel: (item: GroupedItem) => string;

    /** Function to build filter query from grouped item */
    getFilterQuery: (item: GroupedItem) => string;

    /** Callback when a chart item is pressed - receives the filter query to apply */
    onItemPress?: (filterQuery: string) => void;

    /** Whether data is loading */
    isLoading?: boolean;

    /** Currency unit with font fallback support */
    unit?: UnitWithFallback;

    /** Position of currency symbol relative to value */
    unitPosition?: UnitPosition;
};

type SearchFilterCommonProps<T> = {
    value: T;
    selectionListTextInputStyle?: StyleProp<ViewStyle>;
    selectionListStyle?: SelectionListStyle;
    autoFocus?: boolean;
    ready?: boolean;
    footer?: React.ReactNode;
    onChange: (value: T) => void;
};

export type {
    SelectedTransactionInfo,
    SelectedTransactions,
    SearchColumnType,
    SearchSortBy,
    SearchBooleanFilterKeys,
    SearchDateFilterKeys,
    SearchDateKey,
    SearchAmountFilterKeys,
    SearchAmountValues,
    SearchStatus,
    SearchQueryJSON,
    SearchQueryString,
    ReportFieldKey,
    ReportFieldTextKey,
    ReportFieldDateKey,
    ReportFieldNegatedKey,
    SortOrder,
    SearchStateContextValue,
    SearchActionsContextValue,
    SearchQueryContextValue,
    SearchQueryActionsValue,
    SearchResultsContextValue,
    SearchResultsActionsValue,
    SearchSelectionContextValue,
    SearchSelectionActionsValue,
    ASTNode,
    QueryFilter,
    QueryFilters,
    SyntaxFilterKey,
    SearchFilterKey,
    UserFriendlyKey,
    SearchAutocompleteResult,
    PaymentData,
    BulkPaySelectionData,
    SearchAutocompleteQueryRange,
    SearchParams,
    TableColumnSize,
    SearchGroupBy,
    SearchView,
    ChartView,
    SingularSearchStatus,
    SearchDatePreset,
    SearchWithdrawalType,
    SearchWithdrawalStatus,
    SearchCurrencyFilterKeys,
    UserFriendlyValue,
    SelectedReports,
    SearchTextFilterKeys,
    BankAccountMenuItem,
    SearchCustomColumnIds,
    GroupedItem,
    SearchChartProps,
    SearchFilterCommonProps,
};
