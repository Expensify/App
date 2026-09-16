import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import useSearchFilterSync, {shouldDeferSearchFilterSync, shouldShowInitialCategoryFilterLoading} from '@hooks/useSearchFilterSync';

import {updateAdvancedFilters} from '@libs/actions/Search';
import {setLastSyncedQuerySignature} from '@libs/SearchFilterSyncState';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import type {SearchAdvancedFiltersForm} from '@src/types/form';

import type * as NativeNavigation from '@react-navigation/native';

jest.mock('@libs/actions/Search', () => ({updateAdvancedFilters: jest.fn()}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));

const mockedUpdateAdvancedFilters = jest.mocked(updateAdvancedFilters);
const mockedUseOnyx = jest.mocked(useOnyx);

describe('useSearchFilterSync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setLastSyncedQuerySignature(null);
        (mockedUseOnyx as jest.Mock).mockReturnValue([{}, {status: 'loaded'}]);
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

    it('syncs the same query again when its Onyx form was cleared', () => {
        const queryJSON = buildSearchQueryJSON('type:expense category:SecondTesting');
        const completeValues: Partial<SearchAdvancedFiltersForm> = {
            type: 'expense',
            category: ['SecondTesting'],
        };
        (mockedUseOnyx as jest.Mock).mockReturnValue([completeValues, {status: 'loaded'}]);

        const {rerender} = renderHook(() => useSearchFilterSync(queryJSON, completeValues));

        expect(mockedUpdateAdvancedFilters).toHaveBeenCalledTimes(1);

        rerender(undefined);
        expect(mockedUpdateAdvancedFilters).toHaveBeenCalledTimes(1);

        (mockedUseOnyx as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);
        rerender(undefined);

        expect(mockedUpdateAdvancedFilters).toHaveBeenCalledTimes(2);
        expect(mockedUpdateAdvancedFilters).toHaveBeenLastCalledWith(completeValues, true);
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

    it('shows category filter loading only during initial load', () => {
        const queryJSON = buildSearchQueryJSON('type:expense category:SecondTesting');
        if (!queryJSON) {
            throw new Error('Expected query to parse');
        }

        expect(shouldShowInitialCategoryFilterLoading(queryJSON, false, undefined, false)).toBe(true);
        expect(shouldShowInitialCategoryFilterLoading(queryJSON, true, true, false)).toBe(false);
        expect(shouldShowInitialCategoryFilterLoading(queryJSON, false, undefined, true)).toBe(false);
    });
});
