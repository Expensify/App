import {act, renderHook} from '@testing-library/react-native';
import useSearchResults from '@hooks/useSearchResults';
import CONST from '@src/CONST';

type Item = {id: number; name: string};

const buildItems = (count: number, prefix = 'item'): Item[] => Array.from({length: count}, (_, i) => ({id: i, name: `${prefix}-${i}`}));

const filterByName = (item: Item, query: string) => item.name.toLowerCase().includes(query);

describe('useSearchResults', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('returns the full list when the input is empty', () => {
        const data = buildItems(5);
        const {result} = renderHook(() => useSearchResults(data, filterByName));

        expect(result.current[0]).toBe('');
        expect(result.current[2]).toEqual(data);
    });

    it('updates the input value immediately but defers filtering until the debounce settles', () => {
        const data = buildItems(5);
        const {result} = renderHook(() => useSearchResults(data, filterByName));

        act(() => {
            result.current[1]('item-2');
        });

        // The typed value is visible right away but the filtered result still reflects the full list.
        expect(result.current[0]).toBe('item-2');
        expect(result.current[2]).toEqual(data);

        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
        });

        expect(result.current[2]).toEqual([{id: 2, name: 'item-2'}]);
    });

    it('restores the full list instantly when the input is cleared, without waiting for the debounce', () => {
        const data = buildItems(5);
        const {result} = renderHook(() => useSearchResults(data, filterByName));

        act(() => {
            result.current[1]('item-2');
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
        });
        expect(result.current[2]).toHaveLength(1);

        act(() => {
            result.current[1]('');
        });
        expect(result.current[2]).toEqual(data);
    });

    it('applies the sort comparator to the filtered results', () => {
        const data: Item[] = [
            {id: 1, name: 'banana'},
            {id: 2, name: 'apple'},
            {id: 3, name: 'cherry'},
        ];
        const sortAlpha = (items: Item[]) => [...items].sort((a, b) => a.name.localeCompare(b.name));
        const {result} = renderHook(() => useSearchResults(data, filterByName, sortAlpha));

        expect(result.current[2].map((i) => i.name)).toEqual(['apple', 'banana', 'cherry']);
    });

    it('applies the preFilter before the text filter', () => {
        const data: Item[] = [
            {id: 1, name: 'apple-good'},
            {id: 2, name: 'apple-bad'},
            {id: 3, name: 'banana-good'},
        ];
        const preFilter = (item: Item) => item.name.endsWith('-good');
        const {result} = renderHook(() => useSearchResults(data, filterByName, undefined, preFilter));

        expect(result.current[2].map((i) => i.id)).toEqual([1, 3]);

        act(() => {
            result.current[1]('apple');
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
        });
        expect(result.current[2].map((i) => i.id)).toEqual([1]);
    });

    describe('auto-clear when data crosses SEARCH_ITEM_LIMIT', () => {
        const aboveLimit = CONST.SEARCH_ITEM_LIMIT + 5;
        const belowLimit = CONST.SEARCH_ITEM_LIMIT - 5;

        it('clears the input when the dataset shrinks from above the limit to at or below the limit', () => {
            const {result, rerender} = renderHook(({data}) => useSearchResults(data, filterByName), {
                initialProps: {data: buildItems(aboveLimit)},
            });

            act(() => {
                result.current[1]('item');
                jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
            });
            expect(result.current[0]).toBe('item');

            rerender({data: buildItems(belowLimit)});

            // The search bar is no longer shown for small datasets, so any leftover query must be wiped.
            expect(result.current[0]).toBe('');
        });

        it('does not clear the input when the dataset stays above the limit', () => {
            const {result, rerender} = renderHook(({data}) => useSearchResults(data, filterByName), {
                initialProps: {data: buildItems(aboveLimit)},
            });

            act(() => {
                result.current[1]('item');
                jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
            });

            rerender({data: buildItems(aboveLimit + 1)});

            expect(result.current[0]).toBe('item');
        });

        it('does not clear the input when the dataset stays at or below the limit', () => {
            const {result, rerender} = renderHook(({data}) => useSearchResults(data, filterByName), {
                initialProps: {data: buildItems(belowLimit)},
            });

            act(() => {
                result.current[1]('item');
                jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
            });

            rerender({data: buildItems(belowLimit - 1)});

            expect(result.current[0]).toBe('item');
        });
    });
});
