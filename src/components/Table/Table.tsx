import type {FlashListRef} from '@shopify/flash-list';
import React, {useImperativeHandle, useRef, useState} from 'react';
import TableContext from './TableContext';
import type {TableContextValue, UpdateFilterCallback} from './TableContext';
import type {ActiveSorting, GetActiveFiltersCallback, GetActiveSearchStringCallback, GetActiveSortingCallback, TableHandle, TableMethods, TableProps, ToggleSortingCallback} from './types';

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

    const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>(() => {
        const initialFilters: Record<string, unknown> = {};
        if (filters) {
            for (const key of Object.keys(filters) as FilterKey[]) {
                initialFilters[key] = filters[key].default;
            }
        }
        return initialFilters;
    });

    const updateFilter: UpdateFilterCallback = ({key, value}) => {
        setCurrentFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    let filteredData = data;
    if (filters) {
        filteredData = data.filter((item) => {
            const filterKeys = Object.keys(filters) as FilterKey[];

            return filterKeys.every((filterKey) => {
                const filterConfig = filters[filterKey];
                const filterValue = currentFilters[filterKey];

                // If filter value is empty/undefined, include the item
                if (filterValue === undefined || filterValue === null) {
                    return true;
                }

                // Handle multi-select filters (array values)
                if (filterConfig.filterType === 'multi-select') {
                    const filterValueArray = Array.isArray(filterValue) ? filterValue.filter((v): v is string => typeof v === 'string') : [];
                    if (filterValueArray.length === 0) {
                        return true;
                    }
                    // For multi-select, pass the array of selected values
                    return isItemInFilter?.(item, filterValueArray) ?? true;
                }

                // Handle single-select filters
                const singleValue = typeof filterValue === 'string' ? filterValue : '';
                return singleValue === '' || (isItemInFilter?.(item, [singleValue]) ?? true);
            });
        });
    }

    const [activeSearchString, updateSearchString] = useState('');

    let filteredAndSearchedData = filteredData;
    if (isItemInSearch && activeSearchString.trim()) {
        filteredAndSearchedData = filteredData.filter((item) => isItemInSearch(item, activeSearchString));
    }

    const [activeSorting, updateSorting] = useState<ActiveSorting<ColumnKey>>({columnKey: undefined, order: 'asc'});

    const toggleColumnSorting: ToggleSortingCallback<ColumnKey> = (columnKey) => {
        updateSorting((prevSorting) => ({columnKey: columnKey ?? prevSorting.columnKey, order: prevSorting.order === 'asc' ? 'desc' : 'asc'}));
    };

    // Apply sorting using comparator function
    let processedData = filteredAndSearchedData;
    if (activeSorting.columnKey && compareItems) {
        const sortedData = [...filteredAndSearchedData];
        sortedData.sort((a, b) => {
            return compareItems?.(a, b, activeSorting) ?? 0;
        });
        processedData = sortedData;
    }

    const getActiveSorting: GetActiveSortingCallback<ColumnKey> = () => {
        return activeSorting;
    };
    const getActiveFilters: GetActiveFiltersCallback<FilterKey> = () => {
        return currentFilters;
    };
    const getActiveSearchString: GetActiveSearchStringCallback = () => {
        return activeSearchString;
    };

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
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop as keyof typeof target];
                }

                return listRef.current?.[prop as keyof FlashListRef<T>];
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
