import {act, renderHook} from '@testing-library/react-native';

import type {CompareItemsCallback} from '@components/Table/middlewares/sorting';
import useSorting from '@components/Table/middlewares/sorting';

import CONST from '@src/CONST';

type TestItem = {
    keyForList: string;
    name: string;
};

const NAME_COLUMN_KEY = 'name';

const compareByName: CompareItemsCallback<TestItem> = (first, second, {order}) => {
    const comparison = first.name.localeCompare(second.name);
    return order === CONST.SEARCH.SORT_ORDER.ASC ? comparison : -comparison;
};

function createItems(): TestItem[] {
    return [
        {keyForList: '1', name: 'Charlie'},
        {keyForList: '2', name: 'Alpha'},
        {keyForList: '3', name: 'Bravo'},
    ];
}

function renderSorting(compareItems: CompareItemsCallback<TestItem> = compareByName) {
    return renderHook(
        ({compare}: {compare: CompareItemsCallback<TestItem>}) =>
            useSorting<TestItem>({
                compareItems: compare,
                initialSortColumn: NAME_COLUMN_KEY,
                initialSortOrder: CONST.SEARCH.SORT_ORDER.ASC,
                columnKeys: [NAME_COLUMN_KEY],
            }),
        {initialProps: {compare: compareItems}},
    );
}

describe('useSorting middleware', () => {
    it('keeps the chosen column and order when rerendering and invalidates the sorted-data cache', () => {
        // Given a table whose key order differs from its initial name order
        const items = createItems();
        const compareItems: CompareItemsCallback<TestItem> = (first, second, sorting) => {
            const columnKey = sorting.columnKey === 'keyForList' ? 'keyForList' : 'name';
            const comparison = first[columnKey].localeCompare(second[columnKey]);
            return sorting.order === CONST.SEARCH.SORT_ORDER.ASC ? comparison : -comparison;
        };
        const onSortingChange = jest.fn();
        const {result, rerender} = renderHook(() =>
            useSorting({
                compareItems,
                initialSortColumn: NAME_COLUMN_KEY,
                initialSortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                columnKeys: [NAME_COLUMN_KEY, 'keyForList'],
                onSortingChange,
            }),
        );
        expect(result.current.middleware(items).map((item) => item.name)).toEqual(['Charlie', 'Bravo', 'Alpha']);

        // When the user chooses a different column in the same order and rerenders the mounted table
        act(() => result.current.methods.updateSorting({columnKey: 'keyForList', order: CONST.SEARCH.SORT_ORDER.DESC}));
        rerender({});

        // Then neither rerendering nor the earlier cached result replaces the user's choice
        expect(result.current.activeSorting).toEqual({columnKey: 'keyForList', order: CONST.SEARCH.SORT_ORDER.DESC});
        expect(result.current.methods.getActiveSorting()).toEqual(result.current.activeSorting);
        expect(result.current.middleware(items).map((item) => item.name)).toEqual(['Bravo', 'Alpha', 'Charlie']);
        expect(onSortingChange).toHaveBeenCalledTimes(1);
    });

    it('falls back to the default column and order when a column disappears', () => {
        // Given a conditional column with a user-selected order different from the default
        const onSortingChange = jest.fn();
        const {result, rerender} = renderHook(
            ({columnKeys}: {columnKeys: string[]}) =>
                useSorting({
                    compareItems: compareByName,
                    initialSortColumn: NAME_COLUMN_KEY,
                    initialSortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    columnKeys,
                    onSortingChange,
                }),
            {initialProps: {columnKeys: [NAME_COLUMN_KEY, 'conditional']}},
        );
        const chosenSorting = {columnKey: 'conditional', order: CONST.SEARCH.SORT_ORDER.ASC};
        act(() => result.current.methods.updateSorting(chosenSorting));
        onSortingChange.mockClear();

        // When the conditional column disappears
        rerender({columnKeys: [NAME_COLUMN_KEY]});

        // Then the table derives the default without emitting a user change
        expect(result.current.activeSorting).toEqual({columnKey: NAME_COLUMN_KEY, order: CONST.SEARCH.SORT_ORDER.DESC});
        expect(onSortingChange).not.toHaveBeenCalled();

        // When the column returns, the derived fallback has not overwritten the stored choice
        rerender({columnKeys: [NAME_COLUMN_KEY, 'conditional']});

        // Then the original user selection is active again
        expect(result.current.activeSorting).toEqual(chosenSorting);
    });

    it('sorts the data by the active column without changing the original array', () => {
        // Given a table sorted by name ascending
        const items = createItems();
        const {result} = renderSorting();

        // When the data goes through the sorting middleware
        const sortedItems = result.current.middleware(items);

        // Then the items are ordered by name, and the array the caller passed in is left as it was so its owner isn't surprised
        expect(sortedItems.map((item) => item.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
        expect(items.map((item) => item.name)).toEqual(['Charlie', 'Alpha', 'Bravo']);
    });

    it('returns the same sorted array when the same data is sorted again', () => {
        // Given data that was already sorted once. The table renders on every selection change, and re-sorting a very large
        // list each time made every click slow.
        const items = createItems();
        const {result} = renderSorting();
        const firstResult = result.current.middleware(items);

        // When the middleware runs again for the same data, as it does when only the selection changed
        const secondResult = result.current.middleware(items);

        // Then the earlier result is reused, which also keeps the row identities downstream stable
        expect(secondResult).toBe(firstResult);
    });

    it('sorts again when the sort order changes', () => {
        // Given data sorted ascending
        const items = createItems();
        const {result} = renderSorting();
        const ascendingResult = result.current.middleware(items);

        // When the user flips the order of the same column
        act(() => {
            result.current.methods.toggleColumnSorting(NAME_COLUMN_KEY);
        });
        const descendingResult = result.current.middleware(items);

        // Then the cached ascending result isn't returned for the new order
        expect(descendingResult).not.toBe(ascendingResult);
        expect(descendingResult.map((item) => item.name)).toEqual(['Charlie', 'Bravo', 'Alpha']);
    });

    it('sorts again when the compare callback changes', () => {
        // Given data sorted with one compare callback
        const items = createItems();
        const {result, rerender} = renderSorting();
        const firstResult = result.current.middleware(items);

        // When the table is rendered with a different compare callback that orders by key instead of name
        const compareByKey: CompareItemsCallback<TestItem> = (first, second) => first.keyForList.localeCompare(second.keyForList);
        rerender({compare: compareByKey});
        const secondResult = result.current.middleware(items);

        // Then the order follows the new callback instead of the cached one
        expect(secondResult).not.toBe(firstResult);
        expect(secondResult.map((item) => item.keyForList)).toEqual(['1', '2', '3']);
    });

    it('sorts a new data array even when it holds the same items', () => {
        // Given data that was sorted once
        const items = createItems();
        const {result} = renderSorting();
        const firstResult = result.current.middleware(items);

        // When the source gives a new array, which is how a change to the data reaches the table
        const secondResult = result.current.middleware([...items, {keyForList: '4', name: 'Delta'}]);

        // Then the new item is part of the result instead of the earlier one being returned
        expect(secondResult).not.toBe(firstResult);
        expect(secondResult.map((item) => item.name)).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);
    });
});
