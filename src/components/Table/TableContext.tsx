import type {FlashListRef} from '@shopify/flash-list';
import React, {createContext, useContext} from 'react';
import type {ActiveSorting, FilterConfig, SharedListProps, TableColumn, ToggleSortingCallback, UpdateFilterCallback, UpdateSearchStringCallback, UpdateSortingCallback} from './types';

type TableContextValue<T, ColumnKey extends string = string> = {
    listRef: React.RefObject<FlashListRef<T> | null>;
    listProps: SharedListProps<T>;
    processedData: T[];
    originalDataLength: number;
    columns: Array<TableColumn<ColumnKey>>;
    filterConfig: FilterConfig | undefined;
    activeFilters: Record<string, unknown>;
    activeSorting: ActiveSorting<ColumnKey>;
    activeSearchString: string;

    updateFilter: UpdateFilterCallback;
    updateSorting: UpdateSortingCallback<ColumnKey>;
    toggleSorting: ToggleSortingCallback<ColumnKey>;
    updateSearchString: UpdateSearchStringCallback;
};

const defaultTableContextValue: TableContextValue<unknown, string> = {
    listRef: React.createRef(),
    processedData: [],
    originalDataLength: 0,
    columns: [],
    activeFilters: {},
    activeSorting: {
        columnKey: undefined,
        order: 'asc',
    },
    activeSearchString: '',
    updateFilter: () => {},
    updateSorting: () => {},
    toggleSorting: () => {},
    updateSearchString: () => {},
    filterConfig: undefined,
    listProps: {} as SharedListProps<unknown>,
};

const TableContext = createContext(defaultTableContextValue);

function useTableContext<T, ColumnKey extends string = string>() {
    const context = useContext(TableContext);

    if (context === defaultTableContextValue && context.activeFilters === undefined) {
        throw new Error('useTableContext must be used within a Table provider');
    }

    return context as unknown as TableContextValue<T, ColumnKey>;
}

export default TableContext;
export {useTableContext};
export type {TableContextValue, UpdateSortingCallback, UpdateSearchStringCallback, UpdateFilterCallback};
