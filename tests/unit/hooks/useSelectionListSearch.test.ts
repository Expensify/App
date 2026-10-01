import {act, renderHook} from '@testing-library/react-native';

import useSelectionListSearch from '@hooks/useSelectionListSearch';

import CONST from '@src/CONST';

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

type Item = {value: string; text: string; keyForList: string; isSelected?: boolean};

const buildItem = (value: string): Item => ({value, text: value, keyForList: value});

/** Build `count` items ("Item 01"…) with the one at `selectedIndex` marked selected. */
const buildItems = (count: number, selectedIndex: number): Item[] =>
    Array.from({length: count}, (_, index) => {
        const value = String(index + 1).padStart(2, '0');
        return {value, text: `Item ${value}`, keyForList: value, isSelected: index === selectedIndex};
    });

describe('useSelectionListSearch', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    const searchAndSettle = (setSearchValue: (value: string) => void, value: string) => {
        act(() => {
            setSearchValue(value);
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
        });
    };

    it('leaves headerMessage unset when no noResultsMessage is given', () => {
        // Given a list searched without a no-results message, because the caller renders its own empty state
        const data = [buildItem('apple')];
        const {result} = renderHook(() => useSelectionListSearch(data));

        // When a search matches nothing
        searchAndSettle(result.current.textInputOptions.onChangeText, 'zzzz');

        // Then the hook stays silent and leaves the empty list to the caller
        expect(result.current.filteredData).toEqual([]);
        expect(result.current.textInputOptions.headerMessage).toBeUndefined();
    });

    it('shows the no-results message when a search matches nothing', () => {
        // Given a list searched with a no-results message
        const data = [buildItem('apple')];
        const {result} = renderHook(() => useSelectionListSearch(data, 'common.noResultsFound'));

        // When a search matches nothing
        searchAndSettle(result.current.textInputOptions.onChangeText, 'zzzz');

        // Then the message is surfaced, so the list is not left blank with no explanation
        expect(result.current.filteredData).toEqual([]);
        expect(result.current.textInputOptions.headerMessage).toBe('common.noResultsFound');
    });

    it('does not show the no-results message before any search is typed', () => {
        // Given a list searched with a no-results message
        const data = [buildItem('apple')];

        // When the picker is opened and nothing has been typed
        const {result} = renderHook(() => useSelectionListSearch(data, 'common.noResultsFound'));

        // Then nothing is shown, since a full list is not a failed search
        expect(result.current.textInputOptions.headerMessage).toBeUndefined();
    });

    it('pins the selected item to the top of a long list', () => {
        // Given a long list (>= item-limit threshold) whose selected item sits in the middle
        const data = buildItems(13, 6);

        // When the hook orders the list
        const {result} = renderHook(() => useSelectionListSearch(data));

        // Then the selected item is moved to the top (it would otherwise be in its natural 7th position)
        expect(result.current.filteredData.at(0)?.value).toBe('07');
        expect(result.current.filteredData.at(0)?.value).not.toBe('01');
    });

    it('keeps the originally selected item pinned when the live selection changes (staged picker)', () => {
        // Given a long list that opened with the 7th item selected
        const {result, rerender} = renderHook((data: Item[]) => useSelectionListSearch(data), {initialProps: buildItems(13, 6)});
        expect(result.current.filteredData.at(0)?.value).toBe('07');

        // When the user stages a different selection without saving (the 3rd item becomes selected)
        rerender(buildItems(13, 2));

        // Then the originally selected item stays pinned at the top instead of the newly tapped one jumping up...
        expect(result.current.filteredData.at(0)?.value).toBe('07');
        // ...and the new pick only gets the checkmark, staying in its natural position
        expect(result.current.filteredData.find((item) => item.value === '03')?.isSelected).toBe(true);
    });

    it('keeps the selected item pinned at the top while searching', () => {
        // Given a long list with a mid-list selection
        const data = buildItems(13, 6);
        const {result} = renderHook(() => useSelectionListSearch(data));

        // When a search matches the selected item along with others
        searchAndSettle(result.current.textInputOptions.onChangeText, 'Item');

        // Then the selected item stays pinned at the top of the filtered results
        expect(result.current.filteredData.at(0)?.value).toBe('07');
    });

    it('does not reorder a list below the item-limit threshold', () => {
        // Given a short list (< item-limit threshold) with a mid-list selection
        const data = buildItems(8, 3);

        // When the hook orders the list
        const {result} = renderHook(() => useSelectionListSearch(data));

        // Then the natural order is kept, so short lists are left untouched
        expect(result.current.filteredData.at(0)?.value).toBe('01');
    });

    it('clears the no-results message once a search matches again', () => {
        // Given a search that matched nothing
        const data = [buildItem('apple')];
        const {result} = renderHook(() => useSelectionListSearch(data, 'common.noResultsFound'));
        searchAndSettle(result.current.textInputOptions.onChangeText, 'zzzz');
        expect(result.current.textInputOptions.headerMessage).toBe('common.noResultsFound');

        // When the search is changed to one that matches
        searchAndSettle(result.current.textInputOptions.onChangeText, 'apple');

        // Then the message goes away rather than sitting above a list with rows in it
        expect(result.current.filteredData).toEqual(data);
        expect(result.current.textInputOptions.headerMessage).toBeUndefined();
    });
});
