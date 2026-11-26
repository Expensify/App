import {act, render, renderHook, screen} from '@testing-library/react-native';

import MoneyRequestReportNavigation, {isNavigableReportID} from '@components/MoneyRequestReportView/MoneyRequestReportNavigation';
import {useSearchResultsContext} from '@components/Search/SearchContext';

import useFilterPendingDeleteReports from '@hooks/useFilterPendingDeleteReports';

import Navigation from '@navigation/Navigation';

import {search} from '@userActions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {View} from 'react-native';

import React from 'react';

type SearchSectionsResult = {allReports: Array<string | undefined>; isSearchLoading: boolean; lastSearchQuery: undefined};

type SnapshotSearch = {offset: number; hasMoreResults: boolean; state?: string; isLoading?: boolean; responseJsonCode?: number};

let mockSortedReportIDs: ReadonlyArray<string | undefined> = CONST.EMPTY_ARRAY;
let mockShouldUseLiveData = false;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({sortedReportIDs: mockSortedReportIDs, shouldUseLiveData: mockShouldUseLiveData}),
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
jest.mock('@navigation/Navigation', () => ({setParams: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
}));

let mockOnNext: (() => void) | undefined;
let mockIsNextButtonDisabled: boolean | undefined;
jest.mock('@components/PrevNextButtons', () => {
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');
    return {
        __esModule: true,
        default: ({onNext, isNextButtonDisabled}: {onNext: () => void; isNextButtonDisabled: boolean}) => {
            mockOnNext = onNext;
            mockIsNextButtonDisabled = isNextButtonDisabled;
            return <RNView testID="PrevNextButtons" />;
        },
    };
});

function pressNext() {
    act(() => mockOnNext?.());
}

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@hooks/useFilterPendingDeleteReports', () => ({
    __esModule: true,
    default: (ids: ReadonlyArray<string | undefined>) => ids.filter(Boolean),
}));

/**
 * Mirrors the source selection in MoneyRequestReportNavigationContent, which picks the context list or the
 * standalone list (lifted from a child that mounts the heavy useSearchSections subscriptions only on the slow path).
 */
