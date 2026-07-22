import {renderHook} from '@testing-library/react-native';

import useSaveSortedReportIDs from '@hooks/useSaveSortedReportIDs';

import CONST from '@src/CONST';

const mockSetSortedReportIDs = jest.fn();
type SearchResultItem = Parameters<typeof useSaveSortedReportIDs>[1][number];

const makeSearchItems = (...reportIDs: string[]): SearchResultItem[] => reportIDs.map((reportID) => ({reportID}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsActions: () => ({setSortedReportIDs: mockSetSortedReportIDs}),
}));

describe('useSaveSortedReportIDs', () => {
    beforeEach(() => {
        mockSetSortedReportIDs.mockClear();
    });

    describe('saving report IDs to context', () => {
        it('stores empty array in context when sorted list is empty', () => {
            renderHook(() => useSaveSortedReportIDs(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, []));

            expect(mockSetSortedReportIDs).toHaveBeenCalledWith([]);
        });

        it('stores only the provided report IDs in context', () => {
            renderHook(() => useSaveSortedReportIDs(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, makeSearchItems('1', '3')));

            expect(mockSetSortedReportIDs).toHaveBeenCalledWith(['1', '3']);
        });

        it('stores all IDs in context', () => {
            renderHook(() => useSaveSortedReportIDs(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, makeSearchItems('1', '2', '3')));

            expect(mockSetSortedReportIDs).toHaveBeenCalledWith(['1', '2', '3']);
        });

        it('clears context when type is not expense-report', () => {
            renderHook(() => useSaveSortedReportIDs(CONST.SEARCH.DATA_TYPES.EXPENSE, makeSearchItems('1', '2')));

            expect(mockSetSortedReportIDs).toHaveBeenCalledWith([]);
        });
    });
});
