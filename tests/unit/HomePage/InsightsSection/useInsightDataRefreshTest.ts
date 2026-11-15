/**
 * Contracts asserted:
 *   - the Insights chart fetches once when Home is the active tab
 *   - closing an RHP over Home does not refetch it
 *   - expense changes do not refetch it, including after closing an RHP
 *   - returning to Home, changing charts, and reconnecting still refetch it
 *   - joining a workspace fetches it again
 */
import {renderHook} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import useIsTabFocused from '@hooks/useIsTabFocused';
import useNetwork from '@hooks/useNetwork';

import {search} from '@libs/actions/Search';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';

import useInsightData from '@pages/home/InsightsSection/useInsightData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useIsFocused} from '@react-navigation/native';

const SNAPSHOT_HASH = 4242;

const queryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense groupBy:month',
    hash: SNAPSHOT_HASH,
    recentSearchHash: SNAPSHOT_HASH,
    similarSearchHash: SNAPSHOT_HASH,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    view: CONST.SEARCH.VIEW.LINE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
    sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
    flatFilters: [],
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE, right: CONST.SEARCH.DATA_TYPES.EXPENSE},
};

const config: SearchTypeMenuItem = {
    key: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    translationPath: 'common.expenses',
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    icon: 'Receipt',
    searchQuery: queryJSON.inputQuery,
    searchQueryJSON: queryJSON,
    hash: SNAPSHOT_HASH,
    similarSearchHash: SNAPSHOT_HASH,
    recentSearchHash: SNAPSHOT_HASH,
};

// Module mocks

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
    createNavigationContainerRef: () => ({}),
}));

// Mandatory: the real hook reads the root navigation state, which is never ready under Jest, so it
// would report "not focused" and the search would silently never fire.
jest.mock('@hooks/useIsTabFocused', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}));

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: jest.fn(() => ({isOffline: false})),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: 1, login: 'user@test.com'})),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: jest.fn(() => ({translate: (key: string) => key, localeCompare: () => 0, formatPhoneNumber: (value: string) => value, dateFnsLocale: undefined})),
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({convertToDisplayString: (value: number) => String(value)})),
}));

const onyxData: Record<string, unknown> = {};

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => [options?.selector ? options.selector(onyxData[key]) : onyxData[key]]),
}));

const mockedSearch = jest.mocked(search);
const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseIsTabFocused = jest.mocked(useIsTabFocused);
const mockedUseNetwork = jest.mocked(useNetwork);

beforeEach(() => {
    for (const key of Object.keys(onyxData)) {
        delete onyxData[key];
    }
    mockedSearch.mockClear();
    mockedUseIsFocused.mockReturnValue(true);
    mockedUseIsTabFocused.mockReturnValue(true);
    mockedUseNetwork.mockReturnValue({isOffline: false});
});

