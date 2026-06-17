import {renderHook} from '@testing-library/react-native';
import useSearchSnapshot from '@components/Search/hooks/useSearchSnapshot';
import type {SearchQueryJSON} from '@components/Search/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const onyxData: Record<string, unknown> = {};

// Selectors are mocked to identity below, so the mock can ignore them and return the raw value.
const mockUseOnyx = jest.fn((key: string) => [onyxData[key]]);

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({localeCompare: (a: string, b: string) => a.localeCompare(b), formatPhoneNumber: (phone: string) => phone, translate: (key: string) => key}),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1, email: 'test@test.com'})}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({convertToDisplayString: () => ''})}));
jest.mock('@hooks/useActionLoadingReportIDs', () => ({__esModule: true, default: () => new Set()}));
jest.mock('@hooks/useArchivedReportsIDSet', () => ({__esModule: true, default: () => new Set()}));
jest.mock('@hooks/useReportAttributes', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/usePolicyForMovingExpenses', () => ({__esModule: true, default: () => ({policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined})}));

jest.mock('@components/Search/SearchContext', () => ({useSearchQueryContext: () => ({currentSearchKey: undefined})}));
jest.mock('@libs/TransactionUtils', () => ({shouldShowAttendees: () => false}));
jest.mock('@libs/SearchQueryUtils', () => ({isDefaultExpensesQuery: () => false}));
jest.mock('@libs/ReportUtils', () => ({selectFilteredReportActions: (value: unknown) => value}));
jest.mock('@src/selectors/AdvancedSearchFiltersForm', () => ({columnsSelector: (value: unknown) => value}));

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

// Phase 1/2 are composed in; mock them so this suite exercises the hook's WIRING (correct inputs in,
// phase outputs returned). The phases' own logic is covered by their hooks + getSections tests.
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
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${HASH}`;

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
        // Default: no optimistic write pending, snapshot data passed through unchanged.
        mockUseOptimisticSearchTracking.mockReset().mockReturnValue({searchDataWithOptimisticTransaction: undefined, trackingState: {optimisticWatchKey: undefined}});
        // Default Phase 2: passthrough of the sorted data.
        mockUseStableOptimisticSortedData.mockReset().mockImplementation((sortedData: unknown) => ({stableSortedData: sortedData, hasCachedOptimisticItem: false}));
    });

    it('projects sorted data + columns + meta from the snapshot', () => {
        const snapshotData = {transactions: {}};
        onyxData[SNAPSHOT_KEY] = {data: snapshotData, search: {isLoading: false, hasMoreResults: false, type: CONST.SEARCH.DATA_TYPES.EXPENSE}};
        mockUseOptimisticSearchTracking.mockReturnValue({searchDataWithOptimisticTransaction: snapshotData, trackingState: {optimisticWatchKey: undefined}});
        const sorted = [{transactionID: '1', keyForList: '1'}];
        mockGetSections.mockReturnValue([[{transactionID: '1'}], 1, false]);
        mockGetSortedSections.mockReturnValue(sorted);
        mockGetColumnsToShow.mockReturnValue(['merchant']);

        const {result} = renderHook(() => useSearchSnapshot(makeQueryJSON()));

        expect(mockGetSections).toHaveBeenCalledWith(expect.objectContaining({data: snapshotData}));
        expect(mockGetSortedSections).toHaveBeenCalled();
        expect(result.current.data).toBe(sorted);
        expect(result.current.columns).toEqual(['merchant']);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.hasLoadedAllTransactions).toBe(true);
    });

    it('returns empty data and skips getSections when the snapshot has no data', () => {
        // searchDataWithOptimisticTransaction undefined (no snapshot / deep-link before search ran).
        const {result} = renderHook(() => useSearchSnapshot(makeQueryJSON()));

        expect(mockGetSections).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
    });

    it('skips getSections when group-by is combined with a chat search (invalid combo)', () => {
        const snapshotData = {transactions: {}};
        onyxData[SNAPSHOT_KEY] = {data: snapshotData, search: {isLoading: false}};
        mockUseOptimisticSearchTracking.mockReturnValue({searchDataWithOptimisticTransaction: snapshotData, trackingState: {optimisticWatchKey: undefined}});

        const {result} = renderHook(() => useSearchSnapshot(makeQueryJSON({type: CONST.SEARCH.DATA_TYPES.CHAT, groupBy: CONST.SEARCH.GROUP_BY.FROM})));

        expect(mockGetSections).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
    });

    it('derives meta from the snapshot search block', () => {
        onyxData[SNAPSHOT_KEY] = {data: {transactions: {}}, search: {isLoading: true, hasMoreResults: true, type: CONST.SEARCH.DATA_TYPES.EXPENSE}};
        mockUseOptimisticSearchTracking.mockReturnValue({searchDataWithOptimisticTransaction: {transactions: {}}, trackingState: {optimisticWatchKey: undefined}});

        const {result} = renderHook(() => useSearchSnapshot(makeQueryJSON()));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.hasMore).toBe(true);
        // Flat (no group-by) is always considered fully loaded.
        expect(result.current.hasLoadedAllTransactions).toBe(true);
    });

    it('feeds the optimistic-augmented data and watch key into getSections (Phase 1 wiring)', () => {
        const augmented = {transactions: {[`${ONYXKEYS.COLLECTION.TRANSACTION}999`]: {transactionID: '999'}}};
        onyxData[SNAPSHOT_KEY] = {data: {transactions: {}}, search: {isLoading: false}};
        mockUseOptimisticSearchTracking.mockReturnValue({searchDataWithOptimisticTransaction: augmented, trackingState: {optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}999`}});

        renderHook(() => useSearchSnapshot(makeQueryJSON()));

        expect(mockGetSections).toHaveBeenCalledWith(expect.objectContaining({data: augmented, optimisticTransactionID: '999'}));
    });

    it('returns the Phase 2 stabilized data, not the raw sorted data (Phase 2 wiring)', () => {
        const snapshotData = {transactions: {}};
        onyxData[SNAPSHOT_KEY] = {data: snapshotData, search: {isLoading: false}};
        mockUseOptimisticSearchTracking.mockReturnValue({searchDataWithOptimisticTransaction: snapshotData, trackingState: {optimisticWatchKey: undefined}});
        mockGetSortedSections.mockReturnValue([{keyForList: 'sorted'}]);
        const reinjected = [{keyForList: 'sorted'}, {keyForList: 'reinjected-optimistic'}];
        mockUseStableOptimisticSortedData.mockReturnValue({stableSortedData: reinjected, hasCachedOptimisticItem: true});

        const {result} = renderHook(() => useSearchSnapshot(makeQueryJSON()));

        expect(result.current.data).toBe(reinjected);
    });

    it('passes the query type through to getSortedSections for each variant shape', () => {
        const snapshotData = {transactions: {}};
        const variants = [
            CONST.SEARCH.DATA_TYPES.CHAT,
            CONST.SEARCH.DATA_TYPES.TASK,
            CONST.SEARCH.DATA_TYPES.EXPENSE,
            CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            CONST.SEARCH.DATA_TYPES.INVOICE,
        ];
        for (const type of variants) {
            onyxData[SNAPSHOT_KEY] = {data: snapshotData, search: {isLoading: false, type}};
            mockUseOptimisticSearchTracking.mockReturnValue({searchDataWithOptimisticTransaction: snapshotData, trackingState: {optimisticWatchKey: undefined}});
            mockGetSortedSections.mockClear();

            renderHook(() => useSearchSnapshot(makeQueryJSON({type})));

            expect(mockGetSortedSections).toHaveBeenCalled();
            // First positional arg to getSortedSections is the search data type for the variant.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(mockGetSortedSections.mock.calls.at(-1)?.[0]).toBe(type);
        }
    });
});
