import {clearPreservedNavigatorStates, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {buildSearchQueryString, getSearchRootParamsFromRootState} from '@libs/SearchQueryUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

const CHAT_QUERY = 'sortBy:date sortOrder:desc type:chat';

function searchRootRoute(q: string, rawQuery?: string) {
    return {key: 'search-root-1', name: SCREENS.SEARCH.ROOT, params: rawQuery ? {q, rawQuery} : {q}};
}

function rhpRoute() {
    return {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, state: {index: 0, routes: [{key: 'report-1', name: SCREENS.SEARCH.MONEY_REQUEST_REPORT, params: {reportID: '1'}}]}};
}

// getSearchRootParamsFromRootState walks navigation states structurally with runtime type guards,
// so these fixtures only need the fields it actually reads.
describe('getSearchRootParamsFromRootState', () => {
    afterEach(() => {
        clearPreservedNavigatorStates();
    });

    it('returns the Search root query when an RHP is stacked above the Search tab', () => {
        // This is the https://github.com/Expensify/App/issues/100605 case: the focused route is the RHP report,
        // which carries no `q`, but the Search root route underneath it still does.
        const rootState = {
            index: 1,
            routes: [
                {
                    key: 'tab-1',
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [{key: 'search-nav-1', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, state: {index: 0, routes: [searchRootRoute(CHAT_QUERY)]}}],
                    },
                },
                rhpRoute(),
            ],
        };

        expect(getSearchRootParamsFromRootState(rootState)?.q).toBe(CHAT_QUERY);
    });

    it('returns the Search root query from nested route params on a cold boot', () => {
        // After a refresh the state is rebuilt from the path, so the Search tab exists as
        // `params: {screen, params}` rather than as a mounted `state`.
        const rootState = {
            index: 1,
            routes: [
                {
                    key: 'tab-1',
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    params: {screen: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, params: {screen: SCREENS.SEARCH.ROOT, params: {q: CHAT_QUERY}}},
                },
                rhpRoute(),
            ],
        };

        expect(getSearchRootParamsFromRootState(rootState)?.q).toBe(CHAT_QUERY);
    });

    it('returns rawQuery alongside q when the Search root has one', () => {
        const rootState = {
            index: 0,
            routes: [
                {
                    key: 'tab-1',
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [{key: 'search-nav-1', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, state: {index: 0, routes: [searchRootRoute(CHAT_QUERY, 'type:chat')]}}],
                    },
                },
            ],
        };

        expect(getSearchRootParamsFromRootState(rootState)?.rawQuery).toBe('type:chat');
    });

    it('falls back to the preserved navigator state when the Search tab is not focused', () => {
        // A non-focused tab navigator has its nested state dropped from the live tree, so the query
        // has to come from the preserved-state map instead.
        const preservedSearchNavigatorState: NavigationState = {
            key: 'search-nav-1',
            index: 0,
            routeNames: [SCREENS.SEARCH.ROOT],
            routes: [searchRootRoute(CHAT_QUERY)],
            type: 'stack',
            stale: false,
        };
        setPreservedNavigatorState('search-nav-1', preservedSearchNavigatorState);

        const rootState = {
            index: 0,
            routes: [
                {
                    key: 'tab-1',
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [
                            {key: 'search-nav-1', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {key: 'reports-nav-1', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                        ],
                    },
                },
            ],
        };

        expect(getSearchRootParamsFromRootState(rootState)?.q).toBe(CHAT_QUERY);
    });

    it('falls back to the canned query when the Search tab has never been visited', () => {
        const rootState = {
            index: 0,
            routes: [
                {
                    key: 'tab-1',
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {index: 0, routes: [{key: 'reports-nav-1', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}]},
                },
            ],
        };

        expect(getSearchRootParamsFromRootState(rootState)?.q).toBe(buildSearchQueryString());
    });

    it('falls back to the canned query when there is no tab navigator at all', () => {
        expect(getSearchRootParamsFromRootState(undefined)?.q).toBe(buildSearchQueryString());
    });

    it('returns undefined when a mounted Search navigator has no usable Search root params', () => {
        // The provider keeps its own `?? buildSearchQueryString()` fallback for this case; the resolver
        // must not invent a query, so that `getCurrentSearchQueryJSON` callers still see `undefined`.
        const rootState = {
            index: 0,
            routes: [
                {
                    key: 'tab-1',
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [{key: 'search-nav-1', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, state: {index: 0, routes: [{key: 'search-root-1', name: SCREENS.SEARCH.ROOT}]}}],
                    },
                },
            ],
        };

        expect(getSearchRootParamsFromRootState(rootState)).toBeUndefined();
    });
});