describe('useInsightData — refresh gating', () => {
    it('fetches once when Home is the active tab', () => {
        // Given the Home tab is active and visible

        // When the chart hook mounts
        renderHook(() => useInsightData(config));

        // Then it fetches its snapshot once
        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('does not refetch when an RHP opens and closes over Home', () => {
        // Given the chart has already fetched
        const {rerender} = renderHook(() => useInsightData(config));
        expect(mockedSearch).toHaveBeenCalledTimes(1);

        // When an RHP is pushed over Home and popped again
        mockedUseIsFocused.mockReturnValue(false);
        rerender(undefined);
        mockedUseIsFocused.mockReturnValue(true);
        rerender(undefined);

        // Then nothing is refetched, since nothing changed
        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('does not refetch when expenses are added, edited, or deleted', () => {
        // Given the chart has already fetched
        const {rerender} = renderHook(() => useInsightData(config));

        // When successive expense updates move the derived counter without changing the query
        for (const expenses of [1, 2, 3]) {
            onyxData[ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE] = {expenses, cardExpenses: 0};
            rerender(undefined);
        }

        // Then the chart keeps its snapshot instead of live-updating
        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('does not queue an expense-driven refresh behind an RHP', () => {
        // Given an RHP covers Home after the chart has loaded
        const {rerender} = renderHook(() => useInsightData(config));
        mockedUseIsFocused.mockReturnValue(false);
        rerender(undefined);

        // When expenses change behind the RHP and it is then closed
        for (const expenses of [1, 2, 3]) {
            onyxData[ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE] = {expenses, cardExpenses: 0};
            rerender(undefined);
        }
        expect(mockedSearch).toHaveBeenCalledTimes(1);
        mockedUseIsFocused.mockReturnValue(true);
        rerender(undefined);

        // Then closing the RHP does not replay an expense-driven search
        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('fetches again when returning to the Home tab', () => {
        // Given the chart loaded before navigating to another tab
        const {rerender} = renderHook(() => useInsightData(config));
        mockedUseIsTabFocused.mockReturnValue(false);
        mockedUseIsFocused.mockReturnValue(false);
        rerender(undefined);
        expect(mockedSearch).toHaveBeenCalledTimes(1);

        // When Home becomes the active, visible tab again
        mockedUseIsTabFocused.mockReturnValue(true);
        mockedUseIsFocused.mockReturnValue(true);
        rerender(undefined);

        // Then the chart gets fresh data even though its query is unchanged
        expect(mockedSearch).toHaveBeenCalledTimes(2);
    });

    it('fetches the newly selected chart', () => {
        // Given the initial chart has loaded
        const {rerender} = renderHook((selectedConfig: SearchTypeMenuItem) => useInsightData(selectedConfig), {initialProps: config});
        const nextQuery = {...queryJSON, hash: SNAPSHOT_HASH + 1, groupBy: CONST.SEARCH.GROUP_BY.CATEGORY};
        const nextConfig = {...config, searchQueryJSON: nextQuery, key: CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES};

        // When selecting a chart with a different query
        rerender(nextConfig);

        // Then the new chart is fetched with the existing Home search options
        expect(mockedSearch).toHaveBeenCalledTimes(2);
        expect(mockedSearch).toHaveBeenLastCalledWith({
            queryJSON: nextQuery,
            searchKey: nextConfig.key,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
            shouldUpdateLastSearchParams: false,
            skipWaitForWrites: true,
        });
    });

    it('does not refetch for an equivalent chart configuration', () => {
        // Given the chart has already loaded
        const {rerender} = renderHook((selectedConfig: SearchTypeMenuItem) => useInsightData(selectedConfig), {initialProps: config});

        // When a render rebuilds the configuration without changing its query hash
        rerender({...config, searchQueryJSON: {...queryJSON}});

        // Then object identity alone does not trigger another search
        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('fetches again after reconnecting', () => {
        // Given the chart loaded before the connection was lost
        const {rerender} = renderHook(() => useInsightData(config));
        mockedUseNetwork.mockReturnValue({isOffline: true});
        rerender(undefined);
        expect(mockedSearch).toHaveBeenCalledTimes(1);

        // When the connection is restored
        mockedUseNetwork.mockReturnValue({isOffline: false});
        rerender(undefined);

        // Then the chart refreshes without needing an expense update
        expect(mockedSearch).toHaveBeenCalledTimes(2);
    });

    it('waits for configuration resolution before fetching', () => {
        // Given the persisted chart selection has not loaded yet
        const {rerender} = renderHook((isConfigResolved: boolean) => useInsightData(config, isConfigResolved), {initialProps: false});
        expect(mockedSearch).not.toHaveBeenCalled();

        // When the chart configuration finishes loading
        rerender(true);

        // Then the resolved chart is fetched once, not a temporary fallback
        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('fetches again when the user joins a workspace', () => {
        // Given the chart has already fetched
        const {rerender} = renderHook(() => useInsightData(config));

        // When a workspace arrives, which brings its members' spend into the chart without changing any local expense
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {[`${ONYXKEYS.COLLECTION.POLICY}W1`]: {id: 'W1'}};
        rerender(undefined);

        // Then the chart fetches again so the new spend shows up
        expect(mockedSearch).toHaveBeenCalledTimes(2);
    });

    it('does not refetch when a workspace it already knows changes', () => {
        // Given the chart has fetched with one workspace
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {[`${ONYXKEYS.COLLECTION.POLICY}W1`]: {id: 'W1'}};
        const {rerender} = renderHook(() => useInsightData(config));

        // When that workspace is edited, so the set of workspaces stays the same
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {[`${ONYXKEYS.COLLECTION.POLICY}W1`]: {id: 'W1', name: 'Renamed'}};
        rerender(undefined);

        // Then nothing is refetched, since the chart only cares which workspaces the user is in
        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });
});
