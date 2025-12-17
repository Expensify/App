import type {FlashListRef} from '@shopify/flash-list';
import React, {useImperativeHandle, useRef} from 'react';
import type {Middleware} from './middlewares/types';
import useFiltering from './middlewares/useFiltering';
import useSearching from './middlewares/useSearching';
import useSorting from './middlewares/useSorting';
import TableContext from './TableContext';
import type {TableContextValue} from './TableContext';
import type {GetActiveFiltersCallback, GetActiveSearchStringCallback, TableHandle, TableMethods, TableProps} from './types';

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

    const {middleware: filterMiddleware, currentFilters, updateFilter} = useFiltering<T, FilterKey>({filters, isItemInFilter});

    const {middleware: searchMiddleware, activeSearchString, updateSearchString} = useSearching<T>({isItemInSearch});

    const {middleware: sortMiddleware, activeSorting, updateSorting, toggleColumnSorting, getActiveSorting} = useSorting<T, ColumnKey>({compareItems});

    const processedData = [filterMiddleware, searchMiddleware, sortMiddleware].reduce((acc, middleware) => middleware(acc), data);

    const listRef = useRef<FlashListRef<T>>(null);

    useImperativeHandle(ref, () => {
        const customMethods: TableMethods<ColumnKey, FilterKey> = {
            updateSorting,
            toggleColumnSorting,
            updateFilter,
            updateSearchString,
            getActiveSorting,
            getActiveFilters,
            getActiveSearchString,
        };

        return new Proxy(customMethods, {
            get: (target, property) => {
                if (property in target) {
                    return target[property as keyof typeof target];
                }

                return listRef.current?.[property as keyof FlashListRef<T>];
            },
        }) as TableHandle<T, ColumnKey, FilterKey>;
    });

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue: TableContextValue<T, ColumnKey> = {
        listRef,
        listProps,
        processedData,
        originalDataLength: data?.length ?? 0,
        columns,
        filterConfig: filters,
        activeFilters: currentFilters,
        activeSorting,
        activeSearchString,
        updateFilter,
        updateSorting,
        toggleColumnSorting,
        updateSearchString,
    };

    return <TableContext.Provider value={contextValue as unknown as TableContextValue<unknown, string>}>{children}</TableContext.Provider>;
}

export default Table;
