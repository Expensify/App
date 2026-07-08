import {renderHook} from '@testing-library/react-native';

import useGroupedTransactionSections from '@components/Search/hooks/useGroupedTransactionSections';
import type {SearchShell} from '@components/Search/hooks/useSearchShell';
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
    useSearchQueryContext: () => ({currentSearchKey: undefined}),
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
jest.mock('@libs/SearchUIUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getSections: (...args: unknown[]) => mockGetSections(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getSortedSections: (...args: unknown[]) => mockGetSortedSections(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getColumnsToShow: (...args: unknown[]) => mockGetColumnsToShow(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getValidGroupBy: (...args: unknown[]) => mockGetValidGroupBy(...args),
}));

// The optimistic re-injection hook is mocked so this suite exercises the leaf's WIRING (correct inputs in,
// their outputs forwarded). Its own logic is covered by its dedicated hook test.
const mockUseStableOptimisticSortedData = jest.fn();
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

// Builds the type-agnostic `shell` the grouped leaf consumes. In production this comes from useSearchShell;
// here we hand it the pieces the leaf reads directly so the suite stays focused on the leaf's projection.
function makeShell(
    searchDataWithOptimisticTransaction: unknown,
    {shouldComputeSections = true, optimisticWatchKey, optimisticTransactionID}: {shouldComputeSections?: boolean; optimisticWatchKey?: string; optimisticTransactionID?: string} = {},
): SearchShell {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        shouldComputeSections,
        searchDataWithOptimisticTransaction,
        trackingState: {optimisticWatchKey},
        optimisticTransactionID,
        showPendingExpensePlaceholder: false,
        shouldDeferHeavySearchWork: false,
        setShouldDeferHeavySearchWork: jest.fn(),
        hasPendingWriteOnMountRef: {current: {hasPendingWriteOnMount: false}},
        skipDeferralOnFocusRef: {current: false},
        rearmTracking: jest.fn(),
    } as unknown as SearchShell;
}

