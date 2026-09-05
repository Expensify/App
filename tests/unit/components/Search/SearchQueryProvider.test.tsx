import {act, renderHook} from '@testing-library/react-native';

import {SearchQueryActionsContext, SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import SearchQueryProvider from '@components/Search/SearchQueryProvider';

import type * as SearchActions from '@libs/actions/Search';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {savedSearchIDToSearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

import {useContext} from 'react';

const SAVED_SEARCH_ID = '100';

// The default query string of the "Reconciliation" suggested search, without its `withdrawn` default filter.
const RECONCILIATION_QUERY_WITHOUT_WITHDRAWN =
    `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} ` +
    `${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY}:${CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN} ` +
    `${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER}:${CONST.SEARCH.SORT_ORDER.DESC} ` +
    `${CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW}:${CONST.SEARCH.VIEW.TABLE} ` +
    `${CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY}:${CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID} ` +
    `${CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE}:${CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT}`;

// The default query string of the "Reconciliation" suggested search.
const RECONCILIATION_QUERY = `${RECONCILIATION_QUERY_WITHOUT_WITHDRAWN} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN}:${CONST.SEARCH.DATE_PRESETS.LAST_MONTH}`;

const mockGetDeepestFocusedScreen = jest.fn<{name: string; params: {q?: string; rawQuery?: string}}, []>();
const mockUseOnyx = jest.fn<[unknown], [key: string]>();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {},
    getDeepestFocusedScreen: () => mockGetDeepestFocusedScreen(),
}));

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {...actual, useNavigation: () => ({getState: () => undefined})};
});

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: unknown) => unknown) => selector(undefined),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

// A query with a `category` filter makes the provider load the category data, which fires a real API request.
jest.mock('@libs/actions/Search', () => ({
    ...jest.requireActual<typeof SearchActions>('@libs/actions/Search'),
    openSearchCategoryFiltersPage: jest.fn(),
}));

function mockNavigationQuery(query: string | undefined, rawQuery?: string) {
    mockGetDeepestFocusedScreen.mockReturnValue({name: SCREENS.SEARCH.ROOT, params: {q: query, rawQuery}});
}

function mockOnyx(data: Record<string, unknown> = {}) {
    mockUseOnyx.mockImplementation((key: string) => [data[key]]);
}

function mockSearchFilter(query: string) {
    return {query, timestamp: '2026-08-21 00:00:00.000'};
}

function useSearchQuery() {
    return {...useContext(SearchQueryContext), ...useContext(SearchQueryActionsContext)};
}

function renderProvider() {
    return renderHook(useSearchQuery, {wrapper: SearchQueryProvider});
}