function useNavigationSource() {
    const {sortedReportIDs} = useSearchResultsContext();
    const contextReports = useFilterPendingDeleteReports(sortedReportIDs).filter(isNavigableReportID);
    const {allReports: standaloneReports, isSearchLoading} = mockUseSearchSections();
    const shouldUseContextReports = contextReports.length > 0 && !isSearchLoading;

    return {source: shouldUseContextReports ? 'fast' : 'full', allReports: shouldUseContextReports ? contextReports : standaloneReports};
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

            const {result} = renderHook(() => useNavigationSource());

            expect(result.current.source).toBe('fast');
            expect(result.current.allReports).toEqual(['1', '2']);
        });

        it('uses full path (standalone list) when context is empty', () => {
            mockSortedReportIDs = CONST.EMPTY_ARRAY;
            mockUseSearchSections.mockReturnValue({allReports: ['1', '2'], isSearchLoading: false, lastSearchQuery: undefined});

            const {result} = renderHook(() => useNavigationSource());

            expect(result.current.source).toBe('full');
            expect(result.current.allReports).toEqual(['1', '2']);
        });

        it('uses full path (standalone list) when search is loading (pagination)', () => {
            mockSortedReportIDs = ['1', '2'];
            mockUseSearchSections.mockReturnValue({allReports: ['1', '2', '3'], isSearchLoading: true, lastSearchQuery: undefined});

            const {result} = renderHook(() => useNavigationSource());

            expect(result.current.source).toBe('full');
            expect(result.current.allReports).toEqual(['1', '2', '3']);
        });
    });

    describe('report dropped from the results', () => {
        it('keeps the open report in place in the live list so Next reaches the reports that replaced it', () => {
            // Given report 2 is the last of the two loaded reports
            const lastSearchQuery = {queryJSON: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, hash: 1}};
            const snapshot = {data: {[`${ONYXKEYS.COLLECTION.REPORT}1`]: {reportID: '1'}, [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2'}}, search: {offset: 0, hasMoreResults: false}};
            mockSortedReportIDs = ['1', '2'];
            mockUseOnyx.mockImplementation((key: string, options?: {selector?: (value: unknown) => unknown}) => {
                const value = key === ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY ? lastSearchQuery : snapshot;
                return [options?.selector ? options.selector(value) : value];
            });
            const {rerender} = render(
                <MoneyRequestReportNavigation
                    reportID="2"
                    shouldDisplayNarrowVersion
                />,
            );

            // When a refetch drops report 2 from the results and brings in reports 3 and 4
            mockSortedReportIDs = ['1', '3', '4'];
            rerender(
                <MoneyRequestReportNavigation
                    reportID="2"
                    shouldDisplayNarrowVersion
                />,
            );
            jest.mocked(Navigation.setParams).mockClear();
            pressNext();

            // Then Next opens report 3 from the live list, because the cached list ended at report 2 and would leave Next stuck
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: '3'}));
        });

        it('keeps the loaded list when a first page refetch ends the results before the open report', () => {
            // Given two pages of reports are loaded and report 60 is open
            const loadedReportIDs = Array.from({length: CONST.SEARCH.RESULTS_PAGE_SIZE * 2}, (_, index) => `${index + 1}`);
            const {rerenderWithReports} = renderNavigationWithReports('60', loadedReportIDs);

            // When Pay or Submit loads the first page again, which replaces the results with reports 1-50
            rerenderWithReports(loadedReportIDs.slice(0, CONST.SEARCH.RESULTS_PAGE_SIZE));
            jest.mocked(Navigation.setParams).mockClear();
            pressNext();

            // Then Next opens report 61, because placing report 60 after report 50 would end the list at the open report
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: '61'}));
        });

        it('keeps the arrows while the standalone list is still empty', () => {
            // Given report 2 of three loaded reports is open
            const {rerenderWithReports} = renderNavigationWithReports('2', ['1', '2', '3']);

            // When a search starts loading, so the navigation switches to the standalone list before it is computed
            rerenderWithReports(['1', '2', '3'], {offset: 0, hasMoreResults: false, isLoading: true});

            // Then the arrows stay visible and Next opens report 3 from the loaded list, instead of the list shrinking to the open report
            expect(screen.getByTestId('PrevNextButtons')).toBeOnTheScreen();
            jest.mocked(Navigation.setParams).mockClear();
            pressNext();
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: '3'}));
        });
    });

    describe('next page request', () => {
        beforeEach(() => {
            mockIsOffline = false;
            mockShouldUseLiveData = false;
            jest.mocked(search).mockClear();
        });

        it('skips the write queue when Next crosses the prefetch threshold', () => {
            // Given the first page of 50 reports is loaded, more results exist, and report 40 is open
            renderNavigationOnFirstPage('40', {offset: 0}, {offset: 0, hasMoreResults: true});

            // When the user presses Next
            pressNext();

            // Then page 2 is requested without waiting for the OpenReport writes each press queues, so Next isn't disabled at report 50 until they drain
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE, skipWaitForWrites: true}));
        });

        it('requests the next page without a loading state', () => {
            // Given the first page of 50 reports is loaded, more results exist, and report 40 is open
            renderNavigationOnFirstPage('40', {offset: 0}, {offset: 0, hasMoreResults: true});

            // When the user presses Next
            pressNext();

            // Then the request leaves search.isLoading unset, because a refetch for an expense created meanwhile returns early while it is set and is never retried
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE, shouldShowLoading: false}));
            expect(search).not.toHaveBeenCalledWith(expect.objectContaining({shouldUpdateLastSearchParams: true}));
        });

        it('requests the page after the one the snapshot holds, not the one the saved params point at', () => {
            // Given Next loaded page 3, then a refetch replaced the snapshot with the first page while the saved params still point at page 3
            renderNavigationOnFirstPage('40', {offset: CONST.SEARCH.RESULTS_PAGE_SIZE * 2}, {offset: 0, hasMoreResults: true});

            // When the user presses Next
            pressNext();

            // Then page 2 is requested, because the snapshot is the only cursor that matches the loaded reports
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
        });

        it('keeps paging from the loaded pages when a first page refetch fails', () => {
            // Given two pages are loaded
            const {setSnapshotSearch} = renderNavigationOnFirstPage('40', {offset: 0}, {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hasMoreResults: true});

            // When a refetch of the first page fails, which moves the offset back to 0 but leaves both pages in the snapshot, and the user presses Next
            setSnapshotSearch({offset: 0, hasMoreResults: true, responseJsonCode: CONST.JSON_CODE.EXP_ERROR});
            pressNext();

            // Then page 3 is requested, because page 2 is still loaded and asking for it again would add no reports
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE * 2}));
        });

        it('requests the same page again after it failed', () => {
            // Given the page 2 request failed, which leaves the snapshot pointing at page 2 with the failing code
            renderNavigationOnFirstPage('40', {offset: 0}, {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hasMoreResults: true, responseJsonCode: CONST.JSON_CODE.EXP_ERROR});

            // When the user presses Next
            pressNext();

            // Then page 2 is requested again instead of skipping to page 3
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
        });

        it('waits while its own page request is pending', () => {
            // Given the navigation requested page 2 and that request is still loading
            const {setSnapshotSearch} = renderNavigationOnFirstPage('40', {offset: 0}, {offset: 0, hasMoreResults: true});
            pressNext();
            setSnapshotSearch({offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hasMoreResults: true, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING});
            jest.mocked(search).mockClear();

            // When the user presses Next again
            pressNext();

            // Then page 3 isn't requested, because the optimistic offset only says which page is on its way
            expect(search).not.toHaveBeenCalled();
        });

        it('is not blocked by a page request it did not make', () => {
            // Given another search on the same query, like a refetch carrying the Search list's offset, is loading page 2 while the last loaded report is open
            renderNavigationOnFirstPage(
                `${CONST.SEARCH.RESULTS_PAGE_SIZE}`,
                {offset: 0},
                {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hasMoreResults: true, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING},
            );

            // When the navigation renders
            // Then Next stays enabled, because only the navigation's own page request should hold it back
            expect(mockIsNextButtonDisabled).toBe(false);
        });

        it('requests a page left loading by an earlier session again instead of skipping it', () => {
            // Given the snapshot was saved while page 2 was loading, so after a restart it still says page 2 is loading
            renderNavigationOnFirstPage('40', {offset: 0}, {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hasMoreResults: true, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING});

            // When the user presses Next
            pressNext();

            // Then page 2 is requested again, because no request is running for it and asking for page 3 would skip it
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
        });

        it('moves to the next report but holds the page request while the first page is refreshing', () => {
            // Given Pay or Submit refetched the first page and that request is still loading, so the arrows page through the standalone list
            renderNavigationOnFirstPage('40', {offset: 0}, {offset: 0, hasMoreResults: true, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING, isLoading: true});
            jest.mocked(Navigation.setParams).mockClear();

            // When the user presses Next
            pressNext();

            // Then report 41 opens, but page 2 waits, because a first page response that lands after it would replace the snapshot and drop it
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: '41'}));
            expect(search).not.toHaveBeenCalled();
        });

        it('pages a to-do search from the pages that answered, not the offset a refetch rewound', () => {
            // Given a to-do search whose live rows came from three answered pages
            mockShouldUseLiveData = true;
            const {setSnapshotSearch} = renderNavigationOnFirstPage('40', {offset: 0}, {offset: CONST.SEARCH.RESULTS_PAGE_SIZE * 2, hasMoreResults: true});

            // When a refetch rewinds the snapshot offset to the first page, while those rows stay in Onyx, and the user presses Next
            setSnapshotSearch({offset: 0, hasMoreResults: true});
            pressNext();

            // Then page 4 is requested, because asking for page 2 again would add no reports and leave Next with nothing to open
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE * 3}));
        });

        it('does not request a page while offline', () => {
            // Given the user is offline
            mockIsOffline = true;
            renderNavigationOnFirstPage('40', {offset: 0}, {offset: 0, hasMoreResults: true});

            // When the user presses Next
            pressNext();

            // Then no page is requested, because the request could only fail and leave the snapshot pointing at a page that never loaded
            expect(search).not.toHaveBeenCalled();
        });

        it.each([
            ['enabled when the next page can be requested', {offset: 0, hasMoreResults: true}, false, false],
            ['disabled while offline', {offset: 0, hasMoreResults: true}, true, true],
            ['disabled while the first page is refreshing', {offset: 0, hasMoreResults: true, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING}, false, true],
            ['disabled when there are no more results', {offset: 0, hasMoreResults: false}, false, true],
        ])('keeps Next on the last loaded report %s', (_label, snapshotSearch: SnapshotSearch, isOffline, shouldBeDisabled) => {
            // Given the last loaded report is open
            mockIsOffline = isOffline;

            // When the navigation renders
            renderNavigationOnFirstPage(`${CONST.SEARCH.RESULTS_PAGE_SIZE}`, {offset: 0}, snapshotSearch);

            // Then Next is only enabled when pressing it can request the next page, because otherwise the press would do nothing
            expect(mockIsNextButtonDisabled).toBe(shouldBeDisabled);
        });

        it('stays on the last loaded report while the next page is requested', () => {
            // Given the first page of 50 reports is loaded, more results exist, and the last loaded report is open
            renderNavigationOnFirstPage(`${CONST.SEARCH.RESULTS_PAGE_SIZE}`, {offset: 0}, {offset: 0, hasMoreResults: true});
            jest.mocked(Navigation.setParams).mockClear();

            // When the user presses Next
            pressNext();

            // Then page 2 is requested and the user isn't sent back to the first report
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
            expect(Navigation.setParams).not.toHaveBeenCalled();
        });

        it('disables Next on the last loaded report while its own page request is pending', () => {
            // Given the last loaded report is open and the navigation requested page 2
            const {setSnapshotSearch} = renderNavigationOnFirstPage(`${CONST.SEARCH.RESULTS_PAGE_SIZE}`, {offset: 0}, {offset: 0, hasMoreResults: true});
            pressNext();

            // When that request is still loading
            setSnapshotSearch({offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hasMoreResults: true, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING});

            // Then Next is disabled until the page lands, because there is no loaded report to open yet
            expect(mockIsNextButtonDisabled).toBe(true);
        });
    });
});

