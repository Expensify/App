import {useDeferredValue, useEffect, useState} from 'react';
import CONST from '@src/CONST';
import usePrevious from './usePrevious';

/**
 * This hook filters (and optionally sorts) a dataset based on a search parameter.
 * It utilizes `useDeferredValue` to allow the searchQuery to change rapidly, while more expensive renders that occur using
 * the result of the filtering and sorting are de-prioritized, allowing them to happen in the background.
 */
function useSearchResults<TValue>(data: TValue[], filterData: (datum: TValue, searchInput: string) => boolean, sortData: (data: TValue[]) => TValue[] = (d) => d) {
    const [inputValue, setInputValue] = useState('');
    const deferredInput = useDeferredValue(inputValue);
    const prevData = usePrevious(data);

    const searchQuery = inputValue.trim().length ? deferredInput : '';

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filtered = normalizedSearchQuery.length ? data.filter((item) => filterData(item, normalizedSearchQuery)) : [...data];
    const result = sortData(filtered);

    useEffect(() => {
        if (prevData.length <= CONST.SEARCH_ITEM_LIMIT || data.length > CONST.SEARCH_ITEM_LIMIT) {
            return;
        }
        setInputValue('');
    }, [data.length, prevData.length]);

    return [inputValue, setInputValue, result] as const;
}

export default useSearchResults;
