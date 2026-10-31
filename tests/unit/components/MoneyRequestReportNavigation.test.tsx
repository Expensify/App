import {render, renderHook} from '@testing-library/react-native';

import MoneyRequestReportNavigation, {isNavigableReportID} from '@components/MoneyRequestReportView/MoneyRequestReportNavigation';
import {useSearchResultsContext} from '@components/Search/SearchContext';

import useFilterPendingDeleteReports from '@hooks/useFilterPendingDeleteReports';

import Navigation from '@navigation/Navigation';

import {saveLastSearchParams} from '@userActions/ReportNavigation';
import {search} from '@userActions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

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

jest.mock('@userActions/Search', () => ({search: jest.fn()}));
jest.mock('@userActions/ReportNavigation', () => ({saveLastSearchParams: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({setParams: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
}));

let mockOnNext: (() => void) | undefined;
jest.mock('@components/PrevNextButtons', () => ({
    __esModule: true,
    default: ({onNext}: {onNext: () => void}) => {
        mockOnNext = onNext;
        return null;
    },
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
    const contextReports = useFilterPendingDeleteReports(sortedReportIDs).filter(isNavigableReportID);
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

/**
 * Regression guard for https://github.com/Expensify/App/issues/99627: an unreported (self-DM) expense is grouped
 * under the "0" placeholder rather than a real report, so it inflated the "x of y" counter with an entry the Reports
 * list never showed, and paging onto it landed the user on an empty report.
 */
describe('isNavigableReportID', () => {
    it('accepts a real report', () => {
        expect(isNavigableReportID('12345')).toBe(true);
    });

    it('rejects the unreported placeholder', () => {
        expect(isNavigableReportID(CONST.REPORT.UNREPORTED_REPORT_ID)).toBe(false);
    });

    it.each([
        ['undefined', undefined],
        ['an empty string', ''],
    ])('rejects %s', (_label, reportID) => {
        expect(isNavigableReportID(reportID)).toBe(false);
    });
});

describe('MoneyRequestReportNavigation', () => {
    beforeEach(() => {
        mockSortedReportIDs = CONST.EMPTY_ARRAY;
        mockUseOnyx.mockReturnValue([undefined]);
        mockUseSearchSections.mockClear();
        mockUseSearchSections.mockReturnValue({allReports: [], isSearchLoading: false, lastSearchQuery: undefined});
    });

    afterEach(() => {
        jest.restoreAllMocks();
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

    describe('next page request', () => {
        it('skips the write queue when Next crosses the prefetch threshold', () => {
            // Given the first page of 50 reports is loaded, more results exist, and report 40 is open
            const reportIDs = Array.from({length: CONST.SEARCH.RESULTS_PAGE_SIZE}, (_, index) => `${index + 1}`);
            const lastSearchQuery = {
                queryJSON: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, hash: 1},
                offset: 0,
                hasMoreResults: true,
                previousLengthOfResults: reportIDs.length,
            };
            const snapshot = {data: Object.fromEntries(reportIDs.map((id) => [`${ONYXKEYS.COLLECTION.REPORT}${id}`, {reportID: id}])), search: {isLoading: false}};
            mockSortedReportIDs = reportIDs;
            mockUseOnyx.mockImplementation((key: string, options?: {selector?: (value: unknown) => unknown}) => {
                const value = key === ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY ? lastSearchQuery : snapshot;
                return [options?.selector ? options.selector(value) : value];
            });
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                callback(0);
                return 0;
            });
            render(
                <MoneyRequestReportNavigation
                    reportID="40"
                    shouldDisplayNarrowVersion
                />,
            );

            // When the user presses Next
            mockOnNext?.();

            // Then page 2 is requested without waiting for the OpenReport writes each press queues, so Next isn't disabled at report 50 until they drain
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE, skipWaitForWrites: true}));
            requestAnimationFrameSpy.mockRestore();
        });

        it.each([
            ['restores the params from before the request when the page fails', undefined, true],
            ['keeps the params the request saved when the page loads', CONST.JSON_CODE.SUCCESS, false],
        ])('%s', async (_label, jsonCode, shouldRestore) => {
            // Given the first page of 50 reports is loaded, more results exist, and report 40 is open
            const lastSearchQuery = renderNavigationOnFirstPage('40', {offset: 0, hasMoreResults: true}, {offset: 0, hasMoreResults: true});
            jest.mocked(search).mockReturnValueOnce(Promise.resolve(jsonCode));
            jest.mocked(saveLastSearchParams).mockClear();

            // When the user presses Next and the page 2 request settles
            mockOnNext?.();
            await Promise.resolve();

            // Then a failed request leaves the offset where Next can request page 2 again, and a successful one is left alone
            if (shouldRestore) {
                expect(saveLastSearchParams).toHaveBeenCalledWith(lastSearchQuery);
            } else {
                expect(saveLastSearchParams).not.toHaveBeenCalled();
            }
        });

        it('stays on the last loaded report while the next page is requested', () => {
            // Given the first page of 50 reports is loaded, more results exist, and the last loaded report is open
            renderNavigationOnFirstPage(`${CONST.SEARCH.RESULTS_PAGE_SIZE}`, {offset: 0, hasMoreResults: true}, {offset: 0, hasMoreResults: true});
            jest.mocked(Navigation.setParams).mockClear();

            // When the user presses Next
            mockOnNext?.();

            // Then page 2 is requested and the user isn't sent back to the first report
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
            expect(Navigation.setParams).not.toHaveBeenCalled();
        });
    });

    describe('first page refetch', () => {
        it('loads the dropped page again when a refetch replaces the snapshot with the first page', () => {
            // Given Next loaded page 2 (the last one), then Pay refetched the first page, which replaced the snapshot
            jest.mocked(search).mockClear();
            jest.mocked(saveLastSearchParams).mockClear();
            renderNavigationOnFirstPage('40', {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hasMoreResults: false}, {offset: 0, hasMoreResults: true});

            // Then page 2 is requested again without a loading state, because each Next press remounts the navigation and it only shows for a report the snapshot holds
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE, skipWaitForWrites: true, shouldShowLoading: false}));
            expect(search).not.toHaveBeenCalledWith(expect.objectContaining({shouldUpdateLastSearchParams: true}));
            expect(saveLastSearchParams).not.toHaveBeenCalled();
        });

        it('moves the params back to the first page when loading the dropped page fails', async () => {
            // Given Next loaded page 2 (the last one), Pay refetched the first page, and loading page 2 again fails
            jest.mocked(saveLastSearchParams).mockClear();
            jest.mocked(search).mockReturnValueOnce(Promise.resolve(undefined));
            const lastSearchQuery = renderNavigationOnFirstPage('40', {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hasMoreResults: false}, {offset: 0, hasMoreResults: true});

            // When the request settles
            await Promise.resolve();

            // Then the params follow the snapshot back to the first page, so Next requests page 2 itself instead of stopping at report 50
            expect(saveLastSearchParams).toHaveBeenCalledWith({
                ...lastSearchQuery,
                offset: 0,
                hasMoreResults: true,
                previousLengthOfResults: CONST.SEARCH.RESULTS_PAGE_SIZE,
                allowPostSearchRecount: false,
            });
        });
    });
});

/** Renders the navigation for `reportID` with the first page of 50 reports in the snapshot, and returns the saved params it starts from. */
function renderNavigationOnFirstPage(reportID: string, searchParams: {offset: number; hasMoreResults: boolean}, snapshotSearch: {offset: number; hasMoreResults: boolean}) {
    const reportIDs = Array.from({length: CONST.SEARCH.RESULTS_PAGE_SIZE}, (_, index) => `${index + 1}`);
    const lastSearchQuery = {
        queryJSON: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, hash: 1},
        ...searchParams,
        previousLengthOfResults: reportIDs.length,
    };
    const snapshot = {
        data: Object.fromEntries(reportIDs.map((id) => [`${ONYXKEYS.COLLECTION.REPORT}${id}`, {reportID: id}])),
        search: {isLoading: false, ...snapshotSearch},
    };
    mockSortedReportIDs = reportIDs;
    mockUseOnyx.mockImplementation((key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const value = key === ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY ? lastSearchQuery : snapshot;
        return [options?.selector ? options.selector(value) : value];
    });
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
        callback(0);
        return 0;
    });
    render(
        <MoneyRequestReportNavigation
            reportID={reportID}
            shouldDisplayNarrowVersion
        />,
    );
    return lastSearchQuery;
}
