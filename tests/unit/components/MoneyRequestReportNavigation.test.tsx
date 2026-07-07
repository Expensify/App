import {renderHook} from '@testing-library/react-native';

import {useSearchResultsContext} from '@components/Search/SearchContext';

import useFilterPendingDeleteReports from '@hooks/useFilterPendingDeleteReports';

import CONST from '@src/CONST';

import {useState} from 'react';

/**
 * These tests verify the source-selection and cache logic of MoneyRequestReportNavigation
 * without rendering the full component tree. They do so by exercising the same logic the
 * component's stable content child runs.
 */

type SearchSectionsResult = {allReports: Array<string | undefined>; isSearchLoading: boolean; lastSearchQuery: undefined};

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

const mockUseSearchSections = jest.fn<SearchSectionsResult, []>();
jest.mock('@hooks/useSearchSections', () => ({
    __esModule: true,
    default: () => mockUseSearchSections(),
}));

jest.mock('@hooks/useFilterPendingDeleteReports', () => ({
    __esModule: true,
    default: (ids: ReadonlyArray<string | undefined>) => ids.filter(Boolean),
}));

const isSameReportList = (a: Array<string | undefined>, b: Array<string | undefined> | null): boolean => {
    if (a === b) {
        return true;
    }
    if (b === null || a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a.at(i) !== b.at(i)) {
            return false;
        }
    }
    return true;
};

/**
 * Mirrors the source-selection + lastValidReports cache that lives in the single, stable
 * MoneyRequestReportNavigationContent instance. That component selects the context list or the
 * standalone list (the latter lifted from a child that mounts the heavy useSearchSections
 * subscriptions only on the slow path) as a value, so the cache survives an isSearchLoading toggle
 * instead of being reset by a component-subtree swap.
 */
function useNavigationSource(reportID: string | undefined) {
    const {sortedReportIDs} = useSearchResultsContext();
    const contextReports = useFilterPendingDeleteReports(sortedReportIDs);
    const {allReports: standaloneReports, isSearchLoading} = mockUseSearchSections();

    const allReports = contextReports.length > 0 && !isSearchLoading ? contextReports : standaloneReports;
    const liveCurrentIndex = allReports.indexOf(reportID);

    const [lastValidReports, setLastValidReports] = useState<Array<string | undefined> | null>(null);
    if (liveCurrentIndex !== -1 && !isSameReportList(allReports, lastValidReports)) {
        setLastValidReports(allReports);
    }
    const effectiveAllReports = liveCurrentIndex === -1 && lastValidReports ? lastValidReports : allReports;

    return {source: contextReports.length > 0 && !isSearchLoading ? 'fast' : 'full', allReports, effectiveAllReports};
}

describe('MoneyRequestReportNavigation', () => {
    beforeEach(() => {
        mockSortedReportIDs = CONST.EMPTY_ARRAY;
        mockUseOnyx.mockReturnValue([undefined]);
        mockUseSearchSections.mockClear();
        mockUseSearchSections.mockReturnValue({allReports: [], isSearchLoading: false, lastSearchQuery: undefined});
    });

    describe('path selection', () => {
        it('uses fast path (context list) when context has IDs and not loading', () => {
            mockSortedReportIDs = ['1', '2'];
            mockUseSearchSections.mockReturnValue({allReports: ['1', '2', '3'], isSearchLoading: false, lastSearchQuery: undefined});

            const {result} = renderHook(() => useNavigationSource('1'));

            expect(result.current.source).toBe('fast');
            expect(result.current.allReports).toEqual(['1', '2']);
        });

        it('uses full path (standalone list) when context is empty', () => {
            mockSortedReportIDs = CONST.EMPTY_ARRAY;
            mockUseSearchSections.mockReturnValue({allReports: ['1', '2'], isSearchLoading: false, lastSearchQuery: undefined});

            const {result} = renderHook(() => useNavigationSource('1'));

            expect(result.current.source).toBe('full');
            expect(result.current.allReports).toEqual(['1', '2']);
        });

        it('uses full path (standalone list) when search is loading (pagination)', () => {
            mockSortedReportIDs = ['1', '2'];
            mockUseSearchSections.mockReturnValue({allReports: ['1', '2', '3'], isSearchLoading: true, lastSearchQuery: undefined});

            const {result} = renderHook(() => useNavigationSource('1'));

            expect(result.current.source).toBe('full');
            expect(result.current.allReports).toEqual(['1', '2', '3']);
        });
    });

    describe('cache survives the isSearchLoading toggle', () => {
        it('keeps the last list that contained the report after it is filtered out (e.g. after Submit)', () => {
            // Start on report "1" in a stable fast-path list [1, 2, 3].
            mockSortedReportIDs = ['1', '2', '3'];
            mockUseSearchSections.mockReturnValue({allReports: ['1', '2', '3'], isSearchLoading: false, lastSearchQuery: undefined});

            const {result, rerender} = renderHook(() => useNavigationSource('1'));
            expect(result.current.effectiveAllReports).toEqual(['1', '2', '3']);

            // Submitting "1" triggers a search refresh: isSearchLoading toggles, then "1" drops out
            // of the live list. The same content instance re-renders (no unmount), so the cached list
            // must keep "1" present and the carousel populated.
            mockSortedReportIDs = ['2', '3'];
            mockUseSearchSections.mockReturnValue({allReports: ['2', '3'], isSearchLoading: false, lastSearchQuery: undefined});
            rerender({});

            expect(result.current.allReports).toEqual(['2', '3']);
            expect(result.current.effectiveAllReports).toEqual(['1', '2', '3']);
        });
    });
});
