import {renderHook} from '@testing-library/react-native';

import useSearchFilterSync, {shouldDeferSearchFilterSync} from '@hooks/useSearchFilterSync';

import {updateAdvancedFilters} from '@libs/actions/Search';
import {resetSearchFilterSyncState} from '@libs/SearchFilterSyncState';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import type {SearchAdvancedFiltersForm} from '@src/types/form';

import type * as NativeNavigation from '@react-navigation/native';

jest.mock('@libs/actions/Search', () => ({updateAdvancedFilters: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));

const mockedUpdateAdvancedFilters = jest.mocked(updateAdvancedFilters);

describe('useSearchFilterSync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetSearchFilterSyncState();
    });

    it('waits for category data before recording and syncing a query', () => {
        const queryJSON = buildSearchQueryJSON('type:expense category:SecondTesting');
        const incompleteValues: Partial<SearchAdvancedFiltersForm> = {type: 'expense'};
        const completeValues: Partial<SearchAdvancedFiltersForm> = {
            type: 'expense',
            category: ['SecondTesting'],
        };

        const {rerender} = renderHook(({formValues, shouldDeferSync}) => useSearchFilterSync(queryJSON, formValues, shouldDeferSync), {
            initialProps: {formValues: incompleteValues, shouldDeferSync: true},
        });

        expect(mockedUpdateAdvancedFilters).not.toHaveBeenCalled();

        rerender({formValues: completeValues, shouldDeferSync: false});

        expect(mockedUpdateAdvancedFilters).toHaveBeenCalledTimes(1);
        expect(mockedUpdateAdvancedFilters).toHaveBeenCalledWith(completeValues, true);

        rerender({formValues: incompleteValues, shouldDeferSync: true});
        rerender({formValues: completeValues, shouldDeferSync: false});

        expect(mockedUpdateAdvancedFilters).toHaveBeenCalledTimes(2);
    });

    it('does not defer category filter sync while offline', () => {
        const queryJSON = buildSearchQueryJSON('type:expense category:SecondTesting');
        if (!queryJSON) {
            throw new Error('Expected query to parse');
        }

        expect(shouldDeferSearchFilterSync(queryJSON, false, undefined, false)).toBe(true);
        expect(shouldDeferSearchFilterSync(queryJSON, true, true, false)).toBe(true);
        expect(shouldDeferSearchFilterSync(queryJSON, true, false, false)).toBe(false);
        expect(shouldDeferSearchFilterSync(queryJSON, false, undefined, true)).toBe(false);
    });
});
