import {act, renderHook} from '@testing-library/react-native';

import type {FilterConfig, IsItemInFilterCallback} from '@components/Table/middlewares/filtering';
import useFiltering from '@components/Table/middlewares/filtering';
import type {TableData} from '@components/Table/types';

type TestItem = TableData & {
    status: string;
};

type TestFilterKey = 'status';

const FILTERS: FilterConfig<TestFilterKey> = {
    status: {label: 'Status', options: [{label: 'Open', value: 'open'}]},
};

type IsItemInFilter = IsItemInFilterCallback<TestItem>;

const matchesStatus: IsItemInFilter = (item, values) => values.length === 0 || values.includes(item.status);

function createItems(): TestItem[] {
    return [
        {keyForList: '1', status: 'open'},
        {keyForList: '2', status: 'closed'},
        {keyForList: '3', status: 'open'},
    ];
}

function renderFiltering(filters?: FilterConfig<TestFilterKey>, isItemInFilter: IsItemInFilter = matchesStatus) {
    return renderHook(
        ({configuredFilters, callback}: {configuredFilters?: FilterConfig<TestFilterKey>; callback: IsItemInFilter}) =>
            useFiltering<TestItem, TestFilterKey>({filters: configuredFilters, isItemInFilter: callback}),
        {initialProps: {configuredFilters: filters, callback: isItemInFilter}},
    );
}

describe('useFiltering middleware', () => {
    it('returns the data as it is when no filters are configured', () => {
        // Given a table without any filter configuration
        const items = createItems();
        const {result} = renderFiltering(undefined);

        // When the data goes through the filtering middleware
        const filteredItems = result.current.middleware(items);

        // Then the very same array comes back
        expect(filteredItems).toBe(items);
    });

    it('keeps only the items that match the selected filter values', () => {
        // Given a table filtered to open items
        const items = createItems();
        const {result} = renderFiltering(FILTERS);
        act(() => {
            result.current.methods.updateFilter({key: 'status', value: ['open']});
        });

        // When the data goes through the filtering middleware
        const filteredItems = result.current.middleware(items);

        // Then the closed item is left out
        expect(filteredItems.map((item) => item.keyForList)).toEqual(['1', '3']);
    });

    it('returns the same array when the same data is filtered again with the same filters', () => {
        // Given filters whose result was already built. The table renders on every selection change, and a new array each time
        // made the caches keyed by that array miss, so every click filtered and sorted the whole list again.
        const items = createItems();
        const {result} = renderFiltering(FILTERS);
        act(() => {
            result.current.methods.updateFilter({key: 'status', value: ['open']});
        });
        const firstResult = result.current.middleware(items);

        // When the middleware runs again for the same data
        const secondResult = result.current.middleware(items);

        // Then the earlier array is returned
        expect(secondResult).toBe(firstResult);
    });

    it('filters again when the selected filter values change', () => {
        // Given filters whose result was already built
        const items = createItems();
        const {result} = renderFiltering(FILTERS);
        act(() => {
            result.current.methods.updateFilter({key: 'status', value: ['open']});
        });
        const firstResult = result.current.middleware(items);

        // When the user picks another value
        act(() => {
            result.current.methods.updateFilter({key: 'status', value: ['closed']});
        });
        const secondResult = result.current.middleware(items);

        // Then the result follows the new values instead of the cached one
        expect(secondResult).not.toBe(firstResult);
        expect(secondResult.map((item) => item.keyForList)).toEqual(['2']);
    });

    it('filters again when the filter callback changes', () => {
        // Given filters whose result was already built with one callback
        const items = createItems();
        const {result, rerender} = renderFiltering(FILTERS);
        act(() => {
            result.current.methods.updateFilter({key: 'status', value: ['open']});
        });
        const firstResult = result.current.middleware(items);

        // When the table gets a callback that rejects every item
        const rejectsEverything: IsItemInFilter = () => false;
        rerender({configuredFilters: FILTERS, callback: rejectsEverything});
        const secondResult = result.current.middleware(items);

        // Then the new callback decides the result
        expect(secondResult).not.toBe(firstResult);
        expect(secondResult).toEqual([]);
    });

    it('filters a new data array even when it holds the same items', () => {
        // Given filters whose result was already built
        const items = createItems();
        const {result} = renderFiltering(FILTERS);
        act(() => {
            result.current.methods.updateFilter({key: 'status', value: ['open']});
        });
        const firstResult = result.current.middleware(items);

        // When the source gives a new array with one more open item
        const secondResult = result.current.middleware([...items, {keyForList: '4', status: 'open'}]);

        // Then the new item is in the result instead of the earlier array being returned
        expect(secondResult).not.toBe(firstResult);
        expect(secondResult.map((item) => item.keyForList)).toEqual(['1', '3', '4']);
    });
});
