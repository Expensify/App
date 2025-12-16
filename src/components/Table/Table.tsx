import React, {useState} from 'react';
import TableContext from './TableContext';
import type {TableContextValue, UpdateFilterCallback, UpdateSortingCallback} from './TableContext';
import type {TableProps} from './types';

function Table<T, ColumnKey extends string = string>({data = [], columns, filters, compareItems, isItemInFilter, isItemInSearch, children, ...flatListProps}: TableProps<T, ColumnKey>) {
    if (!columns || columns.length === 0) {
        throw new Error('Table columns must be provided');
    }

    const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>(() => {
        return {};

        // const initialFilters: Record<string, unknown> = {};
        // if (filters) {
        //     for (const key of Object.keys(filters)) {
        //         initialFilters[key] = filters[key].default;
        //     }
        // }
        // return initialFilters;
    });

    const [sortColumn, setSortColumn] = useState<ColumnKey | undefined>();
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchString, setSearchString] = useState('');

    const updateFilter: UpdateFilterCallback = ({key, value}) => {
        setCurrentFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const updateSorting: UpdateSortingCallback<ColumnKey> = ({columnKey, order}) => {
        if (columnKey) {
            setSortColumn(columnKey);
            setSortOrder(order ?? 'asc');
            return;
        }

        setSortColumn(undefined);
        setSortOrder('asc');
    };

    // Apply filters using predicate functions
    let filteredData = data;
    if (filters) {
        filteredData = data.filter((item) => {
            return Object.keys(filters).every((filterKey) => {
                const filterConfig = filters[filterKey];
                // const filterValue = filterValues[filterKey];
                const filterValue = undefined;

                // If filter value is empty/undefined, include the item
                if (filterValue === undefined || filterValue === null) {
                    return true;
                }

                // Handle multi-select filters (array values)
                if (filterConfig.filterType === 'multi-select') {
                    const filterValueArray = Array.isArray(filterValue) ? filterValue : [];
                    if (filterValueArray.length === 0) {
                        return true;
                    }
                    // For multi-select, item passes if it matches any selected value
                    return filterValueArray.some((value) => isItemInFilter?.(item, value) ?? true);
                }

                // Handle single-select filters
                return isItemInFilter?.(item, filterValue) ?? true;
            });
        });
    }

    // Apply search using onSearch callback
    let searchedData = filteredData;
    if (isItemInSearch && searchString.trim()) {
        searchedData = filteredData.filter((item) => isItemInSearch(item, searchString));
    }

    // Apply sorting using comparator function
    let filteredAndSortedData = searchedData;
    if (sortColumn) {
        const sortedData = [...searchedData];
        sortedData.sort((a, b) => {
            return compareItems?.(a, b, sortColumn, sortOrder) ?? 0;
        });
        filteredAndSortedData = sortedData;
    }

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue: TableContextValue<T, ColumnKey> = {
        filteredAndSortedData,
        columns,
        currentFilters,
        sortColumn,
        sortOrder,
        searchString,
        updateFilter,
        updateSorting,
        updateSearchString: setSearchString,
        filterConfig: filters,
        flatListProps,
    };

    return <TableContext.Provider value={contextValue as unknown as TableContextValue<unknown, string>}>{children}</TableContext.Provider>;
}

Table.displayName = 'Table';

export default Table;
