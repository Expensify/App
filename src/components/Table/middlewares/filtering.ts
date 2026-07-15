import type {TableData} from '@components/Table/types';

import type CONST from '@src/CONST';
import {getObjectKeys, getObjectValues} from '@src/libs/ObjectUtils';

import type {ValueOf} from 'type-fest';

import {useCallback, useMemo, useState} from 'react';

import type {Middleware, MiddlewareHookResult} from './types';

/**
 * Configuration for a single table filter.
 */
type FilterConfigEntry = {
    label: string;
    filterType?: ValueOf<typeof CONST.TABLES.FILTER_TYPE>;
    options: Array<{label: string; value: string}>;
};

/**
 * Configuration for table filters.
 */
type FilterConfig<FilterKey extends string = string> = Record<FilterKey, FilterConfigEntry>;

/**
 * Callback to check if an item matches a filter.
 */
type IsItemInFilterCallback<DataType extends TableData> = (item: DataType, values: string[]) => boolean;

/**
 *  Methods exposed by the table to control filtering.
 */
type FilteringMethods<FilterKey extends string = string> = {
    /** Callback to update a filter value. */
    updateFilter: (params: {key: FilterKey; value: string[]}) => void;

    /** Callback to get the active filters. */
    getActiveFilters: () => Record<FilterKey, string[]>;
};

/**
 * Props for the filtering middleware.
 */
type UseFilteringProps<DataType extends TableData, FilterKey extends string = string> = {
    filters?: FilterConfig<FilterKey>;
    isItemInFilter?: IsItemInFilterCallback<DataType>;
};

/**
 * Result returned by the filtering middleware.
 */
type UseFilteringResult<DataType extends TableData, FilterKey extends string = string> = MiddlewareHookResult<DataType, FilteringMethods<FilterKey>> & {
    hasActiveFilters: boolean;
    currentFilters: Record<FilterKey, string[]>;
};

/**
 * Provides functionality to filter table data.
 */
function useFiltering<DataType extends TableData, FilterKey extends string = string>({
    filters,
    isItemInFilter,
}: UseFilteringProps<DataType, FilterKey>): UseFilteringResult<DataType, FilterKey> {
    const [currentFilters, setCurrentFilters] = useState<Record<FilterKey, string[]>>(() => {
        const initialFilters = {} as Record<FilterKey, string[]>;

        if (filters) {
            for (const key of getObjectKeys(filters)) {
                initialFilters[key] = [];
            }
        }

        return initialFilters;
    });

    const updateFilter: FilteringMethods<FilterKey>['updateFilter'] = useCallback(({key, value}) => {
        setCurrentFilters((previousFilters) => ({
            ...previousFilters,
            [key]: value,
        }));
    }, []);

    const getActiveFilters: FilteringMethods<FilterKey>['getActiveFilters'] = useCallback(() => currentFilters, [currentFilters]);

    const middleware: Middleware<DataType> = useCallback((data) => filter({data, filters, currentFilters, isItemInFilter}), [filters, currentFilters, isItemInFilter]);

    const methods: FilteringMethods<FilterKey> = useMemo(
        () => ({
            updateFilter,
            getActiveFilters,
        }),
        [updateFilter, getActiveFilters],
    );

    const hasActiveFilters = getObjectValues(currentFilters).some((filterValues) => filterValues.length > 0);

    return {middleware, currentFilters, hasActiveFilters, methods};
}

type FilteringMiddlewareParams<DataType extends TableData, FilterKey extends string = string> = {
    data: DataType[];
    filters?: FilterConfig<FilterKey>;
    currentFilters: Partial<Record<FilterKey, string[]>>;
    isItemInFilter?: IsItemInFilterCallback<DataType>;
};

// Filters table data based on the current filters.
function filter<DataType extends TableData, FilterKey extends string = string>({data, filters, currentFilters, isItemInFilter}: FilteringMiddlewareParams<DataType, FilterKey>): DataType[] {
    if (!filters) {
        // No filters configured, return original data.
        return data;
    }

    const filterKeys = getObjectKeys(filters);

    return data.filter((item) => {
        return filterKeys.every((filterKey) => {
            const filterValue = currentFilters[filterKey];

            // When no filter value is set, we keep the item.
            if (!filterValue?.length) {
                return true;
            }

            if (!isItemInFilter) {
                // Without a filter callback, we do not exclude any items.
                return true;
            }

            return isItemInFilter(item, filterValue);
        });
    });
}

export default useFiltering;
export type {FilteringMethods, FilterConfig, IsItemInFilterCallback};
