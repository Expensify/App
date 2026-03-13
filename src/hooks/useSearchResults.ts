import {useDeferredValue, useEffect, useState} from 'react';
import CONST from '@src/CONST';
import usePrevious from './usePrevious';

const stableSortDataDefault = <TValue>(data: TValue[]) => data;

/**
 * This hook filters (and optionally sorts) a dataset based on a search parameter.
 * It utilizes `useDeferredValue` to allow the searchQuery to change rapidly, while more expensive renders that occur using
 * the result of the filtering and sorting are de-prioritized, allowing them to happen in the background.
 *
 * @param data - The dataset to filter and sort.
 * @param filterData - Predicate that decides whether a datum matches the current search input.
 * @param sortData - Optional comparator used to sort the filtered results. Defaults to identity (no sort).
 * @param preFilter - Optional filter applied before text search (e.g. group/category filter).
 */
function useSearchResults<TValue>(
    data: TValue[],
    filterData: (datum: TValue, searchInput: string) => boolean,
    sortData: (data: TValue[]) => TValue[] = stableSortDataDefault,
    preFilter?: (datum: TValue) => boolean,
) {
    const [inputValue, setInputValue] = useState('');
    const deferredInput = useDeferredValue(inputValue);
    const prevData = usePrevious(data);

    const searchQuery = inputValue.trim().length ? deferredInput : '';

    const base = preFilter ? data.filter(preFilter) : data;
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filtered = normalizedSearchQuery.length ? base.filter((item) => filterData(item, normalizedSearchQuery)) : [...base];
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
