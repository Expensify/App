import type {ValueOf} from 'type-fest';
import type {ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import type CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

/** Model of the selected transaction */
type SelectedTransactionInfo = {
    /** Whether the transaction is selected */
    isSelected: boolean;

    /** If the transaction can be deleted */
    canDelete: boolean;

    /** If the transaction can be put on hold */
    canHold: boolean;

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
};

/** Model of selected transactons */
type SelectedTransactions = Record<string, SelectedTransactionInfo>;

/** Model of selected reports */
type SelectedReports = {
    reportID: string;
    policyID: string;
    action: ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;
    total: number;
};

/** Model of payment data used by Search bulk actions */
type PaymentData = {
    reportID: string;
    amount: number;
    paymentType: ValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
};

type SortOrder = ValueOf<typeof CONST.SEARCH.SORT_ORDER>;
type SearchColumnType = ValueOf<typeof CONST.SEARCH.TABLE_COLUMNS>;
type ExpenseSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
type InvoiceSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.INVOICE>;
type TripSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.TRIP>;
type ChatSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.CHAT>;
type SearchStatus = ExpenseSearchStatus | InvoiceSearchStatus | TripSearchStatus | ChatSearchStatus | Array<ExpenseSearchStatus | InvoiceSearchStatus | TripSearchStatus | ChatSearchStatus>;

type SearchContext = {
    currentSearchHash: number;
    selectedTransactions: SelectedTransactions;
    selectedReports: SelectedReports[];
    setCurrentSearchHash: (hash: number) => void;
    setSelectedTransactions: (selectedTransactions: SelectedTransactions, data: TransactionListItemType[] | ReportListItemType[] | ReportActionListItemType[]) => void;
    clearSelectedTransactions: (hash?: number) => void;
    shouldShowStatusBarLoading: boolean;
    setShouldShowStatusBarLoading: (shouldShow: boolean) => void;
    setLastSearchType: (type: string | undefined) => void;
    lastSearchType: string | undefined;
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

type SearchDateFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED;

type SearchFilterKey =
    | ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS
    | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID;

type UserFriendlyKey = ValueOf<typeof CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS>;

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
    filters: ASTNode;
    policyID?: string;
};

type SearchQueryJSON = {
    inputQuery: SearchQueryString;
    hash: number;
    /** Hash used for putting queries in recent searches list. It ignores sortOrder and sortBy, because we want to treat queries differing only in sort params as the same query */
    recentSearchHash: number;
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

export type {
    SelectedTransactionInfo,
    SelectedTransactions,
    SearchColumnType,
    SearchDateFilterKeys,
    SearchStatus,
    SearchQueryAST,
    SearchQueryJSON,
    SearchQueryString,
    SortOrder,
    SearchContext,
    ASTNode,
    QueryFilter,
    QueryFilters,
    SearchFilterKey,
    UserFriendlyKey,
    ExpenseSearchStatus,
    InvoiceSearchStatus,
    TripSearchStatus,
    ChatSearchStatus,
    SearchAutocompleteResult,
    PaymentData,
    SearchAutocompleteQueryRange,
};