describe('SearchQueryProvider', () => {
    beforeEach(() => {
        mockGetDeepestFocusedScreen.mockReset();
        mockUseOnyx.mockReset();
        mockOnyx();
    });

    describe('initial currentSearchKey', () => {
        it('matches a suggested search by its default query', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('matches a suggested search by its last (SEARCH_FILTERS) query', () => {
            mockOnyx({[ONYXKEYS.SEARCH_FILTERS]: {[CONST.SEARCH.SEARCH_KEYS.SUBMIT]: mockSearchFilter(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`)}});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.SUBMIT);
        });

        it('ignores a last query that is stored in the legacy string format', () => {
            mockOnyx({[ONYXKEYS.SEARCH_FILTERS]: {[CONST.SEARCH.SEARCH_KEYS.SUBMIT]: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`}});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('matches a suggested search by its default query even when the last query exists', () => {
            mockOnyx({
                [ONYXKEYS.SEARCH_FILTERS]: {[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]: mockSearchFilter(`${RECONCILIATION_QUERY} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM}:123`)},
            });
            mockNavigationQuery(RECONCILIATION_QUERY);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('matches a saved search by its default query', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}}});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });

        it('matches a saved search by its last (SEARCH_FILTERS) query', () => {
            const savedSearchKey = savedSearchIDToSearchKey(SAVED_SEARCH_ID);
            mockOnyx({
                [ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}},
                [ONYXKEYS.SEARCH_FILTERS]: {[savedSearchKey]: mockSearchFilter(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`)},
            });
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(savedSearchKey);
        });

        it('matches a saved search by its default query even when the last query exists', () => {
            const savedSearchKey = savedSearchIDToSearchKey(SAVED_SEARCH_ID);
            mockOnyx({
                [ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}},
                [ONYXKEYS.SEARCH_FILTERS]: {[savedSearchKey]: mockSearchFilter(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`)},
            });
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(savedSearchKey);
        });

        it('falls back to the generic expenses key when the type is expense and nothing matches', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('falls back to the generic reports key when the type is expense report and nothing matches', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Amazon`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('is undefined when the type has no generic key and nothing matches', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBeUndefined();
        });
    });

    describe('currentDefaultSearchQueryJSON', () => {
        it('exposes the default query of the current suggested search', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
            expect(result.current.currentDefaultSearchQueryJSON?.hash).toBe(buildSearchQueryJSON(RECONCILIATION_QUERY)?.hash);
            expect([...result.current.currentDefaultSearchQueryFilterKeys]).toEqual(
                expect.arrayContaining([CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE, CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN]),
            );
        });

        it('is empty for a saved search because saved searches have no default filters', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}}});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
            expect(result.current.currentDefaultSearchQueryJSON).toBeUndefined();
            expect(result.current.currentDefaultSearchQueryFilterKeys.size).toBe(0);
        });
    });

    describe('resetting on hash change', () => {
        const savedSearches = {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}};

        it('keeps the search key when the new query still has the default filters and same type', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            // Adding a filter changes the hash but keeps all the default filters + type, so the key must be preserved.
            mockNavigationQuery(`${RECONCILIATION_QUERY} merchant:Amazon`);
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('resets the search key when the new query drops a default filter', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            mockNavigationQuery(RECONCILIATION_QUERY_WITHOUT_WITHDRAWN);
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('resets the search key when the query type changes', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            mockNavigationQuery(RECONCILIATION_QUERY.replace(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`, `type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}`));
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('keeps a saved search key when the query changes since there are no default filters to enforce', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));

            // The saved search query filters (and even its type) are not enforced, so the key survives the change.
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} category:Food`);
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });

        it('recomputes the search key via the resetSearchKey action', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            act(() => {
                result.current.setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.REPORTS);
            });
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);

            act(() => {
                result.current.resetSearchKey(false, result.current.currentSearchQueryJSON);
            });
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('always re-resolves the key, even when the target query hash is unchanged', () => {
            const OTHER_SAVED_SEARCH_ID = '200';
            const sharedQuery = `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`;
            // Two saved searches with the exact same query. getInitialCurrentSearchKey resolves to the first
            // one (id 100), but the current key is the second (id 200).
            mockOnyx({
                [ONYXKEYS.SAVED_SEARCHES]: {
                    [SAVED_SEARCH_ID]: {query: sharedQuery, name: 'First'},
                    [OTHER_SAVED_SEARCH_ID]: {query: sharedQuery, name: 'Second'},
                },
            });
            mockNavigationQuery(sharedQuery);
            const {result} = renderProvider();

            act(() => {
                result.current.setCurrentSearchKey(savedSearchIDToSearchKey(OTHER_SAVED_SEARCH_ID));
            });
            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(OTHER_SAVED_SEARCH_ID));

            // resetSearchKey doesn't special case a target query that resolves to the current search, so it
            // switches to whatever getInitialCurrentSearchKey picks (the first saved search, id 100).
            act(() => {
                result.current.resetSearchKey(false, buildSearchQueryJSON(sharedQuery));
            });
            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });
    });

    describe('pending search key', () => {
        it('does not apply a pending setCurrentSearchKey until the query hash changes', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            // Pending update: the key must not change while the query hash is the same.
            act(() => {
                result.current.setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.REPORTS, true);
            });
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            // Once the query changes, the pending key is applied alongside the new query.
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Amazon`);
            rerender(undefined);
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('applies a non-pending setCurrentSearchKey immediately', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            act(() => {
                result.current.setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.REPORTS);
            });
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('pending key wins over the recompute-on-hash-change logic', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            // Set a pending key, then change the query so a default filter is dropped.
            // Without the pending logic the key would reset to EXPENSES, but the pending key must win.
            act(() => {
                result.current.setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.REPORTS, true);
            });
            mockNavigationQuery(RECONCILIATION_QUERY_WITHOUT_WITHDRAWN);
            rerender(undefined);
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('does not apply a pending resetSearchKey until the query hash changes', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            // The pending reset targets a different query, so nothing changes until the hash catches up.
            const nextQueryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Amazon`);
            act(() => {
                result.current.resetSearchKey(true, nextQueryJSON);
            });
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Amazon`);
            rerender(undefined);
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('applies resetSearchKey immediately when the target query matches the current hash', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result} = renderProvider();

            act(() => {
                result.current.setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.REPORTS);
            });
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);

            // pending is true but the queryJSON hash equals the current hash, so it applies right away.
            act(() => {
                result.current.resetSearchKey(true, result.current.currentSearchQueryJSON);
            });
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });
    });
});
