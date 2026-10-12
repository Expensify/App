import {renderHook} from '@testing-library/react-native';

import useSearchSnapshot from '@components/Search/hooks/useSearchSnapshot';
import type {SearchQueryJSON, SelectedTransactionInfo} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

import createMock from '../../utils/createMock';

const onyxData: Record<string, unknown> = {};

// Aux Onyx reads (cards, bank accounts, etc.) are irrelevant here because getSections is mocked.
const mockUseOnyx = jest.fn((key: string) => [onyxData[key]]);
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));
// Stable object so the returned helpers keep their identity across renders, mirroring the real
// useLocalize. The referential-stability test below relies on these not being a memo dependency churn.
const mockLocalizeValue = {
    localeCompare: (a: string, b: string) => a.localeCompare(b),
    formatPhoneNumber: (phone: string) => phone,
    translate: (key: string) => key,
};
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => mockLocalizeValue,
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, email: 'test@test.com'}),
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayString: () => ''}),
}));
jest.mock('@hooks/useActionLoadingReportIDs', () => ({
    __esModule: true,
    default: () => new Set(),
}));
jest.mock('@hooks/useReportAttributes', () => ({
    __esModule: true,
    default: () => undefined,
}));
jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({
        policyForMovingExpensesID: undefined,
        policyForMovingExpenses: undefined,
    }),
}));
jest.mock('@hooks/useMultipleSnapshots', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchKey: undefined}),
    useSearchResultsContext: () => ({shouldUseLiveData: false}),
}));
jest.mock('@libs/TransactionUtils', () => ({
    shouldShowAttendees: () => false,
}));
jest.mock('@libs/SearchQueryUtils', () => ({
    isDefaultExpensesQuery: () => false,
    queryHasViolationFilter: () => false,
}));
jest.mock('@libs/ReportUtils', () => ({
    selectFilteredReportActions: (value: unknown) => value,
}));
jest.mock('@src/selectors/AdvancedSearchFiltersForm', () => ({
    columnsSelector: (value: unknown) => value,
}));

const mockGetSections = jest.fn();
const mockGetSortedSections = jest.fn();
const mockGetColumnsToShow = jest.fn();
const mockGetValidGroupBy = jest.fn();
const mockIsSearchDataLoaded = jest.fn();
jest.mock('@libs/SearchUIUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getSections: (...args: unknown[]) => mockGetSections(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getSortedSections: (...args: unknown[]) => mockGetSortedSections(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getColumnsToShow: (...args: unknown[]) => mockGetColumnsToShow(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getValidGroupBy: (...args: unknown[]) => mockGetValidGroupBy(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    isSearchDataLoaded: (...args: unknown[]) => mockIsSearchDataLoaded(...args),
    isTransactionGroupListItemType: (item: Record<string, unknown>) => 'transactions' in item,
}));

// The optimistic-tracking hooks are mocked so this suite exercises the hook's WIRING (correct inputs in,
// their outputs forwarded). Their own logic is covered by their dedicated hook tests + getSections tests.
const mockUseOptimisticSearchTracking = jest.fn();
const mockUseStableOptimisticSortedData = jest.fn();
jest.mock('@components/Search/hooks/useOptimisticSearchTracking', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    default: (...args: unknown[]) => mockUseOptimisticSearchTracking(...args),
}));
jest.mock('@components/Search/hooks/useStableOptimisticSortedData', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    default: (...args: unknown[]) => mockUseStableOptimisticSortedData(...args),
}));

const HASH = 123;

function makeQueryJSON(overrides: Partial<SearchQueryJSON> = {}): SearchQueryJSON {
    const base = {
        hash: HASH,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        ...overrides,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return base as SearchQueryJSON;
}

function makeSearchResults(overrides: Partial<SearchResults['search']> = {}): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        data: {transactions: {}},
        search: {
            isLoading: false,
            hasMoreResults: false,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            ...overrides,
        },
    } as unknown as SearchResults;
}

// Default optimistic-tracking return: no pending write, snapshot data passed through unchanged.
function trackingReturn(searchDataWithOptimisticTransaction: unknown, optimisticWatchKey?: string, shouldDeferHeavySearchWork = false) {
    return {
        searchDataWithOptimisticTransaction,
        trackingState: {optimisticWatchKey},
        showPendingExpensePlaceholder: false,
        shouldDeferHeavySearchWork,
        setShouldDeferHeavySearchWork: jest.fn(),
        hasPendingWriteOnMountRef: {current: {hasPendingWriteOnMount: false}},
        skipDeferralOnFocusRef: {current: false},
        rearmTracking: jest.fn(),
    };
}

