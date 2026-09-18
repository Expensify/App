import {renderHook} from '@testing-library/react-native';

import useSearchKeyParam from '@components/Search/hooks/useSearchKeyParam';

import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

const SAVED_SEARCH_ID = '100';
const OTHER_SAVED_SEARCH_ID = '200';

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

type FocusedScreen = {name: string; params: {searchKey?: string}};

let mockFocusedScreen: FocusedScreen | undefined;
const mockUseOnyx = jest.fn<[unknown], [key: string]>();

// Mirrors `CommonActions.setParams`, which merges into the focused route's params, so that a param the hook
// writes is read back by the next render the way it would be in the app.
const mockSetParams = jest.fn<void, [params: {searchKey?: string}]>((params) => {
    if (!mockFocusedScreen) {
        return;
    }
    mockFocusedScreen = {...mockFocusedScreen, params: {...mockFocusedScreen.params, ...params}};
});

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {setParams: (params: {searchKey?: string}) => mockSetParams(params)},
    getDeepestFocusedScreen: () => mockFocusedScreen,
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

function mockSearchScreenFocused({searchKey}: {searchKey?: string} = {}) {
    mockFocusedScreen = {name: SCREENS.SEARCH.ROOT, params: {searchKey}};
}

function mockNavigationBlurred() {
    mockFocusedScreen = {name: SCREENS.SEARCH.ADVANCED_FILTERS_RHP, params: {}};
}

function getRouteSearchKey() {
    return mockFocusedScreen?.params.searchKey;
}

function mockOnyx(data: Record<string, unknown> = {}) {
    mockUseOnyx.mockImplementation((key: string) => [data[key]]);
}

function mockSearchFilter(query: string) {
    return {query, timestamp: '2026-08-21 00:00:00.000'};
}

/**
 * Renders the hook for `query` on a focused search screen carrying `searchKey`. `rerender` takes the next query,
 * the way a `setParams({q})` reaches the hook through its caller, and leaves the route param as it is.
 */
function renderSearchKeyParam(query: string, {searchKey}: {searchKey?: string} = {}) {
    mockSearchScreenFocused({searchKey});
    return renderHook((currentQuery: string) => useSearchKeyParam(buildSearchQueryJSON(currentQuery), getSuggestedSearches()), {initialProps: query});
}