/** Renders the navigation for `reportID` over `reportIDs`. `rerenderWithReports` replaces the context list and the snapshot's search state and re-renders. */
function renderNavigationWithReports(reportID: string, reportIDs: string[]) {
    const lastSearchQuery = {queryJSON: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, hash: 1}};
    const snapshot = {
        data: Object.fromEntries(reportIDs.map((id) => [`${ONYXKEYS.COLLECTION.REPORT}${id}`, {reportID: id}])),
        search: {offset: 0, hasMoreResults: false} as SnapshotSearch,
    };
    mockSortedReportIDs = reportIDs;
    mockUseOnyx.mockImplementation((key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const value = key === ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY ? lastSearchQuery : snapshot;
        return [options?.selector ? options.selector(value) : value];
    });
    const renderNavigation = () => (
        <MoneyRequestReportNavigation
            reportID={reportID}
            shouldDisplayNarrowVersion
        />
    );
    const {rerender} = render(renderNavigation());

    const rerenderWithReports = (nextReportIDs: string[], nextSnapshotSearch: SnapshotSearch = snapshot.search) => {
        mockSortedReportIDs = nextReportIDs;
        snapshot.search = nextSnapshotSearch;
        rerender(renderNavigation());
    };

    return {rerenderWithReports};
}

