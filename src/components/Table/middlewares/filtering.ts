import {useState} from 'react';
import type {Middleware, MiddlewareHookResult} from './types';

/**
 * Configuration for a single table filter.
 *
 * @template FilterKey - The type of filter keys.
 */
type FilterConfigEntry = {
    showLabel?: boolean;
    filterType?: 'multi-select' | 'single-select';
    options: Array<{label: string; value: string}>;
    default?: string;
};

/**
 * Configuration for table filters.
 *
 * @template FilterKey - The type of filter keys.
 */
type FilterConfig<FilterKey extends string = string> = Record<FilterKey, FilterConfigEntry>;

/**
 * Callback to check if an item matches a filter.
 *
 * @template T - The type of items in the data array.
 * @param item - The item to check.
 * @param filters - The filters to check against.
 * @returns True if the item matches the filters, false otherwise.
 */
type IsItemInFilterCallback<T> = (item: T, filters: string[]) => boolean;

/**
 * Methods exposed by the table to control filtering.
 *
 * @template FilterKey - The type of filter keys.
 */
type FilteringMethods<FilterKey extends string = string> = {
    /** Callback to update a filter value. */
    updateFilter: (params: {key: FilterKey; value: unknown}) => void;

    /** Callback to get the active filters. */
    getActiveFilters: () => Record<FilterKey, unknown>;
};

/**
 * Props for the filtering middleware.
 *
 * @template T - The type of items in the data array.
 * @template FilterKey - The type of filter keys.
 */
type UseFilteringProps<T, FilterKey extends string = string> = {
    filters?: FilterConfig<FilterKey>;
    isItemInFilter?: IsItemInFilterCallback<T>;
};

/**
 * Result returned by the filtering middleware.
 *
 * @template T - The type of items in the data array.
 * @template FilterKey - The type of filter keys.
 */
type UseFilteringResult<T, FilterKey extends string = string> = MiddlewareHookResult<T, FilteringMethods<FilterKey>> & {
    currentFilters: Record<FilterKey, unknown>;
};

/**
 * Provides functionality to filter table data.
 *
 * @template T - The type of items in the data array.
 * @template FilterKey - The type of filter keys.
 * @param filters - The filters to use.
 * @param isItemInFilter - The callback to check if an item matches a filter.
 * @returns The result of the filtering middleware.
 */
function useFiltering<T, FilterKey extends string = string>({filters, isItemInFilter}: UseFilteringProps<T, FilterKey>): UseFilteringResult<T, FilterKey> {
    const [currentFilters, setCurrentFilters] = useState<Record<FilterKey, unknown>>(() => {
        const initialFilters = {} as Record<FilterKey, unknown>;

        if (filters) {
            for (const key of Object.keys(filters) as FilterKey[]) {
                initialFilters[key] = filters[key].default;
            }
        }

        return initialFilters;
    });

    const updateFilter: FilteringMethods<FilterKey>['updateFilter'] = ({key, value}) => {
        setCurrentFilters((previousFilters) => ({
            ...previousFilters,
            [key]: value,
        }));
    };

    const getActiveFilters: FilteringMethods<FilterKey>['getActiveFilters'] = () => {
        return currentFilters;
    };

    const middleware: Middleware<T> = (data) => filter({data, filters, currentFilters, isItemInFilter});

    const methods: FilteringMethods<FilterKey> = {
        updateFilter,
        getActiveFilters,
    };

    return {middleware, currentFilters, methods};
}

/**
 * Parameters for the filtering middleware.
 *
 * @template T - The type of items in the data array.
 * @template FilterKey - The type of filter keys.
 */
type FilteringMiddlewareParams<T, FilterKey extends string = string> = {
    data: T[];
    filters?: FilterConfig<FilterKey>;
    currentFilters: Record<FilterKey, unknown>;
    isItemInFilter?: IsItemInFilterCallback<T>;
};

/**
 * Filters table data based on the current filters.
 *
 * @template T - The type of items in the data array.
 * @template FilterKey - The type of filter keys.
 * @param data - The data to filter.
 * @param filters - The filters to use.
 * @param currentFilters - The current filters.
 * @param isItemInFilter - The callback to check if an item matches a filter.
 * @returns The filtered data.
 */
function filter<T, FilterKey extends string = string>({data, filters, currentFilters, isItemInFilter}: FilteringMiddlewareParams<T, FilterKey>): T[] {
    if (!filters) {
        // No filters configured, return original data.
        return data;
    }

    const filterKeys = Object.keys(filters) as FilterKey[];

    return data.filter((item) => {
        return filterKeys.every((filterKey) => {
            const filterConfig = filters[filterKey];
            const filterValue = currentFilters[filterKey];

            // When no filter value is set, we keep the item.
            if (filterValue === undefined || filterValue === null) {
                return true;
            }

            if (filterConfig.filterType === 'multi-select') {
                const selectedValues = Array.isArray(filterValue) ? filterValue.filter((value): value is string => typeof value === 'string') : [];

                if (selectedValues.length === 0) {
                    return true;
                }

                if (!isItemInFilter) {
                    // Without a filter callback, we do not exclude any items.
                    return true;
                }

                return isItemInFilter(item, selectedValues);
            }

            const singleValue = typeof filterValue === 'string' ? filterValue : '';

            if (singleValue === '') {
                return true;
            }

            if (!isItemInFilter) {
                // Without a filter callback, we do not exclude any items.
                return true;
            }

            return isItemInFilter(item, [singleValue]);
        });
    });
}

export default useFiltering;
export type {FilteringMiddlewareParams, UseFilteringProps, FilteringMethods, FilterConfig, FilterConfigEntry, IsItemInFilterCallback};
