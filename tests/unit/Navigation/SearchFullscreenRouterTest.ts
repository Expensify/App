import SearchFullscreenRouter from '@libs/Navigation/AppNavigator/createSearchFullscreenNavigator/SearchFullscreenRouter';
import {clearPreservedNavigatorStates, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {buildSearchQueryString} from '@libs/SearchQueryUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, RouterConfigOptions} from '@react-navigation/native';

const mockIsReady = jest.fn(() => true);
const mockGetRootState = jest.fn<unknown, []>();

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => mockIsReady(),
        getRootState: () => mockGetRootState(),
    },
}));

const CHAT_QUERY = 'sortBy:date sortOrder:desc type:chat';
const EXPENSE_QUERY = 'sortBy:date sortOrder:desc type:expense';

const CONFIG_OPTIONS: RouterConfigOptions = {
    routeNames: [SCREENS.SEARCH.ROOT],
    routeParamList: {[SCREENS.SEARCH.ROOT]: {q: buildSearchQueryString()}},
    routeGetIdList: {},
};

const router = SearchFullscreenRouter({parentRoute: {key: 'search-nav-2', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}});

function searchTabNavigator(key: string, q: string) {
    return {
        key,
        name: NAVIGATORS.TAB_NAVIGATOR,
        state: {
            index: 0,
            routes: [
                {
                    key: `search-nav-of-${key}`,
                    name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                    state: {index: 0, routes: [{key: `search-root-of-${key}`, name: SCREENS.SEARCH.ROOT, params: {q}}]},
                },
            ],
        },
    };
}

function reportsTabNavigator(key: string) {
    return {key, name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{key: `reports-nav-of-${key}`, name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}]}};
}

describe('SearchFullscreenRouter', () => {
    beforeEach(() => {
        mockIsReady.mockReturnValue(true);
        mockGetRootState.mockReset();
    });

    afterEach(() => {
        clearPreservedNavigatorStates();
    });

    describe('getInitialState', () => {
        it('seeds the Search root from the older tab navigator when the newest one has no Search state', () => {
            // Given the user filtered Spend in the first tab navigator, and "Go to room" pushed a second one whose Spend tab
            // native now mounts in the background
            mockGetRootState.mockReturnValue({index: 1, routes: [searchTabNavigator('tab-1', CHAT_QUERY), reportsTabNavigator('tab-2')]});

            // When the background Search navigator builds its initial state
            const state = router.getInitialState(CONFIG_OPTIONS);

            // Then its Search root starts from the user's query instead of the default, so the default is never saved as the last search
            expect(state.routes.at(0)?.params).toEqual({q: CHAT_QUERY});
        });

        it('keeps the default query when no tab navigator has Search state', () => {
            // Given Spend was never opened in any tab navigator
            mockGetRootState.mockReturnValue({index: 1, routes: [reportsTabNavigator('tab-1'), reportsTabNavigator('tab-2')]});

            // When the Search navigator builds its initial state
            const state = router.getInitialState(CONFIG_OPTIONS);

            // Then there is no query to carry over, so the Search root keeps the default query
            expect(state.routes.at(0)?.params).toEqual({q: buildSearchQueryString()});
        });

        it('keeps the default query when the last Search root has no params', () => {
            // Given the newest tab navigator has a mounted Search navigator whose root has no params, above an older filtered one
            mockGetRootState.mockReturnValue({
                index: 1,
                routes: [
                    searchTabNavigator('tab-1', CHAT_QUERY),
                    {
                        key: 'tab-2',
                        name: NAVIGATORS.TAB_NAVIGATOR,
                        state: {
                            index: 0,
                            routes: [
                                {
                                    key: 'search-nav-of-tab-2',
                                    name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                    state: {index: 0, routes: [{key: 'search-root-of-tab-2', name: SCREENS.SEARCH.ROOT}]},
                                },
                            ],
                        },
                    },
                ],
            });

            // When the Search navigator builds its initial state
            const state = router.getInitialState(CONFIG_OPTIONS);

            // Then it does not walk past the newer Search navigator to the older query, and keeps the default
            expect(state.routes.at(0)?.params).toEqual({q: buildSearchQueryString()});
        });

        it('keeps the default query without reading the root state when the navigation ref is not ready', () => {
            // Given the navigation container has not finished mounting, so the root state can't be read yet
            mockIsReady.mockReturnValue(false);

            // When the Search navigator builds its initial state
            const state = router.getInitialState(CONFIG_OPTIONS);

            // Then it keeps the default query and never asks for the root state
            expect(state.routes.at(0)?.params).toEqual({q: buildSearchQueryString()});
            expect(mockGetRootState).not.toHaveBeenCalled();
        });

        it('returns its own preserved state before looking at other Search navigators', () => {
            // Given this Search navigator was mounted before and its state was preserved, while another tab navigator holds a different query
            const preservedState: NavigationState = {
                key: 'search-nav-preserved-stack',
                index: 0,
                routeNames: [SCREENS.SEARCH.ROOT],
                routes: [{key: 'search-root-preserved', name: SCREENS.SEARCH.ROOT, params: {q: EXPENSE_QUERY}}],
                type: 'stack',
                stale: false,
            };
            setPreservedNavigatorState('search-nav-preserved', preservedState);
            mockGetRootState.mockReturnValue({index: 0, routes: [searchTabNavigator('tab-1', CHAT_QUERY)]});
            const preservedRouter = SearchFullscreenRouter({parentRoute: {key: 'search-nav-preserved', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}});

            // When the Search navigator builds its initial state
            const state = preservedRouter.getInitialState(CONFIG_OPTIONS);

            // Then its own preserved state wins, because it is what the user last saw in this navigator
            expect(state).toBe(preservedState);
        });
    });

    describe('getRehydratedState', () => {
        it('keeps an explicit query over the older tab navigator query', () => {
            // Given an older tab navigator holds a filtered query, and a navigation explicitly opens Search with another query
            mockGetRootState.mockReturnValue({index: 1, routes: [searchTabNavigator('tab-1', CHAT_QUERY), reportsTabNavigator('tab-2')]});

            // When the router rehydrates the partial state from that navigation
            const state = router.getRehydratedState({stale: true, routes: [{name: SCREENS.SEARCH.ROOT, params: {q: EXPENSE_QUERY}}]}, CONFIG_OPTIONS);

            // Then the explicit query is kept, because only a plain mount is seeded from the last Search navigator
            expect(state.routes.at(0)?.params).toEqual({q: EXPENSE_QUERY});
        });
    });
});