describe('useGroupedTransactionSections', () => {
    beforeEach(() => {
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockUseOnyx.mockClear();
        mockGetSections.mockReset().mockReturnValue([[], 0, false]);
        mockGetSortedSections.mockReset().mockReturnValue([]);
        mockGetColumnsToShow.mockReset().mockReturnValue([]);
        mockGetValidGroupBy.mockReset().mockImplementation((groupBy: unknown) => groupBy);
        mockUseStableOptimisticSortedData.mockReset().mockImplementation((sortedData: unknown) => ({
            stableSortedData: sortedData,
            hasCachedOptimisticItem: false,
        }));
    });

    it('projects sorted data + columns + meta from the snapshot', () => {
        const searchResults = makeSearchResults();
        const sorted = [{transactionID: '1', keyForList: '1'}];
        mockGetSections.mockReturnValue([[{transactionID: '1'}], 1, false]);
        mockGetSortedSections.mockReturnValue(sorted);
        mockGetColumnsToShow.mockReturnValue(['merchant']);

        const {result} = renderHook(() =>
            useGroupedTransactionSections({
                shell: makeShell(searchResults.data),
                queryJSON: makeQueryJSON(),
                searchResults,
                newSearchResultKeys: undefined,
            }),
        );

        expect(mockGetSections).toHaveBeenCalledWith(expect.objectContaining({data: searchResults.data}));
        expect(mockGetSortedSections).toHaveBeenCalled();
        expect(result.current.chartData).toHaveLength(1);
        expect(result.current.chartData.at(0)?.keyForList).toBe('1');
        // data is the stabilized passthrough of the (highlight-stamped) chartData in this mock setup.
        expect(result.current.data).toBe(result.current.chartData);
        expect(result.current.columns).toEqual(['merchant']);
        expect(result.current.hasLoadedAllTransactions).toBe(true);
        expect(result.current.allDataLength).toBe(1);
        expect(result.current.hasDeletedTransaction).toBe(false);
    });

    it('returns empty data and skips getSections when there is no augmented snapshot', () => {
        // searchDataWithOptimisticTransaction undefined (no snapshot / deep-link before search ran).
        const {result} = renderHook(() =>
            useGroupedTransactionSections({
                shell: makeShell(undefined),
                queryJSON: makeQueryJSON(),
                searchResults: undefined,
                newSearchResultKeys: undefined,
            }),
        );

        expect(mockGetSections).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
        expect(result.current.filteredDataLength).toBe(0);
    });

    it('skips getSections when the shell gate is closed', () => {
        // The gate (defer / not-yet-loaded / invalid group-by-on-chat) is owned by useSearchShell; the leaf
        // only honors the resulting boolean.
        const searchResults = makeSearchResults();
        const {result} = renderHook(() =>
            useGroupedTransactionSections({
                shell: makeShell(searchResults.data, {shouldComputeSections: false}),
                queryJSON: makeQueryJSON(),
                searchResults,
                newSearchResultKeys: undefined,
            }),
        );

        expect(mockGetSections).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
    });

    it('feeds the optimistic-augmented data and watch key into getSections', () => {
        const augmented = {
            transactions: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}999`]: {transactionID: '999'},
            },
        };
        const searchResults = makeSearchResults();

        renderHook(() =>
            useGroupedTransactionSections({
                shell: makeShell(augmented, {optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}999`, optimisticTransactionID: '999'}),
                queryJSON: makeQueryJSON(),
                searchResults,
                newSearchResultKeys: undefined,
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
        mockGetSortedSections.mockReturnValue([{keyForList: 'sorted'}]);
        const stabilized = [{keyForList: 'sorted'}, {keyForList: 'optimistic-extra'}];
        mockUseStableOptimisticSortedData.mockReturnValue({
            stableSortedData: stabilized,
            hasCachedOptimisticItem: true,
        });

        const {result} = renderHook(() =>
            useGroupedTransactionSections({
                shell: makeShell(searchResults.data),
                queryJSON: makeQueryJSON(),
                searchResults,
                newSearchResultKeys: undefined,
            }),
        );

        expect(result.current.data).toBe(stabilized);
        expect(result.current.hasCachedOptimisticItem).toBe(true);
    });

    it('stamps the post-create highlight on matching rows (newSearchResultKeys)', () => {
        const searchResults = makeSearchResults();
        mockGetSortedSections.mockReturnValue([{transactionID: '7', keyForList: '7'}]);

        const {result} = renderHook(() =>
            useGroupedTransactionSections({
                shell: makeShell(searchResults.data),
                queryJSON: makeQueryJSON(),
                searchResults,
                newSearchResultKeys: new Set([`${ONYXKEYS.COLLECTION.TRANSACTION}7`]),
            }),
        );

        expect(result.current.chartData.at(0)).toEqual(expect.objectContaining({shouldAnimateInHighlight: true}));
    });

    it('passes the query type through to getSortedSections for each transaction variant', () => {
        const variants = [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP];
        for (const type of variants) {
            const searchResults = makeSearchResults({type});
            mockGetSortedSections.mockClear();

            renderHook(() =>
                useGroupedTransactionSections({
                    shell: makeShell(searchResults.data),
                    queryJSON: makeQueryJSON({type}),
                    searchResults,
                    newSearchResultKeys: undefined,
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
        mockGetSections.mockReturnValue([[{transactionID: '1'}], 1, false]);
        mockGetSortedSections.mockReturnValue([{transactionID: '1', keyForList: '1'}]);

        // Stable props captured from closure so the re-render below passes identical inputs.
        const props = {
            shell: makeShell(searchResults.data),
            queryJSON: makeQueryJSON(),
            searchResults,
            newSearchResultKeys: undefined,
        };

        const {result, rerender} = renderHook(() => useGroupedTransactionSections(props));

        const firstChartData = result.current.chartData;
        const firstData = result.current.data;

        rerender({});

        expect(result.current.chartData).toBe(firstChartData);
        expect(result.current.data).toBe(firstData);
    });
});
