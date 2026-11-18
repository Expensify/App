import {useState} from 'react';

import type {Middleware, MiddlewareHookResult} from './types';

/**
 * Callback to check if an item matches a search string.
 *
 * @template T - The type of items in the data array.
 * @param item - The item to check.
 * @param searchString - The search string to check against.
 * @returns True if the item matches the search string, false otherwise.
 */
type IsItemInSearchCallback<T> = (item: T, searchString: string) => boolean;

/**
 * Props for the searching middleware.
 *
 * @template T - The type of items in the data array.
 * @param isItemInSearch - The callback to check if an item matches a search string.
 * @returns The result of the searching middleware.
 */
type UseSearchingProps<T> = {
    isItemInSearch?: IsItemInSearchCallback<T>;
};

/**
 * Methods exposed by the table to control searching.
 *
 * @template T - The type of items in the data array.
 */
type SearchingMethods = {
    updateSearchString: (value: string) => void;
    getActiveSearchString: () => string;
};

/**
 * Result returned by the searching middleware.
 *
 * @template T - The type of items in the data array.
 */
type UseSearchingResult<T> = MiddlewareHookResult<T, SearchingMethods> & {
    activeSearchString: string;
    hasActiveSearchString: boolean;
};

/**
 * Provides functionality to search table data.
 *
 * @template T - The type of items in the data array.
 * @param isItemInSearch - The callback to check if an item matches a search string.
 * @returns The result of the searching middleware.
 */
function useSearching<T>({isItemInSearch}: UseSearchingProps<T>): UseSearchingResult<T> {
    const [activeSearchString, updateSearchString] = useState('');

    const middleware: Middleware<T> = (data) => search({data, activeSearchString, isItemInSearch});

    const getActiveSearchString: SearchingMethods['getActiveSearchString'] = () => {
        return activeSearchString;
    };

    const methods: SearchingMethods = {
        updateSearchString,
        getActiveSearchString,
    };

    const hasActiveSearchString = activeSearchString.trim().length > 0;

    return {middleware, activeSearchString, methods, hasActiveSearchString};
}

/**
 * Parameters for the searching middleware.
 *
 * @template T - The type of items in the data array.
 */
type SearchingMiddlewareParams<T> = {
    data: T[];
    activeSearchString: string;
    isItemInSearch?: IsItemInSearchCallback<T>;
};

type SearchedDataCacheEntry = {
    searchString: string;
    isItemInSearch: unknown;
    searchedData: unknown[];
};

// A search builds a new array on every render, which would defeat the sort and selection caches that are keyed by the array.
// The last result is kept per data array so those caches still hit when only the selection changed.
const searchedDataCache = new WeakMap<WeakKey, SearchedDataCacheEntry>();

/**
 * Searches table data based on a search string.
 *
 * @template T - The type of items in the data array.
 * @param data - The data to search.
 * @param activeSearchString - The active search string.
 * @param isItemInSearch - The callback to check if an item matches a search string.
 * @returns The filtered data.
 */
function search<T>({data, activeSearchString, isItemInSearch}: SearchingMiddlewareParams<T>): T[] {
    const trimmedSearchString = activeSearchString.trim();

    if (!isItemInSearch) {
        // Without a search callback, we keep all items.
        return data;
    }

    if (trimmedSearchString === '') {
        // Empty search string means no searching should be applied.
        return data;
    }

    const cachedEntry = searchedDataCache.get(data);
    if (cachedEntry && cachedEntry.searchString === trimmedSearchString && cachedEntry.isItemInSearch === isItemInSearch) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the entry was stored for this exact data array, so its items have the same type
        return cachedEntry.searchedData as T[];
    }

    const searchedData = data.filter((item) => isItemInSearch(item, trimmedSearchString));
    searchedDataCache.set(data, {searchString: trimmedSearchString, isItemInSearch, searchedData});

    return searchedData;
}

export default useSearching;
export type {SearchingMethods, IsItemInSearchCallback};
