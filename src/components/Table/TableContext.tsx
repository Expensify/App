import {createContext, useContext} from 'react';
import type {FilterConfig, SharedFlatListProps, SortByConfig} from './types';

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
    flatListProps: SharedFlatListProps<T>;
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
    flatListProps: {} as SharedFlatListProps<unknown>,
};

type TableContextType<T> = React.Context<TableContextValue<T>>;

const TableContext = createContext(defaultTableContextValue);

function useTableContext<T>(): TableContextValue<T> {
    const context = useContext(TableContext);

    if (context === defaultTableContextValue && context.filterConfigs === undefined) {
        throw new Error('useTableContext must be used within a Table provider');
    }

    return context as TableContextValue<T>;
}

export default TableContext;
export {useTableContext};
export type {TableContextType, TableContextValue};
