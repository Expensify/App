import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type {ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import type CONST from '@src/CONST';
import type {SearchDataTypes, SearchReport} from '@src/types/onyx/SearchResults';

/** Model of the selected transaction */
type SelectedTransactionInfo = {
    /** Whether the transaction is selected */
    isSelected: boolean;

    /** If the transaction can be deleted */
    canDelete: boolean;

    /** If the transaction can be put on hold */
    canHold: boolean;

    /** If the transaction can be removed from hold */
    canUnhold: boolean;

    /** The action that can be performed for the transaction */
    action: string;
};

/** Model of selected results */
type SelectedTransactions = Record<string, SelectedTransactionInfo>;

type SortOrder = ValueOf<typeof CONST.SEARCH.SORT_ORDER>;
type SearchColumnType = ValueOf<typeof CONST.SEARCH.TABLE_COLUMNS>;
type ExpenseSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
type InvoiceSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.INVOICE>;
type TripSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.TRIP>;
type ChatSearchStatus = ValueOf<typeof CONST.SEARCH.STATUS.CHAT>;
type SearchStatus = ExpenseSearchStatus | InvoiceSearchStatus | TripSearchStatus | ChatSearchStatus;

type SearchContext = {
    currentSearchHash: number;
    selectedTransactions: SelectedTransactions;
    selectedReports: Array<SearchReport['reportID']>;
    setCurrentSearchHash: (hash: number) => void;
    setSelectedTransactions: (selectedTransactions: SelectedTransactions, data: TransactionListItemType[] | ReportListItemType[] | ReportActionListItemType[]) => void;
    clearSelectedTransactions: (hash?: number, shouldTurnOffSelectionMode?: boolean) => void;
    shouldTurnOffSelectionMode: boolean;
    shouldShowStatusBarLoading: boolean;
    setShouldShowStatusBarLoading: (shouldShow: boolean) => void;
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

type AdvancedFiltersKeys = ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>;

type QueryFilters = {
    [K in AdvancedFiltersKeys]?: QueryFilter[];
};

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
    flatFilters: QueryFilters;
} & SearchQueryAST;

export type {
    SelectedTransactionInfo,
    SelectedTransactions,
    SearchColumnType,
    SearchStatus,
    SearchQueryAST,
    SearchQueryJSON,
    SearchQueryString,
    SortOrder,
    SearchContext,
    ASTNode,
    QueryFilter,
    QueryFilters,
    AdvancedFiltersKeys,
    ExpenseSearchStatus,
    InvoiceSearchStatus,
    TripSearchStatus,
    ChatSearchStatus,
};
