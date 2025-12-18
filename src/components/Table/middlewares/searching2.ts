import {useState} from 'react';
import type {Middleware, MiddlewareHookResult} from './types';

type IsItemInSearchCallback<T> = (item: T, searchString: string) => boolean;

type UseSearchingProps<T> = {
    isItemInSearch?: IsItemInSearchCallback<T>;
};

type SearchingMethods = {
    /** Callback to update the search string. */
    updateSearchString: (value: string) => void;

    /** Callback to get the active search string. */
    getActiveSearchString: () => string;
};

type UseSearchingResult<T> = MiddlewareHookResult<T, SearchingMethods> & {
    activeSearchString: string;
};

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

type SearchingMiddlewareParams<T> = {
    data: T[];
    activeSearchString: string;
    isItemInSearch?: IsItemInSearchCallback<T>;
};

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
