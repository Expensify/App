import {getTabStateWithFocusedTarget, getTabStateWithFreshTarget, markFocusedTabRouteForRemount} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

function makeTabState(routes: Array<{name: string; state?: Record<string, unknown>}>, index: number): NavigationState {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test helper builds minimal mock state
    return {
        stale: false as const,
        type: 'tab',
        key: 'tab-key',
        index,
        routeNames: routes.map((r) => r.name),
        routes: routes.map((r, i) => ({
            key: `${r.name}-key-${i}`,
            name: r.name,
            ...(r.state ? {state: r.state} : {}),
        })),
    } as unknown as NavigationState;
}

describe('getTabStateWithFocusedTarget', () => {
    describe('when target tab exists in current state', () => {
        it('focuses the target tab and returns updated state', () => {
            const existingState = makeTabState([{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}], 0);

            const result = getTabStateWithFocusedTarget(existingState, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR});

            expect(result).not.toBeUndefined();
            expect(result?.index).toBe(2);
            expect(result?.routes).toHaveLength(3);
        });

        it('preserves existing nested state for non-target tabs', () => {
            const reportsState = {routes: [{name: 'ReportScreen', params: {reportID: '123'}}], index: 0};
            const existingState = makeTabState([{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: reportsState}, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}], 1);

            const result = getTabStateWithFocusedTarget(existingState, {
                name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                state: {routes: [{name: SCREENS.SEARCH.ROOT}], index: 0},
            });

            expect(result).not.toBeUndefined();
            const reportsRoute = result?.routes.find((r) => r.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowing mock state for assertion
            expect((reportsRoute?.state as {routes: Array<{params?: {reportID: string}}>})?.routes?.at(0)?.params?.reportID).toBe('123');
        });
    });

    describe('when target tab is absent from sliced state', () => {
        it('reconstructs full tab state and focuses the target', () => {
            const slicedState = makeTabState([{name: SCREENS.HOME}], 0);

            const result = getTabStateWithFocusedTarget(slicedState, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR});

            expect(result).not.toBeUndefined();
            const searchIndex = TAB_SCREENS.indexOf(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
            expect(result?.index).toBe(searchIndex);
            expect(result?.routes).toHaveLength(TAB_SCREENS.length);
            expect(result?.routes.at(searchIndex)?.name).toBe(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        });

        it('normalizes routeNames to match TAB_SCREENS', () => {
            const slicedState = makeTabState([{name: SCREENS.HOME}], 0);

            const result = getTabStateWithFocusedTarget(slicedState, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR});

            expect(result).not.toBeUndefined();
            expect(result?.routeNames).toEqual([...TAB_SCREENS]);
        });

        it('preserves existing tab routes from the sliced state', () => {
            const homeState = {routes: [{name: 'HomeContent'}], index: 0};
            const slicedState = makeTabState([{name: SCREENS.HOME, state: homeState}], 0);

            const result = getTabStateWithFocusedTarget(slicedState, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR});

            expect(result).not.toBeUndefined();
            const homeRoute = result?.routes.find((r) => r.name === SCREENS.HOME);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowing mock state for assertion
            expect((homeRoute?.state as {routes: Array<{name: string}>})?.routes?.at(0)?.name).toBe('HomeContent');
        });

        it('prepends WorkspacesList when reconstructing a missing workspace tab', () => {
            const slicedState = makeTabState([{name: SCREENS.HOME}], 0);

            const result = getTabStateWithFocusedTarget(slicedState, {
                name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                state: {
                    routes: [{name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID: '1'}}], index: 0}}],
                    index: 0,
                },
            });

            expect(result).not.toBeUndefined();
            const workspaceRoute = result?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowing mock state for assertion
            const workspaceState = workspaceRoute?.state as {routes: Array<{name: string}>; index: number} | undefined;
            expect(workspaceState?.routes.map((route) => route.name)).toEqual([SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
            expect(workspaceState?.index).toBe(1);
        });

        it('preserves history and marks state as stale so TabRouter rehydrates properly', () => {
            const slicedState = {
                ...makeTabState([{name: SCREENS.HOME}], 0),
                history: [{type: 'route' as const, key: `${SCREENS.HOME}-key-0`}],
            };

            const result = getTabStateWithFocusedTarget(slicedState, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR});

            expect(result).not.toBeUndefined();
            expect(result?.history).toBe(slicedState.history);
            expect(result?.stale).toBe(true);
        });

        it('returns undefined for an unknown target tab name', () => {
            const slicedState = makeTabState([{name: SCREENS.HOME}], 0);

            const result = getTabStateWithFocusedTarget(slicedState, {name: 'NonExistentTab'});

            expect(result).toBeUndefined();
        });
    });
});

describe('getTabStateWithFreshTarget', () => {
    it('carries over the other tabs and the tab history from the existing state', () => {
        // Given a tab state where Settings sits on a sub-page and was visited before Spend
        const settingsState = {routes: [{name: SCREENS.SETTINGS.PREFERENCES.ROOT}], index: 0};
        const existingState = {
            ...makeTabState([{name: SCREENS.HOME}, {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: settingsState}, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}], 1),
            history: [{type: 'route', key: `${NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}-key-1`}],
        };

        // When the Spend tab is built fresh on top of it (the wide pre-mount case)
        const result = getTabStateWithFreshTarget(existingState, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR});

        // Then Settings keeps its key and sub-page, and the history still points at it, so the reveal does not reset the tab
        const settingsRoute = result?.routes.find((r) => r.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        expect(settingsRoute?.key).toBe(`${NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}-key-1`);
        expect(settingsRoute?.state).toBe(settingsState);
        expect(result?.history).toEqual(existingState.history);
    });

    it('builds the target tab without reusing its existing key', () => {
        // Given a tab state where the Spend tab is already mounted under a key
        const existingState = makeTabState([{name: SCREENS.HOME}, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}], 1);

        // When the Spend tab is built fresh
        const result = getTabStateWithFreshTarget(existingState, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR});

        // Then it has no key yet, so a second mounted copy never shares the visible tab's route key
        const searchRoute = result?.routes.find((r) => r.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        expect(searchRoute).toBeDefined();
        expect(searchRoute?.key).toBeUndefined();
        expect(result?.stale).toBe(true);
    });
});

describe('markFocusedTabRouteForRemount', () => {
    it('preserves existing tab history while forcing the focused route to remount', () => {
        const existingState = {
            ...makeTabState([{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}], 1),
            history: [
                {type: 'route' as const, key: `${SCREENS.HOME}-key-0`},
                {type: 'route' as const, key: `${NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}-key-1`},
            ],
        };
        const tabState = {
            ...existingState,
            index: 2,
        };

        const result = markFocusedTabRouteForRemount(tabState, existingState);

        expect(result.history).toBe(existingState.history);
        expect(result.routes.at(2)).not.toHaveProperty('key');
        expect(result.stale).toBe(true);
    });

    it('keeps reconstructed sliced tab state history for TabRouter to filter', () => {
        const slicedState = {
            ...makeTabState([{name: SCREENS.HOME}], 0),
            history: [
                {type: 'route' as const, key: `${SCREENS.HOME}-key-0`},
                {type: 'route' as const, key: 'stale-search-key'},
            ],
        };
        const reconstructedState = getTabStateWithFocusedTarget(slicedState, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR});

        expect(reconstructedState).not.toBeUndefined();
        if (!reconstructedState) {
            throw new Error('Expected reconstructed tab state');
        }
        const result = markFocusedTabRouteForRemount(reconstructedState, slicedState);

        expect(result.history).toBe(slicedState.history);
    });
});
