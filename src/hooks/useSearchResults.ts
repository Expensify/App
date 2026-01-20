import {useEffect, useState, useTransition} from 'react';
import type {ListItem} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import usePrevious from './usePrevious';

/**
 * This hook filters (and optionally sorts) a dataset based on a search parameter.
 * It utilizes `useTransition` to allow the searchQuery to change rapidly, while more expensive renders that occur using
 * the result of the filtering and sorting are de-prioritized, allowing them to happen in the background.
 */
function useSearchResults<TValue extends ListItem>(data: TValue[], filterData: (datum: TValue, searchInput: string) => boolean, sortData: (data: TValue[]) => TValue[] = (d) => d) {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState(() => sortData(data));
    const prevData = usePrevious(data);
    const [, startTransition] = useTransition();
    useEffect(() => {
        startTransition(() => {
            const normalizedSearchQuery = inputValue.trim().toLowerCase();

            // Create shallow copy of data to prevent mutation. When no search query exists, we pass the full dataset
            // to sortData. If sortData uses Array.sort() (which sorts in place and returns the same reference),
            // the original data array would be mutated. This breaks React's reference equality check in setResult,
            // preventing re-renders even when the sort order changes (e.g., on page refresh).
            const filtered = normalizedSearchQuery.length ? data.filter((item) => filterData(item, normalizedSearchQuery)) : [...data];
            const sorted = sortData(filtered);
            setResult(sorted);
        });
    }, [data, filterData, inputValue, sortData]);

    useEffect(() => {
        if (prevData.length <= CONST.SEARCH_ITEM_LIMIT || data.length > CONST.SEARCH_ITEM_LIMIT) {
            return;
        }
        setInputValue('');
    }, [data.length, prevData.length]);

    return [inputValue, setInputValue, result] as const;
}

export default useSearchResults;
