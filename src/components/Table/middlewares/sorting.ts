import {useState} from 'react';
import type {SetStateAction} from 'react';
import type {Middleware, MiddlewareHookResult} from './types';

type SortOrder = 'asc' | 'desc';

type ActiveSorting<ColumnKey extends string = string> = {
    columnKey: ColumnKey | undefined;
    order: SortOrder;
};

type CompareItemsCallback<T, ColumnKey extends string = string> = (a: T, b: T, sortingConfig: ActiveSorting<ColumnKey>) => number;

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

type UseSortingProps<T, ColumnKey extends string = string> = {
    compareItems?: CompareItemsCallback<T, ColumnKey>;
};

type UseSortingResult<T, ColumnKey extends string = string> = MiddlewareHookResult<T, SortingMethods<ColumnKey>> & {
    activeSorting: ActiveSorting<ColumnKey>;
};

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

type SortMiddlewareParams<T, ColumnKey extends string = string> = {
    data: T[];
    activeSorting: ActiveSorting<ColumnKey>;
    compareItems?: CompareItemsCallback<T, ColumnKey>;
};

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
