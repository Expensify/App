import {renderHook} from '@testing-library/react-native';

import useSearchSnapshot from '@components/Search/hooks/useSearchSnapshot';
import type {SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

const onyxData: Record<string, unknown> = {};

// Aux Onyx reads (cards, bank accounts, etc.) are irrelevant here because getSections is mocked.
const mockUseOnyx = jest.fn((key: string) => [onyxData[key]]);
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
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
    useSearchQueryContext: () => ({currentSearchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}),
    useSearchResultsContext: () => ({shouldUseLiveData: false}),
}));
jest.mock('@libs/TransactionUtils', () => ({
    shouldShowAttendees: () => false,
}));
jest.mock('@libs/SearchQueryUtils', () => ({
    isDefaultExpensesQuery: () => false,
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
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
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
                newSearchResultKeys: undefined,
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
                newSearchResultKeys: undefined,
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
                newSearchResultKeys: undefined,
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
                newSearchResultKeys: undefined,
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
                newSearchResultKeys: undefined,
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
                newSearchResultKeys: undefined,
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
                newSearchResultKeys: undefined,
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
                newSearchResultKeys: undefined,
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(result.current.data).toBe(stabilized);
        expect(result.current.hasCachedOptimisticItem).toBe(true);
    });

    it('stamps the post-create highlight on matching rows (newSearchResultKeys)', () => {
        const searchResults = makeSearchResults();
        mockUseOptimisticSearchTracking.mockReturnValue(trackingReturn(searchResults.data));
        mockGetSortedSections.mockReturnValue([{transactionID: '7', keyForList: '7'}]);

        const {result} = renderHook(() =>
            useSearchSnapshot({
                queryJSON: makeQueryJSON(),
                searchResults,
                newSearchResultKeys: new Set([`${ONYXKEYS.COLLECTION.TRANSACTION}7`]),
                transactions: undefined,
                reportActions: undefined,
            }),
        );

        expect(result.current.chartData.at(0)).toEqual(expect.objectContaining({shouldAnimateInHighlight: true}));
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
                    newSearchResultKeys: undefined,
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
            newSearchResultKeys: undefined,
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
});
