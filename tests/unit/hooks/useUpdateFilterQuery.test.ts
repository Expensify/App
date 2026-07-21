import {renderHook} from '@testing-library/react-native';

import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string) => [onyxData[key]]);

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

const mockResetSearchKey = jest.fn();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryActions: () => ({resetSearchKey: mockResetSearchKey}),
}));

jest.mock('@libs/Navigation/Navigation');

const queryJSON = {sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE, sortOrder: CONST.SEARCH.SORT_ORDER.DESC} as SearchQueryJSON;

describe('useUpdateFilterQuery', () => {
    beforeEach(() => {
        onyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = {type: CONST.SEARCH.DATA_TYPES.EXPENSE} satisfies Partial<SearchAdvancedFiltersForm>;
        mockResetSearchKey.mockClear();
    });

    describe('setFilterQueryParams', () => {
        it('resets the search key when the type changes', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(queryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.INVOICE});

            expect(mockResetSearchKey).toHaveBeenCalledTimes(1);
            expect(mockResetSearchKey).toHaveBeenCalledWith(expect.objectContaining({type: CONST.SEARCH.DATA_TYPES.INVOICE}));
        });

        it('does not reset the search key when the type is unchanged', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(queryJSON));

            result.current.setFilterQueryParams({type: CONST.SEARCH.DATA_TYPES.EXPENSE, merchant: 'Amazon'});

            expect(mockResetSearchKey).not.toHaveBeenCalled();
        });

        it('does not reset the search key when no type is provided', () => {
            const {result} = renderHook(() => useUpdateFilterQuery(queryJSON));

            result.current.setFilterQueryParams({merchant: 'Amazon'});

            expect(mockResetSearchKey).not.toHaveBeenCalled();
        });
    });
});
