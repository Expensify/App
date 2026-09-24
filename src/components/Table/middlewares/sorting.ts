import CONST from '@src/CONST';

import type {SetStateAction} from 'react';
import type {ValueOf} from 'type-fest';

import {useState} from 'react';

import type {Middleware, MiddlewareHookResult} from './types';

/**
 * The sort order of a column in the table.
 */
type SortOrder = ValueOf<typeof CONST.SEARCH.SORT_ORDER>;

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
 * @param initialSortColumn - The initial column to sort by on mount.
 * @returns The result of the sorting middleware.
 */
type UseSortingProps<T, ColumnKey extends string = string> = {
    compareItems?: CompareItemsCallback<T, ColumnKey>;
    initialSortColumn?: ColumnKey;
    initialSortOrder?: SortOrder;
    narrowLayoutSortColumn?: ColumnKey;
    shouldUseNarrowTableLayout?: boolean;
    onSortingChange?: (sorting: ActiveSorting<ColumnKey>) => void;

    /** Keys of the columns currently rendered, so sorting can fall back once its active column is no longer one of them. */
    columnKeys: ColumnKey[];
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
 * Resolves the sorting configuration that should actually be applied, forcing `narrowLayoutSortColumn`
 * when the table is in narrow layout.
 *
 * This is a standalone top-level function (rather than being inlined in the `useMemo` callback) because
 * OXC's React Compiler currently fails to compile a component/hook when a generic type expression
 * referencing the function's own type parameters (e.g. `satisfies ActiveSorting<ColumnKey>`) appears
 * inside a nested closure. That bailout is silent (no build warning) and disables automatic memoization
 * for the entire file.
 *
 * @template ColumnKey - The type of column keys.
 */
function resolveActiveSorting<ColumnKey extends string = string>(
    shouldUseNarrowTableLayout: boolean | undefined,
    narrowLayoutSortColumn: ColumnKey | undefined,
    userSorting: ActiveSorting<ColumnKey>,
    columnKeys: ColumnKey[],
    initialSortColumn: ColumnKey | undefined,
): ActiveSorting<ColumnKey> {
    if (shouldUseNarrowTableLayout) {
        // Narrow layouts drop columns for space rather than because the data lost them, so the fallback below must not
        // run here. Otherwise resizing past the breakpoint would silently discard the sort the user picked.
        return narrowLayoutSortColumn ? {columnKey: narrowLayoutSortColumn, order: 'asc'} : userSorting;
    }

    // A column that stops being rendered (e.g. a conditional column loses its last value) can leave the table sorted
    // by a key no header shows an arrow for. Falling back to the initial column keeps the sort visible and correct.
    if (userSorting.columnKey && !columnKeys.includes(userSorting.columnKey)) {
        return {columnKey: initialSortColumn, order: 'asc'};
    }

    return userSorting;
}

/**
 * Provides functionality to sort table data.
 *
 * @template T - The type of items in the data array.
 * @template ColumnKey - The type of column keys.
 * @param compareItems - The callback to compare two items in the table.
 * @param initialSortColumn - The initial column to sort by on mount.
 * @returns The result of the sorting middleware.
 */
function useSorting<T, ColumnKey extends string = string>({
    compareItems,
    initialSortColumn,
    initialSortOrder = CONST.SEARCH.SORT_ORDER.ASC,
    narrowLayoutSortColumn,
    shouldUseNarrowTableLayout,
    onSortingChange,
    columnKeys,
}: UseSortingProps<T, ColumnKey>): UseSortingResult<T, ColumnKey> {
    const [userSorting, setUserSorting] = useState<ActiveSorting<ColumnKey>>({
        columnKey: initialSortColumn,
        order: initialSortOrder,
    });

    const activeSorting = resolveActiveSorting(shouldUseNarrowTableLayout, narrowLayoutSortColumn, userSorting, columnKeys, initialSortColumn);

    const updateSorting: SortingMethods<ColumnKey>['updateSorting'] = (value) => {
        const newSorting = typeof value === 'function' ? value(userSorting) : value;
        setUserSorting(newSorting);
        onSortingChange?.(newSorting);
    };

    const toggleColumnSorting: SortingMethods<ColumnKey>['toggleColumnSorting'] = (columnKey) => {
        // Flipped from the sorting the headers actually show rather than the stored one, which the fallback above can
        // diverge from. Otherwise the first press after a column disappears asks for the order already on screen.
        updateSorting({
            columnKey: columnKey ?? activeSorting.columnKey,
            order: activeSorting.order === 'asc' ? 'desc' : 'asc',
        });
    };

    const getActiveSorting: SortingMethods<ColumnKey>['getActiveSorting'] = () => activeSorting;

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
export type {CompareItemsCallback, ActiveSorting, SortingMethods, SortOrder};
