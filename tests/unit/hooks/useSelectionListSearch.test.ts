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
        const data = [buildItem('apple')];
        const {result} = renderHook(() => useSelectionListSearch(data));

        searchAndSettle(result.current.textInputOptions.onChangeText, 'zzzz');

        expect(result.current.filteredData).toEqual([]);
        expect(result.current.textInputOptions.headerMessage).toBeUndefined();
    });

    it('shows the no-results message when a search matches nothing', () => {
        const data = [buildItem('apple')];
        const {result} = renderHook(() => useSelectionListSearch(data, 'common.noResultsFound'));

        searchAndSettle(result.current.textInputOptions.onChangeText, 'zzzz');

        expect(result.current.filteredData).toEqual([]);
        expect(result.current.textInputOptions.headerMessage).toBe('common.noResultsFound');
    });

    it('does not show the no-results message before any search is typed', () => {
        const data = [buildItem('apple')];
        const {result} = renderHook(() => useSelectionListSearch(data, 'common.noResultsFound'));

        expect(result.current.textInputOptions.headerMessage).toBeUndefined();
    });

    it('clears the no-results message once a search matches again', () => {
        const data = [buildItem('apple')];
        const {result} = renderHook(() => useSelectionListSearch(data, 'common.noResultsFound'));

        searchAndSettle(result.current.textInputOptions.onChangeText, 'zzzz');
        expect(result.current.textInputOptions.headerMessage).toBe('common.noResultsFound');

        searchAndSettle(result.current.textInputOptions.onChangeText, 'apple');
        expect(result.current.filteredData).toEqual(data);
        expect(result.current.textInputOptions.headerMessage).toBeUndefined();
    });
});
