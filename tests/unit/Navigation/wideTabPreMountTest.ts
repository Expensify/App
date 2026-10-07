import {buildCancelledWideTabPreMount, buildWideTabPreMount} from '@libs/Navigation/helpers/wideTabPreMount';
import type {LiveWideTabPreMount, TabStateWithPreloads} from '@libs/Navigation/helpers/wideTabPreMount';
import type {NavigationPartialRoute} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

const PRE_MOUNT_KEY = 'Report-wide-pre-mount-1';

type TestRoute = {key: string; name: string; params?: Record<string, unknown>; state?: NavigationState};

function makeStack(key: string, routes: TestRoute[], index = routes.length - 1): NavigationState {
    return {key, index, routes, routeNames: [SCREENS.INBOX, SCREENS.REPORT, SCREENS.SEARCH.ROOT], stale: false, type: 'stack'} as NavigationState;
}

function makeTabState(focusedTabName: string, tabRoutes: TestRoute[], preloadedRouteKeys: string[] = []): TabStateWithPreloads {
    return {
        key: 'tab-state',
        index: tabRoutes.findIndex((route) => route.name === focusedTabName),
        routes: tabRoutes,
        routeNames: tabRoutes.map((route) => route.name),
        stale: false,
        type: 'tab',
        preloadedRouteKeys,
    } as TabStateWithPreloads;
}

function reportTarget(reportID: string): NavigationPartialRoute {
    return {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.REPORT, params: {reportID}}]}} as NavigationPartialRoute;
}

function getNestedKeys(tabState: TabStateWithPreloads | undefined, tabName: string) {
    return tabState?.routes.find((route) => route.name === tabName)?.state?.routes.map((route) => route.key);
}

const HOME_ROUTE: TestRoute = {key: 'home-key', name: SCREENS.HOME};
const INBOX_ROUTE: TestRoute = {key: 'inbox-key', name: SCREENS.INBOX};

