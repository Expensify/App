import {renderHook} from '@testing-library/react-native';

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

const mockGetDeepestFocusedScreen = jest.fn<{name: string; params: {q?: string; rawQuery?: string; searchKey?: string}}, []>();
const mockUseOnyx = jest.fn<[unknown], [key: string]>();
const mockSetParams = jest.fn<void, [params: Record<string, unknown>]>();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {setParams: (params: Record<string, unknown>) => mockSetParams(params)},
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

function mockNavigationQuery(query: string | undefined, {rawQuery, searchKey}: {rawQuery?: string; searchKey?: string} = {}) {
    mockGetDeepestFocusedScreen.mockReturnValue({name: SCREENS.SEARCH.ROOT, params: {q: query, rawQuery, searchKey}});
}

/** Focuses a screen on top of the search screen, the way an RHP does. */
function mockNavigationBlurred() {
    mockGetDeepestFocusedScreen.mockReturnValue({name: SCREENS.SEARCH.ADVANCED_FILTERS_RHP, params: {}});
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
        mockSetParams.mockReset();
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

    describe('searchKey route param', () => {
        const savedSearches = {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}};

        it('wins over the key derived from the query', () => {
            // The query is the "Reconciliation" default query, so it would otherwise resolve to that key.
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES});

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('survives a query change that keeps the default filters and type', () => {
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            // Tweaking a filter changes `q` but not `searchKey`, and the query still has all the default
            // filters + type, so the key is preserved even though the query no longer matches the search.
            mockNavigationQuery(`${RECONCILIATION_QUERY} merchant:Amazon`, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('is ignored when the query drops one of the default filters', () => {
            mockNavigationQuery(RECONCILIATION_QUERY_WITHOUT_WITHDRAWN, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('is ignored when the query type differs from the default query type', () => {
            const query = RECONCILIATION_QUERY.replace(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`, `type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}`);
            mockNavigationQuery(query, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('is ignored when it holds something that is not a search key', () => {
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: 'notASearchKey'});

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('keeps a saved search key whatever the query is, since saved searches have no default filters', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} category:Food`, {searchKey: savedSearchIDToSearchKey(SAVED_SEARCH_ID)});

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });

        it('falls back to the key derived from the query when the param is absent', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('exposes the default query of the search key it resolved to', () => {
            mockNavigationQuery(`${RECONCILIATION_QUERY} merchant:Amazon`, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            const {result} = renderProvider();

            expect(result.current.currentDefaultSearchQueryJSON?.hash).toBe(buildSearchQueryJSON(RECONCILIATION_QUERY)?.hash);
        });

        it('keeps the last value while another screen is focused on top of search', () => {
            mockNavigationQuery(`${RECONCILIATION_QUERY} merchant:Amazon`, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            // An RHP opening over search must not make the key fall back to the derived one, the same way it
            // doesn't drop the query.
            mockNavigationBlurred();
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('derives the generic key after a filter tweak when the route carries no param', () => {
            // With nothing on the route, the tweaked query no longer matches the search it came from, so the key
            // falls back to the generic one - this is why navigation sites pass `searchKey` explicitly.
            mockNavigationQuery(`${RECONCILIATION_QUERY} merchant:Amazon`);

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('distinguishes a search screen without the param from a screen that is not search', () => {
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            const {result, rerender} = renderProvider();
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            // Navigating to a search that carries no key must drop the previous one rather than keep it.
            mockNavigationQuery(RECONCILIATION_QUERY_WITHOUT_WITHDRAWN);
            rerender(undefined);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });
    });

    describe('searchKey route param sync', () => {
        const savedSearches = {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}};

        it('writes the resolved key back when the route carries no param', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);

            renderProvider();

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
        });

        it('writes a saved search key back when the route carries no param', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            renderProvider();

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: savedSearchIDToSearchKey(SAVED_SEARCH_ID)});
        });

        it('replaces a param that holds something that is not a search key', () => {
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: 'notASearchKey'});

            renderProvider();

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
        });

        it('replaces a key the query has outgrown', () => {
            // Dropping `withdrawn`, one of the "Reconciliation" default filters, makes it a plain expense search.
            mockNavigationQuery(RECONCILIATION_QUERY_WITHOUT_WITHDRAWN, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            renderProvider();

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES});
        });

        it('clears the param when the query resolves to no key at all', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            renderProvider();

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: undefined});
        });

        it('leaves a valid param alone', () => {
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            renderProvider();

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('leaves a param alone when the query only adds a filter on top of the default ones', () => {
            mockNavigationQuery(`${RECONCILIATION_QUERY} merchant:Amazon`, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            renderProvider();

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('leaves a valid saved search param alone, whatever the query is', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} category:Food`, {searchKey: savedSearchIDToSearchKey(SAVED_SEARCH_ID)});

            renderProvider();

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('writes the key once and stops, rather than re-dispatching on every render', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);
            const {rerender} = renderProvider();
            expect(mockSetParams).toHaveBeenCalledTimes(1);

            // The write makes the param valid, so a re-render must not queue the same params again.
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            rerender(undefined);

            expect(mockSetParams).toHaveBeenCalledTimes(1);
        });

        it('does not write the key onto a screen that is not search', () => {
            // `setParams` targets whatever is focused, so writing while a report screen or an RHP is on top would
            // put a `searchKey` on that route instead. This is what broke PaginationTest and GroupChatNameTests.
            mockNavigationBlurred();

            renderProvider();

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('stops writing once another screen is focused on top of search', () => {
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            const {rerender} = renderProvider();

            mockNavigationBlurred();
            rerender(undefined);

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('never takes back a generic key once it is on the route, because it validates against any expense query', () => {
            // The `expenses` default query carries no filters at all, so `doesQueryMatchDefaultFilterKeysAndType`
            // accepts it for every expense query - including one that is an exact "Reconciliation" match. The write
            // is therefore one-way: whatever key the effect commits can never be revised to a more specific one.
            mockNavigationQuery(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES});

            const {result} = renderProvider();

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('does not re-dispatch for a query that keeps resolving to no key', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`);
            const {rerender} = renderProvider();
            const callsAfterMount = mockSetParams.mock.calls.length;

            rerender(undefined);

            expect(mockSetParams).toHaveBeenCalledTimes(callsAfterMount);
        });
    });

    describe('getSearchKeyForQuery', () => {
        it('resolves the key of a query other than the current one', () => {
            mockNavigationQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);
            const {result} = renderProvider();

            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(RECONCILIATION_QUERY))).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Amazon`))).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('resolves a saved search by its query', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}}});
            mockNavigationQuery(RECONCILIATION_QUERY);
            const {result} = renderProvider();

            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`))).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });

        it('is undefined when the query type has no generic key and nothing matches', () => {
            mockNavigationQuery(RECONCILIATION_QUERY);
            const {result} = renderProvider();

            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`))).toBeUndefined();
        });
    });
});
