import React, {useState} from 'react';
import TableContext from './TableContext';
import type {TableContextValue, UpdateFilterCallback, UpdateSortingCallback} from './TableContext';
import type {TableProps} from './types';

function Table<T, ColumnKey extends string = string>({data = [], columns, filters, compareItems, isItemInFilter, isItemInSearch, children, ...listProps}: TableProps<T, ColumnKey>) {
    if (!columns || columns.length === 0) {
        throw new Error('Table columns must be provided');
    }

    const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>(() => {
        const initialFilters: Record<string, unknown> = {};
        if (filters) {
            for (const key of Object.keys(filters)) {
                initialFilters[key] = filters[key].default;
            }
        }
        return initialFilters;
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
        originalDataLength: data?.length ?? 0,
        columns,
        currentFilters,
        sortColumn,
        sortOrder,
        searchString,
        updateFilter,
        updateSorting,
        updateSearchString: setSearchString,
        filterConfig: filters,
        listProps,
    };

    return <TableContext.Provider value={contextValue as unknown as TableContextValue<unknown, string>}>{children}</TableContext.Provider>;
}

Table.displayName = 'Table';

export default Table;