describe('buildWideTabPreMount', () => {
    it('puts a destination in the focused tab directly under the current screen, which stays on top', () => {
        // Given the Reports tab focused on report A
        const reportA: TestRoute = {key: 'a-key', name: SCREENS.REPORT, params: {reportID: 'A'}};
        const tabState = makeTabState(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, [
            HOME_ROUTE,
            {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', [INBOX_ROUTE, reportA])},
        ]);

        // When report B is pre-mounted
        const result = buildWideTabPreMount(tabState, reportTarget('B'), PRE_MOUNT_KEY);

        // Then B is mounted under A, A remains the visible screen, and nothing else is preloaded
        expect(getNestedKeys(result?.tabState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)).toEqual(['inbox-key', PRE_MOUNT_KEY, 'a-key']);
        expect(result?.tabState.routes.at(1)?.state?.index).toBe(2);
        expect(result?.addedPreloadedRouteKey).toBeUndefined();
        expect(result?.routeKey).toBe(PRE_MOUNT_KEY);
    });

    it('skips a destination that is the screen already shown in the focused tab', () => {
        // Given the Reports tab focused on report B
        const reportB: TestRoute = {key: 'b-key', name: SCREENS.REPORT, params: {reportID: 'B'}};
        const tabState = makeTabState(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, [
            HOME_ROUTE,
            {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', [INBOX_ROUTE, reportB])},
        ]);

        // When report B is pre-mounted
        // Then there is nothing to do, because the destination is already on screen
        expect(buildWideTabPreMount(tabState, reportTarget('B'), PRE_MOUNT_KEY)).toBeUndefined();
    });

    it('skips a destination inside the focused Search tab', () => {
        // Given the Spend tab focused on the Reports view
        const reportsView: TestRoute = {key: 'search-a', name: SCREENS.SEARCH.ROOT, params: {q: 'type:expense-report'}};
        const tabState = makeTabState(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, [
            HOME_ROUTE,
            {key: 'search-key', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, state: makeStack('search-stack', [reportsView])},
        ]);
        const expensesTarget = {
            name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
            state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT, params: {q: 'type:expense'}}]},
        } as NavigationPartialRoute;

        // When the Expenses view is pre-mounted
        // Then it is skipped, because Search renders only its last root screen and navigating inside it is cheaper
        expect(buildWideTabPreMount(tabState, expensesTarget, PRE_MOUNT_KEY)).toBeUndefined();
    });

    it('puts a destination in a covered tab on top of its stack and marks that tab preloaded', () => {
        // Given Home focused and a visited Reports tab showing the Inbox sidebar
        const tabState = makeTabState(SCREENS.HOME, [HOME_ROUTE, {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', [INBOX_ROUTE])}]);

        // When report B is pre-mounted
        const result = buildWideTabPreMount(tabState, reportTarget('B'), PRE_MOUNT_KEY);

        // Then B is on top of the covered stack, Home stays focused, and the tab renders instead of staying frozen
        expect(getNestedKeys(result?.tabState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)).toEqual(['inbox-key', PRE_MOUNT_KEY]);
        expect(result?.tabState.index).toBe(0);
        expect(result?.tabState.preloadedRouteKeys).toEqual(['reports-key']);
        expect(result?.addedPreloadedRouteKey).toBe('reports-key');
    });

    it('reuses the screen a covered tab already shows when it is the destination', () => {
        // Given Home focused and a covered Reports tab already showing report B
        const reportB: TestRoute = {key: 'b-key', name: SCREENS.REPORT, params: {reportID: 'B'}};
        const tabState = makeTabState(SCREENS.HOME, [HOME_ROUTE, {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', [INBOX_ROUTE, reportB])}]);

        // When report B is pre-mounted
        const result = buildWideTabPreMount(tabState, reportTarget('B'), PRE_MOUNT_KEY);

        // Then no screen is added, the mounted one is handed to the reveal, and the tab is only kept rendering
        expect(result?.routeKey).toBe('b-key');
        expect(result?.isExistingRoute).toBe(true);
        expect(getNestedKeys(result?.tabState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)).toEqual(['inbox-key', 'b-key']);
        expect(result?.tabState.preloadedRouteKeys).toEqual(['reports-key']);
    });

    it('builds the stack of a tab that never mounted, keeping the original route for cancel', () => {
        // Given Home focused and a Reports tab that was never visited, so it has no stack yet
        const reportsRoute: TestRoute = {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR};
        const tabState = makeTabState(SCREENS.HOME, [HOME_ROUTE, reportsRoute]);

        // When report B is pre-mounted
        const result = buildWideTabPreMount(tabState, reportTarget('B'), PRE_MOUNT_KEY);

        // Then the tab gets the stack the reveal would build, with the destination keyed for reuse
        const reportsState = result?.tabState.routes.at(1)?.state;
        expect(reportsState?.routes.map((route) => route.name)).toEqual([SCREENS.INBOX, SCREENS.REPORT]);
        expect(reportsState?.routes.at(-1)?.key).toBe(PRE_MOUNT_KEY);
        expect(result?.originalTabRoute).toBe(reportsRoute);
        expect(result?.addedPreloadedRouteKey).toBe('reports-key');
    });
});

describe('buildCancelledWideTabPreMount', () => {
    function makeLivePreMount(overrides: Partial<LiveWideTabPreMount> = {}): LiveWideTabPreMount {
        return {routeKey: PRE_MOUNT_KEY, tabStateKey: 'tab-state', tabName: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, ...overrides};
    }

    it('takes a screen out from under the current one and keeps the current one focused', () => {
        // Given report B pre-mounted under the focused report A
        const reportA: TestRoute = {key: 'a-key', name: SCREENS.REPORT, params: {reportID: 'A'}};
        const reportB: TestRoute = {key: PRE_MOUNT_KEY, name: SCREENS.REPORT, params: {reportID: 'B'}};
        const tabState = makeTabState(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, [
            HOME_ROUTE,
            {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', [INBOX_ROUTE, reportB, reportA])},
        ]);

        // When the pre-mount is cancelled
        const result = buildCancelledWideTabPreMount(tabState, makeLivePreMount());

        // Then report A is still the focused screen of an unchanged stack
        expect(getNestedKeys(result, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)).toEqual(['inbox-key', 'a-key']);
        expect(result?.routes.at(1)?.state?.index).toBe(1);
    });

    it('takes a screen off a covered tab and drops only the preload the pre-mount added', () => {
        // Given report B pre-mounted on top of the covered Reports tab, which the pre-mount marked preloaded
        const reportB: TestRoute = {key: PRE_MOUNT_KEY, name: SCREENS.REPORT, params: {reportID: 'B'}};
        const tabState = makeTabState(
            SCREENS.HOME,
            [HOME_ROUTE, {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', [INBOX_ROUTE, reportB])}],
            ['other-key', 'reports-key'],
        );

        // When the pre-mount is cancelled
        const result = buildCancelledWideTabPreMount(tabState, makeLivePreMount({addedPreloadedRouteKey: 'reports-key'}));

        // Then the tab is back to its sidebar and freezes again when covered, while other preloads stay
        expect(getNestedKeys(result, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)).toEqual(['inbox-key']);
        expect(result?.routes.at(1)?.state?.index).toBe(0);
        expect(result?.preloadedRouteKeys).toEqual(['other-key']);
    });

    it('leaves a reused screen in place and only drops the preload', () => {
        // Given a covered tab whose already shown report B was reused for the pre-mount
        const reportB: TestRoute = {key: 'b-key', name: SCREENS.REPORT, params: {reportID: 'B'}};
        const tabState = makeTabState(
            SCREENS.HOME,
            [HOME_ROUTE, {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', [INBOX_ROUTE, reportB])}],
            ['reports-key'],
        );

        // When the pre-mount is cancelled
        const result = buildCancelledWideTabPreMount(tabState, makeLivePreMount({routeKey: 'b-key', isExistingRoute: true, addedPreloadedRouteKey: 'reports-key'}));

        // Then the screen the user had open stays, because it was never added by the pre-mount
        expect(getNestedKeys(result, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)).toEqual(['inbox-key', 'b-key']);
        expect(result?.preloadedRouteKeys).toEqual([]);
    });

    it('puts back the original route of a tab the pre-mount had to create a stack for', () => {
        // Given a pre-mount that built the stack of a never visited Reports tab
        const originalTabRoute: TestRoute = {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR};
        const tabState = makeTabState(
            SCREENS.HOME,
            [HOME_ROUTE, {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', [INBOX_ROUTE, {key: PRE_MOUNT_KEY, name: SCREENS.REPORT}])}],
            ['reports-key'],
        );

        // When the pre-mount is cancelled
        const result = buildCancelledWideTabPreMount(
            tabState,
            makeLivePreMount({originalTabRoute: originalTabRoute as LiveWideTabPreMount['originalTabRoute'], addedPreloadedRouteKey: 'reports-key'}),
        );

        // Then the tab is exactly as it was before, without a stack
        expect(result?.routes.at(1)).toBe(originalTabRoute);
        expect(result?.preloadedRouteKeys).toEqual([]);
    });
});
