import type {FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import TableContext from './TableContext';
import type {TableContextValue, UpdateFilterCallback, UpdateSortingCallback} from './TableContext';
import type {ActiveSorting, GetActiveFiltersCallback, GetActiveSearchStringCallback, GetActiveSortingCallback, TableHandle, TableMethods, TableProps, ToggleSortingCallback} from './types';

// We want to allow the user to switch once between ascending and descending order.
// After that, sorting for a specific column will be reset.
const MAX_SORT_TOGGLE_COUNT = 1;

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

    const updateFilter: UpdateFilterCallback = useCallback(({key, value}) => {
        setCurrentFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    // Apply filters using predicate functions
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

    // Apply search using onSearch callback
    let filteredAndSearchedData = filteredData;
    if (isItemInSearch && activeSearchString.trim()) {
        filteredAndSearchedData = filteredData.filter((item) => isItemInSearch(item, activeSearchString));
    }

    const sortToggleCountRef = useRef(0);
    const [activeSorting, setActiveSorting] = useState<ActiveSorting<ColumnKey>>({columnKey: undefined, order: 'asc'});

    const updateSorting: UpdateSortingCallback<ColumnKey> = useCallback(({columnKey, order}) => {
        if (columnKey) {
            setActiveSorting({columnKey, order: order ?? 'asc'});
            return;
        }

        setActiveSorting({columnKey: undefined, order: 'asc'});
    }, []);

    const toggleSorting: ToggleSortingCallback<ColumnKey> = useCallback(
        (columnKey) => {
            if (!columnKey) {
                updateSorting({columnKey: undefined});
                sortToggleCountRef.current = 0;
                return;
            }

            setActiveSorting((currentSorting) => {
                if (columnKey !== currentSorting.columnKey) {
                    sortToggleCountRef.current = 0;
                    return {columnKey, order: 'asc'};
                }

                // Check current toggle count to decide if we should reset
                if (sortToggleCountRef.current >= MAX_SORT_TOGGLE_COUNT) {
                    // Reset sorting when max toggle count is reached
                    sortToggleCountRef.current = 0;
                    updateSorting({columnKey: undefined});
                    return {columnKey: undefined, order: 'asc'};
                }

                // Toggle the sort order
                sortToggleCountRef.current += 1;
                const newSortOrder = currentSorting.order === 'asc' ? 'desc' : 'asc';
                return {columnKey: currentSorting.columnKey, order: newSortOrder};
            });
        },
        [updateSorting],
    );

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
            toggleSorting,
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
        toggleSorting,
        updateSearchString,
    };

    return <TableContext.Provider value={contextValue as unknown as TableContextValue<unknown, string>}>{children}</TableContext.Provider>;
}

export default Table;
