import {renderHook} from '@testing-library/react-native';
import useDefaultSearchQuery from '@hooks/useDefaultSearchQuery';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';

describe('useDefaultSearchQuery', () => {
    it('always returns the Reports (expense-report) canned search query', () => {
        const {result} = renderHook(() => useDefaultSearchQuery());

        expect(result.current).toBe(buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}));
    });
});
