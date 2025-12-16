import React, {useCallback, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {TableContext} from './TableContext';
import type {FilterConfig, SortByConfig} from './TableContext';

type TableProps<T> = {
    data: T[];
    filters?: Record<string, FilterConfig>;
    sortBy?: SortByConfig;
    onSearch?: (items: T[], searchString: string) => T[];
    children: ReactNode;
};

function Table<T>({data, filters, sortBy, onSearch, children}: TableProps<T>) {
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

    const setFilter = useCallback((key: string, value: unknown) => {
        setFilterValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const setSortByHandler = useCallback((key: string, order: 'asc' | 'desc') => {
        setCurrentSortBy(key);
        setSortOrder(order);
    }, []);

    const setSearchStringHandler = useCallback((value: string) => {
        setSearchString(value);
    }, []);

    // Apply filters using predicate functions
    const filteredData = useMemo(() => {
        if (!filters) {
            return data;
        }

        return data.filter((item) => {
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
    }, [data, filters, filterValues]);

    // Apply search using onSearch callback
    const searchedData = useMemo(() => {
        if (!onSearch || !searchString.trim()) {
            return filteredData;
        }
        return onSearch(filteredData, searchString);
    }, [filteredData, onSearch, searchString]);

    // Apply sorting using comparator function
    const filteredAndSortedData = useMemo(() => {
        if (!sortBy || !currentSortBy) {
            return searchedData;
        }

        const sortedData = [...searchedData];
        sortedData.sort((a, b) => {
            return sortBy.comparator(a, b, currentSortBy, sortOrder);
        });

        return sortedData;
    }, [searchedData, sortBy, currentSortBy, sortOrder]);

    const contextValue = useMemo(
        () => ({
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
        }),
        [filteredAndSortedData, filterValues, currentSortBy, sortOrder, searchString, setFilter, setSortByHandler, setSearchStringHandler, filters, sortBy],
    );

    return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
}

Table.displayName = 'Table';

export default Table;
