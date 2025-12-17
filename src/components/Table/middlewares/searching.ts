import {useState} from 'react';
import type {GetActiveSearchStringCallback} from '@components/Table/types';
import type {Middleware, MiddlewareHookResult} from './types';

type IsItemInSearchCallback<T> = (item: T, searchString: string) => boolean;

type UseSearchingProps<T> = {
    isItemInSearch?: IsItemInSearchCallback<T>;
};

type SearchingMethods = {
    updateSearchString: (value: string) => void;
    getActiveSearchString: () => string;
};

type UseSearchingResult<T> = MiddlewareHookResult<T> & {
    activeSearchString: string;
    updateSearchString: (searchString: string) => void;
    getActiveSearchString: GetActiveSearchStringCallback;
};

function useSearching<T>({isItemInSearch}: UseSearchingProps<T>): UseSearchingResult<T> {
    const [activeSearchString, updateSearchString] = useState('');

    const middleware: Middleware<T> = (data) => search({data, activeSearchString, isItemInSearch});

    const getActiveSearchString: GetActiveSearchStringCallback = () => {
        return activeSearchString;
    };

    return {middleware, activeSearchString, updateSearchString, getActiveSearchString};
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
