import {act, renderHook} from '@testing-library/react-native';

import type {IsItemInSearchCallback} from '@components/Table/middlewares/searching';
import useSearching from '@components/Table/middlewares/searching';

type TestItem = {
    keyForList: string;
    name: string;
};

const matchesName: IsItemInSearchCallback<TestItem> = (item, searchString) => item.name.toLowerCase().includes(searchString.toLowerCase());

function createItems(): TestItem[] {
    return [
        {keyForList: '1', name: 'Apple'},
        {keyForList: '2', name: 'Apricot'},
        {keyForList: '3', name: 'Banana'},
    ];
}

function renderSearching(isItemInSearch: IsItemInSearchCallback<TestItem> = matchesName) {
    return renderHook(({callback}: {callback: IsItemInSearchCallback<TestItem>}) => useSearching<TestItem>({isItemInSearch: callback}), {initialProps: {callback: isItemInSearch}});
}

describe('useSearching middleware', () => {
    it('returns the data as it is when there is no search string', () => {
        // Given a table that has not been searched
        const items = createItems();
        const {result} = renderSearching();

        // When the data goes through the searching middleware
        const searchedItems = result.current.middleware(items);

        // Then the very same array comes back, so nothing downstream has to treat it as new data
        expect(searchedItems).toBe(items);
    });

    it('keeps only the items that match the search string', () => {
        // Given a table that was searched for "ap"
        const items = createItems();
        const {result} = renderSearching();
        act(() => {
            result.current.methods.updateSearchString('ap');
        });

        // When the data goes through the searching middleware
        const searchedItems = result.current.middleware(items);

        // Then only the matching items are left
        expect(searchedItems.map((item) => item.name)).toEqual(['Apple', 'Apricot']);
    });

    it('returns the same array when the same data is searched again for the same string', () => {
        // Given a search whose result was already built. The table renders on every selection change, and a new array each time
        // made the caches keyed by that array miss, so every click filtered and sorted the whole list again.
        const items = createItems();
        const {result} = renderSearching();
        act(() => {
            result.current.methods.updateSearchString('ap');
        });
        const firstResult = result.current.middleware(items);

        // When the middleware runs again for the same data and the same search string
        const secondResult = result.current.middleware(items);

        // Then the earlier array is returned
        expect(secondResult).toBe(firstResult);
    });

    it('searches again when the search string changes', () => {
        // Given a search whose result was already built
        const items = createItems();
        const {result} = renderSearching();
        act(() => {
            result.current.methods.updateSearchString('ap');
        });
        const firstResult = result.current.middleware(items);

        // When the user types more of the string
        act(() => {
            result.current.methods.updateSearchString('apr');
        });
        const secondResult = result.current.middleware(items);

        // Then the result follows the new string instead of the cached one
        expect(secondResult).not.toBe(firstResult);
        expect(secondResult.map((item) => item.name)).toEqual(['Apricot']);
    });

    it('treats a change of surrounding spaces as the same search', () => {
        // Given a search that was already built
        const items = createItems();
        const {result} = renderSearching();
        act(() => {
            result.current.methods.updateSearchString('ap');
        });
        const firstResult = result.current.middleware(items);

        // When the same text is typed with a trailing space, which the middleware ignores anyway
        act(() => {
            result.current.methods.updateSearchString('ap ');
        });

        // Then the result is still the one that was already built
        expect(result.current.middleware(items)).toBe(firstResult);
    });

    it('searches again when the match callback changes', () => {
        // Given a search whose result was already built with one callback
        const items = createItems();
        const {result, rerender} = renderSearching();
        act(() => {
            result.current.methods.updateSearchString('ba');
        });
        const firstResult = result.current.middleware(items);

        // When the table gets a callback that matches on the key instead of the name
        const matchesKey: IsItemInSearchCallback<TestItem> = (item, searchString) => item.keyForList === searchString;
        rerender({callback: matchesKey});
        const secondResult = result.current.middleware(items);

        // Then the new callback decides the result
        expect(secondResult).not.toBe(firstResult);
        expect(secondResult).toEqual([]);
    });

    it('searches a new data array even when it holds the same items', () => {
        // Given a search whose result was already built
        const items = createItems();
        const {result} = renderSearching();
        act(() => {
            result.current.methods.updateSearchString('ap');
        });
        const firstResult = result.current.middleware(items);

        // When the source gives a new array with one more matching item
        const secondResult = result.current.middleware([...items, {keyForList: '4', name: 'Apple pie'}]);

        // Then the new item is in the result instead of the earlier array being returned
        expect(secondResult).not.toBe(firstResult);
        expect(secondResult.map((item) => item.name)).toEqual(['Apple', 'Apricot', 'Apple pie']);
    });
});