describe('useSearchSnapshot', () => {
    beforeEach(() => {
        mockIsOffline = false;
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockUseOnyx.mockClear();
        mockGetSections.mockReset().mockReturnValue([[], 0, false]);
        mockGetSortedSections.mockReset().mockReturnValue([]);
        mockGetColumnsToShow.mockReset().mockReturnValue([]);
        mockGetValidGroupBy.mockReset().mockImplementation((groupBy: unknown) => groupBy);
        mockIsSearchDataLoaded.mockReset().mockReturnValue(true);
        mockUseOptimisticSearchTracking.mockReset().mockReturnValue(trackingReturn(undefined));
        mockUseStableOptimisticSortedData.mockReset().mockImplementation((sortedData: unknown) => ({
            stableSortedData: sortedData,
            hasCachedOptimisticItem: false,
        }));
    });

    it('projects sorted data + columns + meta from the snapshot', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        const sorted = [{transactionID: '1', keyForList: '1'}];
        mockGetSections.mockReturnValue([[{transactionID: '1'}], 1, false]);
        mockGetSortedSections.mockReturnValue(sorted);
        mockGetColumnsToShow.mockReturnValue(['merchant']);

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(mockGetSections).toHaveBeenCalledWith(expect.objectContaining({data: searchResults.data}));
        expect(mockGetSortedSections).toHaveBeenCalled();
        expect(result.current.chartData).toHaveLength(1);
        expect(result.current.chartData.at(0)?.keyForList).toBe('1');
        // data is the stabilized passthrough of the (highlight-stamped) chartData in this mock setup.
        expect(result.current.data).toBe(result.current.chartData);
        expect(result.current.columns).toEqual(['merchant']);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.hasLoadedAllTransactions).toBe(true);
        expect(result.current.allDataLength).toBe(1);
        expect(result.current.hasDeletedTransaction).toBe(false);
    });

    it('returns empty data and skips getSections when there is no augmented snapshot', () => {
        // searchDataWithOptimisticTransaction undefined (no snapshot / deep-link before search ran).
        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults: undefined,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(mockGetSections).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
        expect(result.current.filteredDataLength).toBe(0);
    });

    it('skips getSections while heavy work is deferred (defer gating)', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data, undefined, true));

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(mockGetSections).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
        expect(result.current.shouldDeferHeavySearchWork).toBe(true);
    });

    it('skips getSections until the snapshot is data-loaded (race guard)', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        mockIsSearchDataLoaded.mockReturnValue(false);

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(mockGetSections).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
    });

    it('skips getSections for the invalid group-by-on-chat combo', () => {
        const searchResults = makeSearchResults({
            type: CONST.SEARCH.DATA_TYPES.CHAT,
        });
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON({
                    type: CONST.SEARCH.DATA_TYPES.CHAT,
                    groupBy: CONST.SEARCH.GROUP_BY.FROM,
                }),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(mockGetSections).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
    });

    it('derives meta from the snapshot search block', () => {
        const searchResults = makeSearchResults({
            isLoading: true,
            hasMoreResults: true,
        });
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.hasMore).toBe(true);
        // Flat (no group-by) is always considered fully loaded.
        expect(result.current.hasLoadedAllTransactions).toBe(true);
    });

    it('feeds the optimistic-augmented data and watch key into getSections', () => {
        const augmented = {
            transactions: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}999`]: {transactionID: '999'},
            },
        };
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(augmented, `${ONYXKEYS.COLLECTION.TRANSACTION}999`));

        renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(mockGetSections).toHaveBeenCalledWith(
            expect.objectContaining({
                data: augmented,
                optimisticTransactionID: '999',
            }),
        );
    });

    it('returns the stabilized data, not the raw sorted data', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        mockGetSortedSections.mockReturnValue([{keyForList: 'sorted'}]);
        const stabilized = [{keyForList: 'sorted'}, {keyForList: 'optimistic-extra'}];
        mockUseStableOptimisticSortedData.mockReturnValue({
            stableSortedData: stabilized,
            hasCachedOptimisticItem: true,
        });

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(result.current.data).toBe(stabilized);
        expect(result.current.hasCachedOptimisticItem).toBe(true);
    });

    it('passes the query type through to getSortedSections for each variant shape', () => {
        const variants = [
            CONST.SEARCH.DATA_TYPES.CHAT,
            CONST.SEARCH.DATA_TYPES.TASK,
            CONST.SEARCH.DATA_TYPES.EXPENSE,
            CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            CONST.SEARCH.DATA_TYPES.INVOICE,
        ];
        for (const type of variants) {
            const searchResults = makeSearchResults({type});
            mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
            mockGetSortedSections.mockClear();

            renderHook(() =>
                useSearchSnapshot({
                    queryJSON: makeQueryJSON({type}),
                    searchResults,
                    transactions: undefined,
                    reportActions: undefined,
                }),
            );

            expect(mockGetSortedSections).toHaveBeenCalled();
            // First positional arg to getSortedSections is the search data type for the variant.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(mockGetSortedSections.mock.calls.at(-1)?.[0]).toBe(type);
        }
    });

    it('keeps the projected data referentially stable across re-renders with unchanged inputs', () => {
        // Regression guard for the "Maximum update depth exceeded" crash: the projection stages used to be
        // bare IIFEs, which React Compiler does not memoize (it only caches the inline .map callbacks), so
        // they allocated a fresh array every render. An unstable `data` reference drove
        // useStableOptimisticSortedData's setState effect into an infinite loop on the optimistic-create
        // path. The stages must be memoized so the reference only changes when inputs change.
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        mockGetSections.mockReturnValue([[{transactionID: '1'}], 1, false]);
        mockGetSortedSections.mockReturnValue([{transactionID: '1', keyForList: '1'}]);

        // Stable props captured from closure so the re-render below passes identical inputs.
        const props = {
            queryJSON: makeQueryJSON(),
            searchResults,
            transactions: undefined,
            reportActions: undefined,
        };

        const {result, rerender} = renderHook(() => useSearchSnapshot(props));

        const firstChartData = result.current.chartData;
        const firstData = result.current.data;

        rerender({});

        expect(result.current.chartData).toBe(firstChartData);
        expect(result.current.data).toBe(firstData);
    });

    it('caps data at visibleRowLimit while leaving chartData and the row count untouched', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        const rows = Array.from({length: 5}, (_value, index) => ({transactionID: `${index}`, keyForList: `${index}`}));
        mockGetSections.mockReturnValue([rows, rows.length, false]);
        mockGetSortedSections.mockReturnValue(rows);

        const {result, rerender} = renderHook((visibleRowLimit?: number) =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
                visibleRowLimit,
            }),
        );

        expect(result.current.data).toHaveLength(5);

        rerender(2);

        expect(result.current.data.map((item) => item.keyForList)).toEqual(['0', '1']);
        expect(result.current.chartData).toHaveLength(5);
        expect(result.current.filteredDataLength).toBe(5);

        rerender(10);

        // a fresh array here re-renders the list on every pass
        expect(result.current.data).toBe(result.current.chartData);
    });

    it('caps filteredData to the rendered rows so bulk actions cannot reach unrendered ones', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        // live to-do rows, the only ones capped, are report groups
        const rows = Array.from({length: 5}, (_value, index) => ({reportID: `${index}`, keyForList: `${index}`, transactions: []}));
        mockGetSections.mockReturnValue([rows, rows.length, false]);
        // sorted order reverses the section order, so slicing `filteredData` on its own would select the wrong rows
        mockGetSortedSections.mockReturnValue([...rows].reverse());

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
                visibleRowLimit: 2,
            }),
        );

        expect(result.current.data.map((item) => item.keyForList)).toEqual(['4', '3']);
        expect(result.current.filteredData).toEqual(result.current.data);
        // uncapped, or the offline reveal would never know there are more cached rows
        expect(result.current.filteredDataLength).toBe(5);
    });

    it('leaves filteredData as the unsorted sections when the limit exactly matches the row count', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        const rows = Array.from({length: 3}, (_value, index) => ({transactionID: `${index}`, keyForList: `${index}`}));
        mockGetSections.mockReturnValue([rows, rows.length, false]);
        mockGetSortedSections.mockReturnValue([...rows].reverse());

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
                visibleRowLimit: 3,
            }),
        );

        // cap only engages above the limit, so filteredData stays the pre-sort sections
        expect(result.current.data.map((item) => item.keyForList)).toEqual(['2', '1', '0']);
        expect(result.current.filteredData).toBe(rows);
    });

    it('keeps the capped data reference across a rerender at the same limit', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        const rows = Array.from({length: 5}, (_value, index) => ({transactionID: `${index}`, keyForList: `${index}`}));
        mockGetSections.mockReturnValue([rows, rows.length, false]);
        mockGetSortedSections.mockReturnValue(rows);

        const {result, rerender} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
                visibleRowLimit: 2,
            }),
        );

        const firstData = result.current.data;

        rerender({});

        // slice is a fresh array per call, so losing the memo re-renders the whole list every pass
        expect(result.current.data).toBe(firstData);
    });

    it('caps grouped rows by group, keeping unrendered groups out of selection', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        const groups = Array.from({length: 3}, (_value, index) => ({
            groupID: `group${index}`,
            keyForList: `group${index}`,
            transactions: [{transactionID: `${index}-a`}, {transactionID: `${index}-b`}],
        }));
        mockGetSections.mockReturnValue([groups, groups.length, false]);
        mockGetSortedSections.mockReturnValue(groups);

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON({groupBy: CONST.SEARCH.GROUP_BY.FROM}),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
                visibleRowLimit: 2,
            }),
        );

        expect(result.current.data.map((item) => item.keyForList)).toEqual(['group0', 'group1']);
        // cap slices whole groups, so group2's transactions must be unreachable for bulk actions
        expect(result.current.filteredData).toEqual(groups.slice(0, 2).map((group) => expect.objectContaining({keyForList: group.keyForList, transactions: group.transactions})));
    });

    it('does not spend visibleRowLimit on rows being deleted online', () => {
        // Given a live list capped at two rows, whose first two rows are being deleted while online
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        const rows = Array.from({length: 5}, (_value, index) => ({
            transactionID: `${index}`,
            keyForList: `${index}`,
            pendingAction: index < 2 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
        }));
        mockGetSections.mockReturnValue([rows, rows.length, false]);
        mockGetSortedSections.mockReturnValue(rows);

        // When the snapshot is projected under the cap
        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
                visibleRowLimit: 2,
            }),
        );

        // Then two rows the user can see still render, because online the deleted rows are hidden and would leave the page short
        const shownRows = result.current.data.filter((item) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(shownRows.map((item) => item.keyForList)).toEqual(['2', '3']);
    });

    it('keeps a group past visibleRowLimit on screen while one of its expenses is ticked', () => {
        // Given a live list capped at two groups, where an expense inside the last group is ticked
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        const groups = Array.from({length: 5}, (_value, index) => ({
            groupID: `group${index}`,
            keyForList: `group${index}`,
            transactions: [{transactionID: `${index}`, keyForList: `transaction${index}`}],
        }));
        mockGetSections.mockReturnValue([groups, groups.length, false]);
        mockGetSortedSections.mockReturnValue(groups);

        // When the snapshot is projected with that selection
        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON({groupBy: CONST.SEARCH.GROUP_BY.FROM}),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
                visibleRowLimit: 2,
                selectedTransactions: {transaction4: createMock<SelectedTransactionInfo>({isSelected: true})},
            }),
        );

        // Then the list renders down to that group, because the selection sync drops any tick it cannot see
        expect(result.current.data.map((item) => item.keyForList)).toEqual(['group0', 'group1', 'group2', 'group3', 'group4']);
    });

    it('counts rows being deleted against visibleRowLimit while offline, where they show struck through', () => {
        // Given an offline live list capped at two rows, whose first two rows are being deleted
        mockIsOffline = true;
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        const rows = Array.from({length: 5}, (_value, index) => ({
            transactionID: `${index}`,
            keyForList: `${index}`,
            pendingAction: index < 2 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
        }));
        mockGetSections.mockReturnValue([rows, rows.length, false]);
        mockGetSortedSections.mockReturnValue(rows);

        // When the snapshot is projected under the cap
        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                transactions: undefined,
                reportActions: undefined,
                visibleRowLimit: 2,
            }),
        );

        // Then the two deleted rows fill the page, because offline the user sees them
        expect(result.current.data.map((item) => item.keyForList)).toEqual(['0', '1']);
    });
});
