import {useState} from 'react';
import type {Middleware, MiddlewareHookResult} from './types';

type FilterConfigEntry = {
    filterType?: 'multi-select' | 'single-select';
    options: Array<{label: string; value: string}>;
    default?: string;
};

type FilterConfig<FilterKey extends string = string> = Record<FilterKey, FilterConfigEntry>;

type IsItemInFilterCallback<T> = (item: T, filters: string[]) => boolean;

type FilteringMethods<FilterKey extends string = string> = {
    updateFilter: (params: {key: FilterKey; value: unknown}) => void;
    getActiveFilters: () => Record<FilterKey, unknown>;
};

type UseFilteringProps<T, FilterKey extends string = string> = {
    filters?: FilterConfig<FilterKey>;
    isItemInFilter?: IsItemInFilterCallback<T>;
};

type UseFilteringResult<T, FilterKey extends string = string> = MiddlewareHookResult<T> & {
    currentFilters: Record<FilterKey, unknown>;
    methods: FilteringMethods<FilterKey>;
};

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

type FilteringMiddlewareParams<T, FilterKey extends string = string> = {
    data: T[];
    filters?: FilterConfig<FilterKey>;
    currentFilters: Record<FilterKey, unknown>;
    isItemInFilter?: IsItemInFilterCallback<T>;
};

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
