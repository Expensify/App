import getLastRoute from '@components/Navigation/NavigationTabBar/getLastRoute';

import {clearPreservedNavigatorStates, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

type Route = NavigationState['routes'][number];

function createRoute(name: string, key: string, state?: NavigationState): Route {
    return {key, name, ...(state ? {state} : {})} as Route;
}

function createState(key: string, type: string, routes: Route[], index = routes.length - 1): NavigationState {
    return {
        stale: false,
        type,
        key,
        index,
        routeNames: routes.map((route) => route.name),
        routes,
    };
}

const createRootState = (routes: Route[]) => createState('root', 'stack', routes);
const createTabState = (key: string, routes: Route[], index?: number) => createState(key, 'tab', routes, index);
const createNavigatorState = (key: string, routes: Route[]) => createState(key, 'stack', routes);

// getLastRoute only considers a nested navigator route that carries its own state, i.e. one that has already been rendered.
// The inner route uses the searched screen on purpose, to show that the preserved state - not the inner one - is what gets returned.
const createNavigatorRouteWithState = (navigator: string, key: string, screen: string) =>
    createRoute(navigator, key, createNavigatorState(`${key}-inner`, [createRoute(screen, `${key}-inner-route`)]));

describe('getLastRoute', () => {
    beforeEach(() => {
        clearPreservedNavigatorStates();
    });

    describe('navigator at the root level', () => {
        it('returns the preserved screen route of the root level navigator', () => {
            const rootState = createRootState([createRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, 'reports-1')]);
            setPreservedNavigatorState('reports-1', createNavigatorState('reports-1-state', [createRoute(SCREENS.HOME, 'home'), createRoute(SCREENS.REPORT, 'report-1')]));

            expect(getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT)).toEqual({key: 'report-1', name: SCREENS.REPORT});
        });

        it('uses the last navigator when the root state has several of them', () => {
            const rootState = createRootState([createRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, 'reports-1'), createRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, 'reports-2')]);
            setPreservedNavigatorState('reports-1', createNavigatorState('reports-1-state', [createRoute(SCREENS.REPORT, 'report-1')]));
            setPreservedNavigatorState('reports-2', createNavigatorState('reports-2-state', [createRoute(SCREENS.REPORT, 'report-2')]));

            expect(getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT)).toEqual({key: 'report-2', name: SCREENS.REPORT});
        });

        it('uses the last matching screen inside the preserved navigator state', () => {
            const rootState = createRootState([createRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, 'reports-1')]);
            setPreservedNavigatorState(
                'reports-1',
                createNavigatorState('reports-1-state', [createRoute(SCREENS.REPORT, 'report-1'), createRoute(SCREENS.HOME, 'home'), createRoute(SCREENS.REPORT, 'report-2')]),
            );

            expect(getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT)).toEqual({key: 'report-2', name: SCREENS.REPORT});
        });

        it('takes precedence over a navigator nested in the tab navigator', () => {
            const tabRoute = createRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1', createTabState('tab-1-state', [createRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, 'nested-reports')]));
            const rootState = createRootState([tabRoute, createRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, 'root-reports')]);
            setPreservedNavigatorState('nested-reports', createNavigatorState('nested-reports-state', [createRoute(SCREENS.REPORT, 'nested-report')]));
            setPreservedNavigatorState('root-reports', createNavigatorState('root-reports-state', [createRoute(SCREENS.REPORT, 'root-report')]));

            expect(getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT)).toEqual({key: 'root-report', name: SCREENS.REPORT});
        });
    });

    describe('navigator nested inside the tab navigator', () => {
        it('returns the preserved screen route of the nested navigator', () => {
            const tabRoute = createRoute(
                NAVIGATORS.TAB_NAVIGATOR,
                'tab-1',
                createTabState('tab-1-state', [createRoute(SCREENS.HOME, 'home'), createNavigatorRouteWithState(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, 'search-1', SCREENS.SEARCH.ROOT)]),
            );
            setPreservedNavigatorState('search-1', createNavigatorState('search-1-state', [createRoute(SCREENS.SEARCH.ROOT, 'search-root-1')]));

            expect(getLastRoute(createRootState([tabRoute]), NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toEqual({key: 'search-root-1', name: SCREENS.SEARCH.ROOT});
        });

        it('prefers the tab navigator whose nested navigator has its own state even when it is not the focused tab', () => {
            // The nested navigator is not focused (index points at Home), so it can only be found by looking at every tab route.
            const tabWithSearchState = createRoute(
                NAVIGATORS.TAB_NAVIGATOR,
                'tab-1',
                createTabState(
                    'tab-1-state',
                    [createRoute(SCREENS.HOME, 'home-1'), createNavigatorRouteWithState(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, 'search-1', SCREENS.SEARCH.ROOT)],
                    0,
                ),
            );
            const tabWithoutSearch = createRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-2', createTabState('tab-2-state', [createRoute(SCREENS.HOME, 'home-2')]));
            const rootState = createRootState([tabWithSearchState, tabWithoutSearch]);
            setPreservedNavigatorState('search-1', createNavigatorState('search-1-state', [createRoute(SCREENS.SEARCH.ROOT, 'search-root-1')]));

            expect(getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toEqual({key: 'search-root-1', name: SCREENS.SEARCH.ROOT});
        });

        it('returns undefined when no nested navigator has its own state, even if a preserved state exists', () => {
            const firstTab = createRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1', createTabState('tab-1-state', [createRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, 'search-1')]));
            const lastTab = createRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-2', createTabState('tab-2-state', [createRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, 'search-2')]));
            const rootState = createRootState([firstTab, lastTab]);
            setPreservedNavigatorState('search-1', createNavigatorState('search-1-state', [createRoute(SCREENS.SEARCH.ROOT, 'search-root-1')]));
            setPreservedNavigatorState('search-2', createNavigatorState('search-2-state', [createRoute(SCREENS.SEARCH.ROOT, 'search-root-2')]));

            expect(getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toBeUndefined();
        });

        it('uses the last matching navigator inside the tab state', () => {
            const tabRoute = createRoute(
                NAVIGATORS.TAB_NAVIGATOR,
                'tab-1',
                createTabState('tab-1-state', [
                    createNavigatorRouteWithState(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, 'search-1', SCREENS.SEARCH.ROOT),
                    createNavigatorRouteWithState(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, 'search-2', SCREENS.SEARCH.ROOT),
                ]),
            );
            setPreservedNavigatorState('search-1', createNavigatorState('search-1-state', [createRoute(SCREENS.SEARCH.ROOT, 'search-root-1')]));
            setPreservedNavigatorState('search-2', createNavigatorState('search-2-state', [createRoute(SCREENS.SEARCH.ROOT, 'search-root-2')]));

            expect(getLastRoute(createRootState([tabRoute]), NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toEqual({key: 'search-root-2', name: SCREENS.SEARCH.ROOT});
        });

        it('returns undefined when the tab navigator route has no state', () => {
            const rootState = createRootState([createRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1')]);
            setPreservedNavigatorState('search-1', createNavigatorState('search-1-state', [createRoute(SCREENS.SEARCH.ROOT, 'search-root-1')]));

            expect(getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toBeUndefined();
        });
    });

    describe('when there is nothing to restore', () => {
        it('returns undefined when the navigator is nowhere in the root state', () => {
            const rootState = createRootState([createRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1', createTabState('tab-1-state', [createRoute(SCREENS.HOME, 'home')]))]);

            expect(getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toBeUndefined();
        });

        it('returns undefined when the navigator has no preserved state', () => {
            const rootState = createRootState([createRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, 'search-1')]);

            expect(getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toBeUndefined();
        });

        it('returns undefined when the preserved state has no matching screen', () => {
            const rootState = createRootState([createRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, 'search-1')]);
            setPreservedNavigatorState('search-1', createNavigatorState('search-1-state', [createRoute(SCREENS.SEARCH.MONEY_REQUEST_REPORT, 'money-request-report')]));

            expect(getLastRoute(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toBeUndefined();
        });

        it('returns undefined when the root state has no routes', () => {
            expect(getLastRoute(createRootState([]), NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT)).toBeUndefined();
        });
    });
});
