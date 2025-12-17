import {createContext, useContext} from 'react';
import type {FilterConfig, SharedFlatListProps, TableColumn} from './types';

type UpdateSortingCallback<ColumnKey extends string = string> = (params: {columnKey?: ColumnKey; order?: 'asc' | 'desc'}) => void;
type UpdateSearchStringCallback = (value: string) => void;
type UpdateFilterCallback = (params: {key: string; value: unknown}) => void;

type TableContextValue<T, ColumnKey extends string = string> = {
    filteredAndSortedData: T[];
    originalDataLength: number;
    columns: TableColumn[];
    currentFilters: Record<string, unknown>;
    sortColumn: ColumnKey | undefined;
    sortOrder: 'asc' | 'desc';
    searchString: string;
    updateFilter: UpdateFilterCallback;
    updateSorting: UpdateSortingCallback<ColumnKey>;
    updateSearchString: UpdateSearchStringCallback;
    filterConfig: FilterConfig | undefined;
    flatListProps: SharedFlatListProps<T>;
};

const defaultTableContextValue: TableContextValue<unknown, string> = {
    filteredAndSortedData: [],
    originalDataLength: 0,
    columns: [],
    currentFilters: {},
    sortColumn: undefined,
    sortOrder: 'asc',
    searchString: '',
    updateFilter: () => {},
    updateSorting: () => {},
    updateSearchString: () => {},
    filterConfig: undefined,
    flatListProps: {} as SharedFlatListProps<unknown>,
};

type TableContextType<T> = React.Context<TableContextValue<T>>;

const TableContext = createContext(defaultTableContextValue);

function useTableContext<T>(): TableContextValue<T> {
    const context = useContext(TableContext);

    if (context === defaultTableContextValue && context.currentFilters === undefined) {
        throw new Error('useTableContext must be used within a Table provider');
    }

    return context as TableContextValue<T>;
}

export default TableContext;
export {useTableContext};
export type {TableContextType, TableContextValue, UpdateSortingCallback, UpdateSearchStringCallback, UpdateFilterCallback};
