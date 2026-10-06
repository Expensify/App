/**
 * Contracts asserted:
 *   - the Insights chart fetches once when Home is the active tab
 *   - closing an RHP over Home does not refetch it
 *   - an expense change moves the derived spend counter and does refetch it
 *   - joining a workspace fetches it again
 */
import {renderHook} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import useIsTabFocused from '@hooks/useIsTabFocused';

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

beforeEach(() => {
    for (const key of Object.keys(onyxData)) {
        delete onyxData[key];
    }
    mockedSearch.mockClear();
    mockedUseIsFocused.mockReturnValue(true);
    mockedUseIsTabFocused.mockReturnValue(true);
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

    it('fetches again when an expense changes', () => {
        // Given the chart has already fetched
        const {rerender} = renderHook(() => useInsightData(config));

        // When an expense changes, which moves the derived counter but no query
        onyxData[ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE] = {expenses: 1, cardExpenses: 0};
        rerender(undefined);

        // Then the chart fetches again instead of showing a snapshot it knows nothing about
        expect(mockedSearch).toHaveBeenCalledTimes(2);
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
