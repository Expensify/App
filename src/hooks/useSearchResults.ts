import {useEffect, useState, useTransition} from 'react';
import CONST from '@src/CONST';
import usePrevious from './usePrevious';

/**
 * This hook filters (and optionally sorts) a dataset based on a search parameter.
 * It utilizes `useTransition` to allow the searchQuery to change rapidly, while more expensive renders that occur using
 * the result of the filtering and sorting are deprioritized, allowing them to happen in the background.
 */
function useSearchResults<TValue>(data: TValue[], filterData: (datum: TValue, searchInput: string) => boolean, sortData: (data: TValue[]) => TValue[] = (d) => d) {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState(data);
    const [, startTransition] = useTransition();
    const prevData = usePrevious(data);
    useEffect(() => {
        startTransition(() => {
            const normalizedSearchQuery = inputValue.trim().toLowerCase();
            const filtered = normalizedSearchQuery.length ? data.filter((item) => filterData(item, normalizedSearchQuery)) : data;
            const sorted = sortData(filtered);
            setResult(sorted);
        });
    }, [data, filterData, inputValue, sortData]);

    useEffect(() => {
        if (prevData.length <= CONST.SEARCH_ITEM_LIMIT || data.length > CONST.SEARCH_ITEM_LIMIT) {
            return;
        }
        setInputValue('');
    }, [data, prevData]);

    return [inputValue, setInputValue, result] as const;
}

export default useSearchResults;
