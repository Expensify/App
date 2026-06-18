import {useState} from 'react';
import type {ValueOf} from 'type-fest';
import type {TableData} from '@components/Table/types';
import CONST from '@src/CONST';
import type {Middleware, MiddlewareHookResult} from './types';

/**
 * Configuration for a single table filter.
 */
type FilterConfigEntry = {
    showLabel?: boolean;
    filterType?: ValueOf<typeof CONST.TABLES.FILTER_TYPE>;
    options: Array<{label: string; value: string}>;
    default?: string;
};

/**
 * Configuration for table filters.
 */
type FilterConfig<FilterKey extends string = string> = Record<FilterKey, FilterConfigEntry>;

/**
 * Callback to check if an item matches a filter.
 */
type IsItemInFilterCallback<DataType extends TableData> = (item: DataType, filters: string[]) => boolean;

/**
 *  Methods exposed by the table to control filtering.
 */
type FilteringMethods<FilterKey extends string = string> = {
    /** Callback to update a filter value. */
    updateFilter: (params: {key: FilterKey; value: unknown}) => void;

    /** Callback to get the active filters. */
    getActiveFilters: () => Record<FilterKey, unknown>;
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
    currentFilters: Record<FilterKey, unknown>;
};

/**
 * Provides functionality to filter table data.
 */
function useFiltering<DataType extends TableData, FilterKey extends string = string>({
    filters,
    isItemInFilter,
}: UseFilteringProps<DataType, FilterKey>): UseFilteringResult<DataType, FilterKey> {
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

    const middleware: Middleware<DataType> = (data) => filter({data, filters, currentFilters, isItemInFilter});

    const methods: FilteringMethods<FilterKey> = {
        updateFilter,
        getActiveFilters,
    };

    return {middleware, currentFilters, methods};
}

type FilteringMiddlewareParams<DataType extends TableData, FilterKey extends string = string> = {
    data: DataType[];
    filters?: FilterConfig<FilterKey>;
    currentFilters: Record<FilterKey, unknown>;
    isItemInFilter?: IsItemInFilterCallback<DataType>;
};

// Filters table data based on the current filters.
function filter<DataType extends TableData, FilterKey extends string = string>({data, filters, currentFilters, isItemInFilter}: FilteringMiddlewareParams<DataType, FilterKey>): DataType[] {
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

            if (filterConfig.filterType === CONST.TABLES.FILTER_TYPE.MULTI_SELECT) {
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
export type {FilteringMethods, FilterConfig, FilterConfigEntry, IsItemInFilterCallback};
