import {act, renderHook} from '@testing-library/react-native';

import {SearchQueryActionsContext, SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import SearchQueryProvider from '@components/Search/SearchQueryProvider';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {savedSearchIDToSearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

import {useContext} from 'react';

const SAVED_SEARCH_ID = '100';

// The default query string of the "Reconciliation" suggested search.
const RECONCILIATION_QUERY =
    `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} ` +
    `${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY}:${CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN} ` +
    `${CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER}:${CONST.SEARCH.SORT_ORDER.DESC} ` +
    `${CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW}:${CONST.SEARCH.VIEW.TABLE} ` +
    `${CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY}:${CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID} ` +
    `${CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE}:${CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT} ` +
    `${CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN}:${CONST.SEARCH.DATE_PRESETS.LAST_MONTH}`;

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

function mockNavigationQuery(query: string | undefined, rawQuery?: string) {
    mockGetDeepestFocusedScreen.mockReturnValue({name: SCREENS.SEARCH.ROOT, params: {q: query, rawQuery}});
}

function mockOnyx(data: Record<string, unknown> = {}) {
    mockUseOnyx.mockImplementation((key: string) => [data[key]]);
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
            mockOnyx({[ONYXKEYS.SEARCH_FILTERS]: {[CONST.SEARCH.SEARCH_KEYS.SUBMIT]: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`}});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.SUBMIT);
        });

        it('matches a suggested search by its default query even when the last query exists', () => {
            mockOnyx({
                [ONYXKEYS.SEARCH_FILTERS]: {[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]: `${RECONCILIATION_QUERY} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM}:123`},
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
                [ONYXKEYS.SEARCH_FILTERS]: {[savedSearchKey]: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`},
            });
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(savedSearchKey);
        });

        it('matches a saved search by its default query even when the last query exists', () => {
            const savedSearchKey = savedSearchIDToSearchKey(SAVED_SEARCH_ID);
            mockOnyx({
                [ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}},
                [ONYXKEYS.SEARCH_FILTERS]: {[savedSearchKey]: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`},
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

    describe('resetting on hash change', () => {
        const savedSearches = {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}};

        it('keeps the search key when the new query still has the default filters and same type', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));

            // Adding a filter changes the hash but keeps merchant + type, so the key must be preserved.
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon category:Food`);
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });

        it('resets the search key when the new query drops a default filter', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));

            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} category:Food`);
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('resets the search key when the query type changes', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));

            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Amazon`);
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
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
            const savedSearches = {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}};
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));

            // Set a pending key, then change the query so a default filter is dropped.
            // Without the pending logic the key would reset to EXPENSES, but the pending key must win.
            act(() => {
                result.current.setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.REPORTS, true);
            });
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} category:Food`);
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
