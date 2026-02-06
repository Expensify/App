import type {FlashListRef} from '@shopify/flash-list';
import React, {createContext, useContext} from 'react';
import type {FilterConfig} from './middlewares/filtering';
import type {ActiveSorting} from './middlewares/sorting';
import type {SharedListProps, TableColumn, TableMethods} from './types';

/**
 * The shape of the Table context value.
 * This context is provided by the `<Table>` component and consumed by its sub-components.
 *
 * @template T - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 */
type TableContextValue<T, ColumnKey extends string = string, FilterKey extends string = string> = {
    /** Reference to the underlying FlashList for programmatic control. */
    listRef: React.RefObject<FlashListRef<T> | null>;

    /** FlashList props passed through from the Table component. */
    listProps: SharedListProps<T>;

    /** The data array after filtering, searching, and sorting have been applied. */
    processedData: T[];

    /** The original length of the data array before any processing. */
    originalDataLength: number;

    /** Column configuration for the table. */
    columns: Array<TableColumn<ColumnKey>>;

    /** Filter configuration for dropdown filters. */
    filterConfig: FilterConfig<FilterKey> | undefined;

    /** Currently active filter values. */
    activeFilters: Record<FilterKey, unknown>;

    /** Currently active sorting configuration. */
    activeSorting: ActiveSorting<ColumnKey>;

    /** Currently active search string. */
    activeSearchString: string;

    /** Methods exposed by the Table component for programmatic control. */
    tableMethods: TableMethods<ColumnKey, FilterKey>;

    /** Whether any filters differ from their default values. */
    hasActiveFilters: boolean;

    /** Whether search string is not empty. */
    hasSearchString: boolean;

    /** Whether the table has an empty result caused by search or filters. */
    isEmptyResult: boolean;
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
    tableMethods: {} as TableMethods<string, string>,
    filterConfig: undefined,
    listProps: {} as SharedListProps<unknown>,
    hasActiveFilters: false,
    hasSearchString: false,
    isEmptyResult: false,
};

const TableContext = createContext(defaultTableContextValue);

/**
 * Hook to access the Table context.
 * Must be used within a `<Table>` provider.
 *
 * @template T - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 *
 * @throws {Error} If used outside of a Table provider.
 *
 * @example
 * ```tsx
 * function CustomTableComponent<T>() {
 *   const { processedData, activeSorting } = useTableContext<T>();
 *   // Use context data...
 * }
 * ```
 */
function useTableContext<T, ColumnKey extends string = string>() {
    const context = useContext(TableContext);

    if (context === defaultTableContextValue && context.activeFilters === undefined) {
        throw new Error('useTableContext must be used within a Table provider');
    }

    return context as unknown as TableContextValue<T, ColumnKey>;
}

export default TableContext;
export {useTableContext};
export type {TableContextValue};