/** Renders the navigation for `reportID` with the first page of 50 reports in the snapshot. `setSnapshotSearch` replaces the snapshot's search state and re-renders. */
function renderNavigationOnFirstPage(reportID: string, searchParams: {offset: number}, snapshotSearch: SnapshotSearch) {
    const reportIDs = Array.from({length: CONST.SEARCH.RESULTS_PAGE_SIZE}, (_, index) => `${index + 1}`);
    const lastSearchQuery = {
        queryJSON: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, hash: 1},
        ...searchParams,
    };
    const snapshot = {
        data: Object.fromEntries(reportIDs.map((id) => [`${ONYXKEYS.COLLECTION.REPORT}${id}`, {reportID: id}])),
        search: {isLoading: false, ...snapshotSearch},
    };
    mockSortedReportIDs = reportIDs;
    mockUseSearchSections.mockReturnValue({allReports: reportIDs, isSearchLoading: false, lastSearchQuery: undefined});
    mockUseOnyx.mockImplementation((key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const value = key === ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY ? lastSearchQuery : snapshot;
        return [options?.selector ? options.selector(value) : value];
    });
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
        callback(0);
        return 0;
    });
    const renderNavigation = () => (
        <MoneyRequestReportNavigation
            reportID={reportID}
            shouldDisplayNarrowVersion
        />
    );
    const {rerender} = render(renderNavigation());

    const setSnapshotSearch = (nextSnapshotSearch: SnapshotSearch) => {
        snapshot.search = {isLoading: false, ...nextSnapshotSearch};
        mockSortedReportIDs = [...reportIDs];
        rerender(renderNavigation());
    };

    return {setSnapshotSearch};
}
