import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type CONST from '@src/CONST';

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
type SearchStatus = ValueOf<typeof CONST.SEARCH.STATUS>;

type SearchContext = {
    currentSearchHash: number;
    selectedTransactionIDs: string[];
    setCurrentSearchHash: (hash: number) => void;
    setSelectedTransactionIDs: (selectedTransactionIds: string[]) => void;
};

type ASTNode = {
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
    left: ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS> | ASTNode;
    right: string | ASTNode;
};

type QueryFilter = {
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
    value: string | number;
};

type AllFieldKeys = ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS> | ValueOf<typeof CONST.SEARCH.SYNTAX_ROOT_KEYS>;

type QueryFilters = {
    [K in AllFieldKeys]: QueryFilter | QueryFilter[];
};

type SearchQueryString = string;

type SearchQueryAST = {
    type: string;
    status: SearchStatus;
    sortBy: SearchColumnType;
    sortOrder: SortOrder;
    filters: ASTNode;
};

type SearchQueryJSON = {
    input: string;
    hash: number;
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
    AllFieldKeys,
};
