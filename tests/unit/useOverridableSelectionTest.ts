import {act, renderHook} from '@testing-library/react-native';

import useOverridableSelection from '@hooks/useOverridableSelection';

describe('useOverridableSelection', () => {
    it('follows the initial selection until the user changes something', () => {
        // Given a selection whose saved data hasn't loaded yet
        const noSavedSelection: string[] = [];
        const {result, rerender} = renderHook(({initialSelection}: {initialSelection: string[]}) => useOverridableSelection(initialSelection), {
            initialProps: {initialSelection: noSavedSelection},
        });

        // When the saved data loads
        rerender({initialSelection: ['Meals', 'Travel']});

        // Then the selection shows it, since the user hasn't touched anything yet
        expect(result.current.selectedKeys).toEqual(['Meals', 'Travel']);

        // When the user unchecks one key and the saved data then changes again
        act(() => result.current.toggleKey('Travel'));
        rerender({initialSelection: ['Meals', 'Travel', 'Fuel']});

        // Then the user's choice wins over the new saved data
        expect(result.current.selectedKeys).toEqual(['Meals']);
    });

    it('checks every visible key, then unchecks them, without touching keys hidden by a search', () => {
        // Given Meals and Travel checked, and a search that only shows Travel and Fuel
        const {result} = renderHook(() => useOverridableSelection(['Meals', 'Travel']));

        // When the user selects all visible keys
        act(() => result.current.toggleVisibleKeys(['Travel', 'Fuel']));

        // Then Fuel is checked too, and Meals stays checked even though it's hidden
        expect(result.current.selectedKeys).toEqual(['Meals', 'Travel', 'Fuel']);

        // When the user presses select all again, now that every visible key is checked
        act(() => result.current.toggleVisibleKeys(['Travel', 'Fuel']));

        // Then only the visible keys are unchecked
        expect(result.current.selectedKeys).toEqual(['Meals']);
    });
});
