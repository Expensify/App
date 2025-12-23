import {useState} from 'react';
import type {SetStateAction} from 'react';
import type {Middleware, MiddlewareHookResult} from './types';

/**
 * The sort order of a column in the table.
 */
type SortOrder = 'asc' | 'desc';

/**
 * The active sorting configuration of the table.
 *
 * @template ColumnKey - The type of column keys.
 */
type ActiveSorting<ColumnKey extends string = string> = {
    columnKey: ColumnKey | undefined;
    order: SortOrder;
};

/**
 * Callback to compare two items in the table.
 *
 * @template T - The type of items in the data array.
 * @template ColumnKey - The type of column keys.
 * @param a - The first item to compare.
 * @param b - The second item to compare.
 * @param sortingConfig - The active sorting configuration.
 * @returns A number indicating the sort order.
 */
type CompareItemsCallback<T, ColumnKey extends string = string> = (a: T, b: T, sortingConfig: ActiveSorting<ColumnKey>) => number;

/**
 * Methods exposed by the table to control sorting.
 *
 * @template ColumnKey - The type of column keys.
 */
type SortingMethods<ColumnKey extends string = string> = {
    /** Callback to update the sorting configuration. */
    updateSorting: (value: SetStateAction<ActiveSorting<ColumnKey>>) => void;

    /** Callback to toggle sorting for a specific column. */
    toggleColumnSorting: (columnKey?: ColumnKey) => void;

    /** Callback to get the active sorting configuration. */
    getActiveSorting: () => {
        columnKey: ColumnKey | undefined;
        order: SortOrder;
    };
};

/**
 * Props for the sorting middleware.
 *
 * @template T - The type of items in the data array.
 * @template ColumnKey - The type of column keys.
 * @param compareItems - The callback to compare two items in the table.
 * @returns The result of the sorting middleware.
 */
type UseSortingProps<T, ColumnKey extends string = string> = {
    compareItems?: CompareItemsCallback<T, ColumnKey>;
};

/**
 * Result returned by the sorting middleware.
 *
 * @template T - The type of items in the data array.
 * @template ColumnKey - The type of column keys.
 * @returns The result of the sorting middleware.
 */
type UseSortingResult<T, ColumnKey extends string = string> = MiddlewareHookResult<T, SortingMethods<ColumnKey>> & {
    activeSorting: ActiveSorting<ColumnKey>;
};

/**
 * Provides functionality to sort table data.
 *
 * @template T - The type of items in the data array.
 * @template ColumnKey - The type of column keys.
 * @param compareItems - The callback to compare two items in the table.
 * @returns The result of the sorting middleware.
 */
function useSorting<T, ColumnKey extends string = string>({compareItems}: UseSortingProps<T, ColumnKey>): UseSortingResult<T, ColumnKey> {
    const [activeSorting, updateSorting] = useState<ActiveSorting<ColumnKey>>({
        columnKey: undefined,
        order: 'asc',
    });

    const toggleColumnSorting: SortingMethods<ColumnKey>['toggleColumnSorting'] = (columnKey) => {
        updateSorting((previousSorting) => {
            const columnKeyToUse = columnKey ?? previousSorting.columnKey;
            const orderToUse = previousSorting.order === 'asc' ? 'desc' : 'asc';

            return {
                columnKey: columnKeyToUse,
                order: orderToUse,
            };
        });
    };

    const getActiveSorting: SortingMethods<ColumnKey>['getActiveSorting'] = () => {
        return activeSorting;
    };

    const middleware: Middleware<T> = (data) => sort({data, activeSorting, compareItems});

    const methods: SortingMethods<ColumnKey> = {
        updateSorting,
        toggleColumnSorting,
        getActiveSorting,
    };

    return {middleware, activeSorting, methods};
}

/**
 * Parameters for the sorting middleware.
 *
 * @template T - The type of items in the data array.
 * @template ColumnKey - The type of column keys.
 */
type SortMiddlewareParams<T, ColumnKey extends string = string> = {
    data: T[];
    activeSorting: ActiveSorting<ColumnKey>;
    compareItems?: CompareItemsCallback<T, ColumnKey>;
};

/**
 * Sorts table data based on the active sorting configuration.
 *
 * @template T - The type of items in the data array.
 * @template ColumnKey - The type of column keys.
 * @param data - The data to sort.
 * @param activeSorting - The active sorting configuration.
 * @param compareItems - The callback to compare two items in the table.
 * @returns The sorted data.
 */
function sort<T, ColumnKey extends string = string>({data, activeSorting, compareItems}: SortMiddlewareParams<T, ColumnKey>): T[] {
    const hasSortingColumn = !!activeSorting.columnKey;

    if (!hasSortingColumn || !compareItems) {
        // When no sorting is configured, return the data as is.
        return data;
    }

    const sortedData = [...data];

    sortedData.sort((firstItem, secondItem) => {
        return compareItems(firstItem, secondItem, activeSorting);
    });

    return sortedData;
}

export default useSorting;
export type {UseSortingProps, UseSortingResult, CompareItemsCallback, SortOrder, ActiveSorting, SortingMethods};
