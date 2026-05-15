import {useEffect} from 'react';
import CONST from '@src/CONST';
import useDebouncedState from './useDebouncedState';
import usePrevious from './usePrevious';

const stableSortDataDefault = <TValue>(data: TValue[]) => data;

/**
 * This hook filters (and optionally sorts) a dataset based on a search parameter.
 * The search input updates immediately for instant UI feedback, while the value used for
 * filtering is debounced so expensive filter/sort work runs at most once per debounce window.
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
    const [inputValue, debouncedInput, setInputValue] = useDebouncedState('', CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
    const prevData = usePrevious(data);

    const searchQuery = inputValue.trim().length ? debouncedInput : '';

    const base = preFilter ? data.filter(preFilter) : data;
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filtered = normalizedSearchQuery.length ? base.filter((item) => filterData(item, normalizedSearchQuery)) : [...base];
    const result = sortData(filtered);

    useEffect(() => {
        if (prevData.length <= CONST.SEARCH_ITEM_LIMIT || data.length > CONST.SEARCH_ITEM_LIMIT) {
            return;
        }
        setInputValue('');
    }, [data.length, prevData.length, setInputValue]);

    return [inputValue, setInputValue, result] as const;
}

export default useSearchResults;
