import type {FlashListRef} from '@shopify/flash-list';
import React, {useImperativeHandle, useRef, useState} from 'react';
import TableContext from './TableContext';
import type {TableContextValue, UpdateFilterCallback, UpdateSortingCallback} from './TableContext';
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

    const [sortToggleCount, setSortToggleCount] = useState(0);
    const [activeSorting, setActiveSorting] = useState<ActiveSorting<ColumnKey>>({columnKey: undefined, order: 'asc'});

    const updateSorting: UpdateSortingCallback<ColumnKey> = ({columnKey, order}) => {
        if (columnKey) {
            setActiveSorting({columnKey, order: order ?? 'asc'});
            return;
        }

        setActiveSorting({columnKey: undefined, order: 'asc'});
    };

    const toggleSorting: ToggleSortingCallback<ColumnKey> = (columnKey) => {
        if (!columnKey) {
            updateSorting({columnKey: undefined});
            setSortToggleCount(0);
            return;
        }

        if (columnKey !== activeSorting.columnKey) {
            updateSorting({columnKey, order: 'asc'});
            setSortToggleCount(0);
            return;
        }

        if (sortToggleCount >= 2) {
            updateSorting({columnKey: undefined});
            setSortToggleCount(0);
            return;
        }

        const newSortOrder = activeSorting.order === 'asc' ? 'desc' : 'asc';
        setSortToggleCount((prev) => prev + 1);
        updateSorting({columnKey: activeSorting.columnKey, order: newSortOrder});
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
        return new Proxy(
            {},
            {
                get: (_target, prop) => {
                    const property = prop as keyof TableMethods<ColumnKey, FilterKey>;

                    if (property === 'updateSorting') {
                        return updateSorting;
                    }
                    if (property === 'toggleSorting') {
                        return toggleSorting;
                    }
                    if (property === 'updateFilter') {
                        return updateFilter;
                    }
                    if (prop === 'updateSearchString') {
                        return updateSearchString;
                    }

                    if (property === 'getActiveSorting') {
                        return getActiveSorting;
                    }
                    if (property === 'getActiveFilters') {
                        return getActiveFilters;
                    }
                    if (property === 'getActiveSearchString') {
                        return getActiveSearchString;
                    }

                    return listRef.current?.[prop as keyof FlashListRef<T>];
                },
            },
        ) as TableHandle<T, ColumnKey, FilterKey>;
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

Table.displayName = 'Table';

export default Table;
