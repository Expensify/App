import {createContext, useContext} from 'react';

type FilterConfig = {
    options: Array<{label: string; value: unknown}>;
    filterType: 'multi-select' | 'single-select';
    default: unknown;
    predicate: <T>(item: T, filterValue: unknown) => boolean;
};

type SortByConfig = {
    options: Array<{label: string; value: string}>;
    default: string;
    comparator: <T>(a: T, b: T, sortKey: string, order: 'asc' | 'desc') => number;
};

type TableContextValue<T> = {
    filteredAndSortedData: T[];
    filters: Record<string, unknown>;
    sortBy: string | undefined;
    sortOrder: 'asc' | 'desc';
    searchString: string;
    setFilter: (key: string, value: unknown) => void;
    setSortBy: (key: string, order: 'asc' | 'desc') => void;
    setSearchString: (value: string) => void;
    filterConfigs: Record<string, FilterConfig> | undefined;
    sortByConfig: SortByConfig | undefined;
};

const defaultTableContextValue: TableContextValue<unknown> = {
    filteredAndSortedData: [],
    filters: {},
    sortBy: undefined,
    sortOrder: 'asc',
    searchString: '',
    setFilter: () => {},
    setSortBy: () => {},
    setSearchString: () => {},
    filterConfigs: undefined,
    sortByConfig: undefined,
};

const TableContext = createContext<TableContextValue<unknown>>(defaultTableContextValue);

function useTableContext<T>(): TableContextValue<T> {
    const context = useContext(TableContext);
    if (context === defaultTableContextValue && context.filterConfigs === undefined) {
        throw new Error('useTableContext must be used within a Table provider');
    }
    return context as TableContextValue<T>;
}

export default TableContext;
export {useTableContext};
export type {FilterConfig, SortByConfig, TableContextValue};
