import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type CONST from '@src/CONST';

/** Model of the selected transaction */
type SelectedTransactionInfo = {
    /** Whether the transaction is selected */
    isSelected: boolean;

    /** If the transaction can be deleted */
    canDelete: boolean;

    /** The action that can be performed for the transaction */
    action: string;
};

/** Model of selected results */
type SelectedTransactions = Record<string, SelectedTransactionInfo>;

type SortOrder = ValueOf<typeof CONST.SEARCH.SORT_ORDER>;
type SearchColumnType = ValueOf<typeof CONST.SEARCH.TABLE_COLUMNS>;

type SearchContext = {
    currentSearchHash: number;
    selectedTransactionIDs: string[];
    setCurrentSearchHash: (hash: number) => void;
    setSelectedTransactionIds: (selectedTransactionIds: string[]) => void;
};

export type {SelectedTransactionInfo, SelectedTransactions, SearchColumnType, SortOrder, SearchContext};
