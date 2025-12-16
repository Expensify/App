import {createContext, useContext} from 'react';
import type {FilterConfig, SharedListProps, TableColumn} from './types';

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
    listProps: SharedListProps<T>;
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
    listProps: {} as SharedListProps<unknown>,
};

const TableContext = createContext(defaultTableContextValue);

function useTableContext<T, ColumnKey extends string = string>() {
    const context = useContext(TableContext);

    if (context === defaultTableContextValue && context.currentFilters === undefined) {
        throw new Error('useTableContext must be used within a Table provider');
    }

    return context as unknown as TableContextValue<T, ColumnKey>;
}

export default TableContext;
export {useTableContext};
export type {TableContextValue, UpdateSortingCallback, UpdateSearchStringCallback, UpdateFilterCallback};