describe('useSearchKeyParam', () => {
    beforeEach(() => {
        mockFocusedScreen = undefined;
        mockUseOnyx.mockReset();
        // `mockClear`, not `mockReset`: the latter would strip the merge implementation.
        mockSetParams.mockClear();
        mockOnyx();
    });

    describe('initial currentSearchKey', () => {
        it('matches a suggested search by its default query', () => {
            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('matches a suggested search by its last (SEARCH_FILTERS) query', () => {
            mockOnyx({[ONYXKEYS.SEARCH_FILTERS]: {[CONST.SEARCH.SEARCH_KEYS.SUBMIT]: mockSearchFilter(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`)}});

            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.SUBMIT);
        });

        it('ignores a last query that is stored in the legacy string format', () => {
            mockOnyx({[ONYXKEYS.SEARCH_FILTERS]: {[CONST.SEARCH.SEARCH_KEYS.SUBMIT]: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`}});

            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Zulu`);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('matches a suggested search by its default query even when the last query exists', () => {
            mockOnyx({
                [ONYXKEYS.SEARCH_FILTERS]: {[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]: mockSearchFilter(`${RECONCILIATION_QUERY} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM}:123`)},
            });

            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('matches a saved search by its default query', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}}});

            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });

        it('matches a saved search by its last (SEARCH_FILTERS) query', () => {
            const savedSearchKey = savedSearchIDToSearchKey(SAVED_SEARCH_ID);
            mockOnyx({
                [ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}},
                [ONYXKEYS.SEARCH_FILTERS]: {[savedSearchKey]: mockSearchFilter(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`)},
            });

            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`);

            expect(result.current.currentSearchKey).toBe(savedSearchKey);
        });

        it('matches a saved search by its default query even when the last query exists', () => {
            const savedSearchKey = savedSearchIDToSearchKey(SAVED_SEARCH_ID);
            mockOnyx({
                [ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}},
                [ONYXKEYS.SEARCH_FILTERS]: {[savedSearchKey]: mockSearchFilter(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Starbucks`)},
            });

            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            expect(result.current.currentSearchKey).toBe(savedSearchKey);
        });

        it('falls back to the generic expenses key when the type is expense and nothing matches', () => {
            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('falls back to the generic reports key when the type is expense report and nothing matches', () => {
            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Amazon`);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('is undefined when the type has no generic key and nothing matches', () => {
            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`);

            expect(result.current.currentSearchKey).toBeUndefined();
        });
    });

    describe('currentDefaultSearchQueryJSON', () => {
        it('exposes the default query of the current suggested search', () => {
            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
            expect(result.current.currentDefaultSearchQueryJSON?.hash).toBe(buildSearchQueryJSON(RECONCILIATION_QUERY)?.hash);
        });

        it('is undefined for a saved search because saved searches have no default filters', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}}});

            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
            expect(result.current.currentDefaultSearchQueryJSON).toBeUndefined();
        });
    });

    describe('searchKey route param', () => {
        const savedSearches = {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}};

        it('wins over the key derived from the query', () => {
            // The query is the "Reconciliation" default query, so it would otherwise resolve to that key.
            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES});

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('survives a query change that keeps the default filters and type', () => {
            const {result, rerender} = renderSearchKeyParam(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            // Tweaking a filter changes `q` but not `searchKey`, and the query still has all the default
            // filters + type, so the key is preserved even though the query no longer matches the search.
            rerender(`${RECONCILIATION_QUERY} merchant:Amazon`);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('is ignored when the query drops one of the default filters', () => {
            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY_WITHOUT_WITHDRAWN, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('is ignored when the query type differs from the default query type', () => {
            const query = RECONCILIATION_QUERY.replace(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`, `type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}`);

            const {result} = renderSearchKeyParam(query, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('is ignored when it holds something that is not a search key', () => {
            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY, {searchKey: 'notASearchKey'});

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('keeps a saved search key whatever the query is, since saved searches have no default filters', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});

            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} category:Food`, {searchKey: savedSearchIDToSearchKey(SAVED_SEARCH_ID)});

            expect(result.current.currentSearchKey).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });

        it('falls back to the key derived from the query when the param is absent', () => {
            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('exposes the default query of the search key it resolved to', () => {
            const {result} = renderSearchKeyParam(`${RECONCILIATION_QUERY} merchant:Amazon`, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            expect(result.current.currentDefaultSearchQueryJSON?.hash).toBe(buildSearchQueryJSON(RECONCILIATION_QUERY)?.hash);
        });

        it('keeps the last value while another screen is focused on top of search', () => {
            const query = `${RECONCILIATION_QUERY} merchant:Amazon`;
            const {result, rerender} = renderSearchKeyParam(query, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            // An RHP opening over search must not make the key fall back to the derived one, the same way it
            // doesn't drop the query.
            mockNavigationBlurred();
            rerender(query);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('derives the generic key after a filter tweak when the route carries no param', () => {
            // With nothing on the route, the tweaked query no longer matches the search it came from, so the key
            // falls back to the generic one - this is why navigation sites pass `searchKey` explicitly.
            const {result} = renderSearchKeyParam(`${RECONCILIATION_QUERY} merchant:Amazon`);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('distinguishes a search screen without the param from a screen that is not search', () => {
            const {result, rerender} = renderSearchKeyParam(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);

            // Navigating to a search that carries no key must drop the previous one rather than keep it.
            mockSearchScreenFocused();
            rerender(RECONCILIATION_QUERY_WITHOUT_WITHDRAWN);

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });
    });

    describe('searchKey route param sync', () => {
        const savedSearches = {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}};

        it('writes the resolved key back when the route carries no param', () => {
            renderSearchKeyParam(RECONCILIATION_QUERY);

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
        });

        it('writes a saved search key back when the route carries no param', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});

            renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: savedSearchIDToSearchKey(SAVED_SEARCH_ID)});
        });

        it('replaces a param that holds something that is not a search key', () => {
            renderSearchKeyParam(RECONCILIATION_QUERY, {searchKey: 'notASearchKey'});

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});
        });

        it('replaces a key the query has outgrown', () => {
            // Dropping `withdrawn`, one of the "Reconciliation" default filters, makes it a plain expense search.
            renderSearchKeyParam(RECONCILIATION_QUERY_WITHOUT_WITHDRAWN, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES});
        });

        it('clears the param when the query resolves to no key at all', () => {
            renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            expect(mockSetParams).toHaveBeenCalledWith({searchKey: undefined});
        });

        it('leaves a valid param alone', () => {
            renderSearchKeyParam(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('leaves a param alone when the query only adds a filter on top of the default ones', () => {
            renderSearchKeyParam(`${RECONCILIATION_QUERY} merchant:Amazon`, {searchKey: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION});

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('leaves a valid saved search param alone, whatever the query is', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: savedSearches});

            renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} category:Food`, {searchKey: savedSearchIDToSearchKey(SAVED_SEARCH_ID)});

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('writes the key once and stops, rather than re-dispatching on every render', () => {
            const {result, rerender} = renderSearchKeyParam(RECONCILIATION_QUERY);
            expect(mockSetParams).toHaveBeenCalledTimes(1);

            // The key it wrote lands on the route, and validates against the query, so nothing is written again.
            rerender(RECONCILIATION_QUERY);

            expect(getRouteSearchKey()).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
            expect(mockSetParams).toHaveBeenCalledTimes(1);
        });

        it('does not write the key onto a screen that is not search', () => {
            mockNavigationBlurred();

            renderHook(() => useSearchKeyParam(buildSearchQueryJSON(RECONCILIATION_QUERY), getSuggestedSearches()));

            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('stops writing once another screen is focused on top of search', () => {
            // Mount without a param, so the effect does write once and the blur has something to stop.
            const {rerender} = renderSearchKeyParam(RECONCILIATION_QUERY);
            expect(mockSetParams).toHaveBeenCalledTimes(1);

            mockNavigationBlurred();
            rerender(RECONCILIATION_QUERY);

            expect(mockSetParams).toHaveBeenCalledTimes(1);
        });

        it('never takes back a generic key once it is on the route, because it validates against any expense query', () => {
            // The `expenses` default query carries no filters at all, so `doesQueryMatchDefaultFilterKeysAndType`
            // accepts it for every expense query - including one that is an exact "Reconciliation" match. The write
            // is therefore one-way: whatever key the effect commits can never be revised to a more specific one.
            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY, {searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES});

            expect(result.current.currentSearchKey).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(mockSetParams).not.toHaveBeenCalled();
        });

        it('does not re-dispatch for a query that keeps resolving to no key', () => {
            const query = `type:${CONST.SEARCH.DATA_TYPES.INVOICE}`;
            const {rerender} = renderSearchKeyParam(query);
            expect(mockSetParams).toHaveBeenCalledTimes(1);
            expect(mockSetParams).toHaveBeenCalledWith({searchKey: undefined});

            // Clearing the param leaves it absent, so the effect must not read that as a new key to write.
            rerender(query);

            expect(mockSetParams).toHaveBeenCalledTimes(1);
        });

        it('re-writes the key when the query changes while the route still carries no key', () => {
            // A query that resolves to no key leaves the route keyless, which is the one state the effect settles
            // in without the param ever becoming valid. A later query change still has to be written back.
            const {rerender} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`);
            expect(mockSetParams).toHaveBeenLastCalledWith({searchKey: undefined});

            rerender(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            expect(mockSetParams).toHaveBeenLastCalledWith({searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES});
            expect(getRouteSearchKey()).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });
    });

    describe('getSearchKeyForQuery', () => {
        it('resolves the key of a query other than the current one', () => {
            const {result} = renderSearchKeyParam(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`);

            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(RECONCILIATION_QUERY))).toBe(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} merchant:Amazon`))).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it('resolves a saved search by its query', () => {
            mockOnyx({[ONYXKEYS.SAVED_SEARCHES]: {[SAVED_SEARCH_ID]: {query: `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`, name: 'My search'}}});

            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY);

            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`))).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });

        it('is undefined when the query type has no generic key and nothing matches', () => {
            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY);

            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`))).toBeUndefined();
        });

        it('resolves a query that two saved searches share to the first of them', () => {
            // Nothing stops two saved searches from holding the same query, and a query carries no ID, so it can't
            // say which one the user came from. The first matching ID wins - the key is a property of the query.
            const query = `type:${CONST.SEARCH.DATA_TYPES.EXPENSE} merchant:Amazon`;
            mockOnyx({
                [ONYXKEYS.SAVED_SEARCHES]: {
                    [SAVED_SEARCH_ID]: {query, name: 'My search'},
                    [OTHER_SAVED_SEARCH_ID]: {query, name: 'The same search, saved twice'},
                },
            });

            const {result} = renderSearchKeyParam(RECONCILIATION_QUERY);

            expect(result.current.getSearchKeyForQuery(buildSearchQueryJSON(query))).toBe(savedSearchIDToSearchKey(SAVED_SEARCH_ID));
        });
    });
});
