import {renderHook} from '@testing-library/react-native';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import useSaveSortedReportIDs from '@hooks/useSaveSortedReportIDs';
import CONST from '@src/CONST';

const mockSetSortedReportIDs = jest.fn();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchActionsContext: () => ({setSortedReportIDs: mockSetSortedReportIDs}),
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
            renderHook(() => useSaveSortedReportIDs(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, [{reportID: '1'}, {reportID: '3'}] as TransactionListItemType[]));

            expect(mockSetSortedReportIDs).toHaveBeenCalledWith(['1', '3']);
        });

        it('stores all IDs in context', () => {
            renderHook(() => useSaveSortedReportIDs(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, [{reportID: '1'}, {reportID: '2'}, {reportID: '3'}] as TransactionListItemType[]));

            expect(mockSetSortedReportIDs).toHaveBeenCalledWith(['1', '2', '3']);
        });

        it('clears context when type is not expense-report', () => {
            renderHook(() => useSaveSortedReportIDs(CONST.SEARCH.DATA_TYPES.EXPENSE, [{reportID: '1'}, {reportID: '2'}] as TransactionListItemType[]));

            expect(mockSetSortedReportIDs).toHaveBeenCalledWith([]);
        });
    });
});
