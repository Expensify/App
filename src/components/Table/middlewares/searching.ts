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
    /** Callback to update the search string. */
    updateSearchString: (value: string) => void;

    /** Callback to get the active search string. */
    getActiveSearchString: () => string;
};

/**
 * Result returned by the searching middleware.
 *
 * @template T - The type of items in the data array.
 */
type UseSearchingResult<T> = MiddlewareHookResult<T, SearchingMethods> & {
    activeSearchString: string;
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

    return {middleware, activeSearchString, methods};
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

    return data.filter((item) => isItemInSearch(item, trimmedSearchString));
}

export default useSearching;
export type {UseSearchingProps, UseSearchingResult, SearchingMethods, IsItemInSearchCallback};
