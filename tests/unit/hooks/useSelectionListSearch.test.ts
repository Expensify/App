import {act, renderHook} from '@testing-library/react-native';

import useSelectionListSearch from '@hooks/useSelectionListSearch';

import CONST from '@src/CONST';

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

type Item = {value: string; text: string; keyForList: string};

const buildItem = (value: string): Item => ({value, text: value, keyForList: value});

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
