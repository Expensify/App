import type {FlashListRef} from '@shopify/flash-list';
import React, {useImperativeHandle, useRef} from 'react';
import useFiltering from './middlewares/filtering';
import useSearching from './middlewares/searching';
import useSorting from './middlewares/sorting';
import TableContext from './TableContext';
import type {TableContextValue} from './TableContext';
import type {TableHandle, TableMethods, TableProps} from './types';

/**
 * A composable table component that provides filtering, search, and sorting functionality.
 *
 * This component uses a compositional pattern where the parent `<Table>` component manages
 * all state (filtering, searching, sorting) and provides it via context. Child components
 * consume this context to render different parts of the table UI.
 *
 * ## Compositional Pattern
 *
 * The Table follows a compound component pattern similar to `<Menu>`, `<Form>`, or `<Tabs>`.
 * You compose your table UI by nesting the sub-components you need:
 *
 * - `<Table>` - The parent component that manages state and provides context
 * - `<Table.Header>` - Renders sortable column headers
 * - `<Table.Body>` - Renders the data rows using FlashList
 * - `<Table.SearchBar>` - Renders a search input that filters data
 * - `<Table.FilterButtons>` - Renders dropdown filter buttons
 *
 * ## Middleware Architecture
 *
 * Data processing is handled through a pipeline of middleware functions:
 * 1. **Filtering** - Applies dropdown filter selections
 * 2. **Searching** - Applies search string filtering
 * 3. **Sorting** - Sorts data by the active column
 *
 * Each middleware transforms the data array and passes it to the next.
 *
 * ## Generic Type Parameters
 *
 * - `T` - The type of items in your data array
 * - `ColumnKey` - String literal union of valid column keys (e.g., `'name' | 'date'`)
 * - `FilterKey` - String literal union of valid filter keys
 *
 * @example Basic Usage
 * ```tsx
 * type Item = { id: string; name: string; category: string };
 * type ColumnKey = 'name' | 'category';
 *
 * const columns: Array<TableColumn<ColumnKey>> = [
 *   { key: 'name', label: 'Name' },
 *   { key: 'category', label: 'Category' },
 * ];
 *
 * <Table<Item, ColumnKey>
 *   data={items}
 *   columns={columns}
 *   renderItem={({ item }) => <ItemRow item={item} />}
 *   keyExtractor={(item) => item.id}
 * >
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 *
 * @example With Search and Sorting
 * ```tsx
 * <Table<Item, ColumnKey>
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   keyExtractor={keyExtractor}
 *   isItemInSearch={(item, searchString) =>
 *     item.name.toLowerCase().includes(searchString.toLowerCase())
 *   }
 *   compareItems={(a, b, { columnKey, order }) => {
 *     const multiplier = order === 'asc' ? 1 : -1;
 *     return a[columnKey].localeCompare(b[columnKey]) * multiplier;
 *   }}
 * >
 *   <Table.SearchBar />
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 *
 * @example With Filters
 * ```tsx
 * const filterConfig: FilterConfig = {
 *   status: {
 *     filterType: 'single-select',
 *     options: [
 *       { label: 'All', value: 'all' },
 *       { label: 'Active', value: 'active' },
 *       { label: 'Inactive', value: 'inactive' },
 *     ],
 *     default: 'all',
 *   },
 * };
 *
 * <Table<Item, ColumnKey>
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   keyExtractor={keyExtractor}
 *   filters={filterConfig}
 *   isItemInFilter={(item, filterValues) => {
 *     if (filterValues.includes('all')) return true;
 *     return filterValues.includes(item.status);
 *   }}
 * >
 *   <Table.FilterButtons />
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 *
 * @example Programmatic Control via Ref
 * ```tsx
 * const tableRef = useRef<TableHandle<Item, ColumnKey>>(null);
 *
 * // Programmatically update sorting
 * tableRef.current?.updateSorting({ columnKey: 'name', order: 'desc' });
 *
 * // Get current state
 * const sorting = tableRef.current?.getActiveSorting();
 *
 * <Table ref={tableRef} {...props}>
 *   <Table.Body />
 * </Table>
 * ```
 */
function Table<T, ColumnKey extends string = string, FilterKey extends string = string>({
    ref,
    data = [],
    columns,
    filters,
    compareItems,
    isItemInFilter,
    isItemInSearch,
    children,
    ...listProps
}: TableProps<T, ColumnKey, FilterKey>) {
    if (!columns || columns.length === 0) {
        throw new Error('Table columns must be provided');
    }

    const {middleware: filterMiddleware, currentFilters, methods: filterMethods} = useFiltering<T, FilterKey>({filters, isItemInFilter});

    const {middleware: searchMiddleware, activeSearchString, methods: searchMethods} = useSearching<T>({isItemInSearch});

    const {middleware: sortMiddleware, activeSorting, methods: sortMethods} = useSorting<T, ColumnKey>({compareItems});

    const processedData = [filterMiddleware, searchMiddleware, sortMiddleware].reduce((acc, middleware) => middleware(acc), data);

    const listRef = useRef<FlashListRef<T>>(null);

    const tableMethods: TableMethods<ColumnKey, FilterKey> = {
        ...filterMethods,
        ...sortMethods,
        ...searchMethods,
    };

    /**
     * Exposes table control methods through the ref.
     * Uses a Proxy to also forward FlashList methods (like scrollToIndex).
     */
    useImperativeHandle(ref, () => {
        return new Proxy(tableMethods, {
            get: (target, property) => {
                if (property in target) {
                    return target[property as keyof typeof target];
                }

                return listRef.current?.[property as keyof FlashListRef<T>];
            },
        }) as TableHandle<T, ColumnKey, FilterKey>;
    });

    const originalDataLength = data?.length ?? 0;

    // Check if filters are applied (not default values)
    const hasActiveFilters = filters
        ? (Object.keys(currentFilters) as FilterKey[]).some((key) => {
              const filterValue = currentFilters[key];
              const defaultValue = filters[key]?.default;
              return filterValue !== defaultValue;
          })
        : false;

    const hasSearchString = activeSearchString.trim().length > 0;
    const isEmptyResult = processedData.length === 0 && originalDataLength > 0 && (hasSearchString || hasActiveFilters);

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue: TableContextValue<T, ColumnKey, FilterKey> = {
        listRef,
        listProps,
        processedData,
        originalDataLength,
        columns,
        filterConfig: filters,
        activeFilters: currentFilters,
        activeSorting,
        activeSearchString,
        tableMethods,
        hasActiveFilters,
        hasSearchString,
        isEmptyResult,
    };

    return <TableContext.Provider value={contextValue as unknown as TableContextValue<unknown, string>}>{children}</TableContext.Provider>;
}

export default Table;
