import React, {useState} from 'react';
import TableContext from './TableContext';
import type {TableContextValue} from './TableContext';
import type {TableProps} from './types';

function Table<T>({data = [], filters, sortBy, onSearch, children, ...flatListProps}: TableProps<T>) {
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>(() => {
        const initialFilters: Record<string, unknown> = {};
        if (filters) {
            for (const key of Object.keys(filters)) {
                initialFilters[key] = filters[key].default;
            }
        }
        return initialFilters;
    });

    const [currentSortBy, setCurrentSortBy] = useState<string | undefined>(sortBy?.default);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchString, setSearchString] = useState('');

    const setFilter = (key: string, value: unknown) => {
        setFilterValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const setSortByHandler = (key: string, order: 'asc' | 'desc') => {
        setCurrentSortBy(key);
        setSortOrder(order);
    };

    const setSearchStringHandler = (value: string) => {
        setSearchString(value);
    };

    // Apply filters using predicate functions
    let filteredData = data;
    if (filters) {
        filteredData = data.filter((item) => {
            return Object.keys(filters).every((filterKey) => {
                const filterConfig = filters[filterKey];
                const filterValue = filterValues[filterKey];

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
                    return filterValueArray.some((value) => filterConfig.predicate(item, value));
                }

                // Handle single-select filters
                return filterConfig.predicate(item, filterValue);
            });
        });
    }

    // Apply search using onSearch callback
    let searchedData = filteredData;
    if (onSearch && searchString.trim()) {
        searchedData = onSearch(filteredData, searchString);
    }

    // Apply sorting using comparator function
    let filteredAndSortedData = searchedData;
    if (sortBy && currentSortBy) {
        const sortedData = [...searchedData];
        sortedData.sort((a, b) => {
            return sortBy.comparator(a, b, currentSortBy, sortOrder);
        });
        filteredAndSortedData = sortedData;
    }

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue: TableContextValue<T> = {
        filteredAndSortedData,
        filters: filterValues,
        sortBy: currentSortBy,
        sortOrder,
        searchString,
        setFilter,
        setSortBy: setSortByHandler,
        setSearchString: setSearchStringHandler,
        filterConfigs: filters,
        sortByConfig: sortBy,
        flatListProps,
    };

    return <TableContext.Provider value={contextValue as TableContextValue<unknown>}>{children}</TableContext.Provider>;
}

Table.displayName = 'Table';

export default Table;
