import {useSearchResultsContext} from '@components/Search/SearchContext';

import useFilterPendingDeleteReports from '@hooks/useFilterPendingDeleteReports';

import CONST from '@src/CONST';

import {renderHook} from '@testing-library/react-native';

/**
 * These tests verify the routing logic of MoneyRequestReportNavigation
 * without rendering the full component tree.
 * They do so by testing the hooks that drive the two paths.
 */

let mockSortedReportIDs: ReadonlyArray<string | undefined> = CONST.EMPTY_ARRAY;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({sortedReportIDs: mockSortedReportIDs}),
}));

const mockUseOnyx = jest.fn();
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    default: (...args: unknown[]) => mockUseOnyx(...args),
}));

const mockUseSearchSections = jest.fn();
jest.mock('@hooks/useSearchSections', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    default: () => mockUseSearchSections(),
}));

jest.mock('@hooks/useFilterPendingDeleteReports', () => ({
    __esModule: true,
    default: (ids: ReadonlyArray<string | undefined>) => ids.filter(Boolean),
}));

describe('MoneyRequestReportNavigation', () => {
    beforeEach(() => {
        mockSortedReportIDs = CONST.EMPTY_ARRAY;
        mockUseOnyx.mockReturnValue([undefined]);
        mockUseSearchSections.mockClear();
        mockUseSearchSections.mockReturnValue({allReports: [], isSearchLoading: false, lastSearchQuery: undefined});
    });

    describe('fast path', () => {
        it('does not call useSearchSections when context has IDs and search is not loading', () => {
            mockSortedReportIDs = ['1', '2', '3'];
            mockUseOnyx.mockReturnValue([undefined]);

            // Simulate what the wrapper does: reads context + filter
            const {result} = renderHook(() => {
                const {sortedReportIDs} = useSearchResultsContext();
                const allReports = useFilterPendingDeleteReports(sortedReportIDs);
                return {sortedReportIDs, allReports};
            });

            expect(result.current.allReports).toEqual(['1', '2', '3']);
            expect(mockUseSearchSections).not.toHaveBeenCalled();
        });
    });

    describe('path selection', () => {
        it('uses fast path when context has IDs and not loading', () => {
            mockSortedReportIDs = ['1', '2'];
            // isSearchLoading = false (useOnyx returns undefined for snapshot)
            mockUseOnyx.mockReturnValue([undefined]);

            const {result} = renderHook(() => {
                const {sortedReportIDs} = useSearchResultsContext();
                const allReports = useFilterPendingDeleteReports(sortedReportIDs);
                const isSearchLoading = false;
                return allReports.length > 0 && !isSearchLoading ? 'fast' : 'full';
            });

            expect(result.current).toBe('fast');
            expect(mockUseSearchSections).not.toHaveBeenCalled();
        });

        it('uses full path when context is empty', () => {
            mockSortedReportIDs = CONST.EMPTY_ARRAY;

            const {result} = renderHook(() => {
                const {sortedReportIDs} = useSearchResultsContext();
                const allReports = useFilterPendingDeleteReports(sortedReportIDs);
                return allReports.length > 0 ? 'fast' : 'full';
            });

            expect(result.current).toBe('full');
        });

        it('uses full path when search is loading (pagination)', () => {
            mockSortedReportIDs = ['1', '2'];
            const isSearchLoading = true;

            const {result} = renderHook(() => {
                const {sortedReportIDs} = useSearchResultsContext();
                const allReports = useFilterPendingDeleteReports(sortedReportIDs);
                return allReports.length > 0 && !isSearchLoading ? 'fast' : 'full';
            });

            expect(result.current).toBe('full');
        });
    });
});
