import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import SplitRouter from '@libs/Navigation/AppNavigator/createSplitNavigator/SplitRouter';
import getMatchingFullScreenRoute from '@libs/Navigation/helpers/getMatchingFullScreenRoute';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {ParamListBase, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';

import {CommonActions} from '@react-navigation/native';

jest.mock('@libs/getIsNarrowLayout', () => jest.fn(() => true));

const mockGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);

const CONFIG_OPTIONS: RouterConfigOptions = {
    routeNames: [SCREENS.INBOX, SCREENS.REPORT],
    routeParamList: {},
    routeGetIdList: {},
};

const router = SplitRouter({
    sidebarScreen: SCREENS.INBOX,
    defaultCentralScreen: SCREENS.REPORT,
    parentRoute: {key: 'reports-split-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
});

function makeState(routeNames: string[]): StackNavigationState<ParamListBase> {
    return {
        key: 'split-test',
        index: routeNames.length - 1,
        routeNames: [SCREENS.INBOX, SCREENS.REPORT],
        routes: routeNames.map((name, index) => ({key: `${name}-${index}`, name})),
        type: 'stack',
        stale: false,
        preloadedRoutes: [],
    };
}

describe('SplitRouter', () => {
    describe.each([
        {
            navigator: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
            sidebar: SCREENS.WORKSPACE.INITIAL,
            central: SCREENS.WORKSPACE.PROFILE,
            rhp: SCREENS.WORKSPACE.NAME,
            scope: {policyID: 'workspace-test'},
        },
        {
            navigator: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
            sidebar: SCREENS.DOMAIN.INITIAL,
            central: SCREENS.DOMAIN.MEMBERS,
            rhp: SCREENS.DOMAIN.MEMBERS_SETTINGS,
            scope: {domainAccountID: 12345},
        },
    ])('$navigator scope recovery', ({navigator, sidebar, central, rhp, scope}) => {
        const config: RouterConfigOptions = {
            routeNames: [sidebar, central],
            routeParamList: {},
            routeGetIdList: {},
        };

        it('preserves only the identifying params on the parent split route for a settings link', () => {
            // Given an RHP link carrying both scope and React Navigation hint params
            const route = {name: rhp, params: {...scope, screen: central, params: {unrelated: true}, state: {routes: []}}};

            // When the background workspace or domain navigator is built
            const result = getMatchingFullScreenRoute(route);
            const workspaceNavigator = result?.state?.routes.find((tab) => tab.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
            const split = workspaceNavigator?.state?.routes.find((child) => child.name === navigator);

            // Then scope survives even if the nested navigation state is later removed, without copying hint keys
            expect(split?.params).toEqual(scope);
        });

        describe.each([false, true])('on narrow layout: %s', (isNarrowLayout) => {
            beforeEach(() => {
                mockGetIsNarrowLayout.mockReturnValue(isNarrowLayout);
            });

            it.each([false, true])('restores an initial sidebar with undefined params (nested scope: %s)', (isNested) => {
                // Given a new split route with scope params but no saved child state, as when reopening a settings link
                const scopedRouter = SplitRouter({
                    sidebarScreen: sidebar,
                    defaultCentralScreen: central,
                    parentRoute: {
                        key: `${navigator}-initial`,
                        name: navigator,
                        params: isNested ? {screen: central, params: scope, state: {routes: []}} : {...scope, screen: central, state: {routes: []}},
                    },
                });

                // When StackRouter initializes its sidebar without params
                const result = scopedRouter.getInitialState(config);

                // Then both visible panes recover only their identifying params, without React Navigation hint keys
                expect(result.routes.map((route) => ({name: route.name, params: route.params}))).toEqual(
                    isNarrowLayout
                        ? [{name: sidebar, params: scope}]
                        : [
                              {name: sidebar, params: scope},
                              {name: central, params: scope},
                          ],
                );
            });

            it('backfills an existing sidebar with empty params during rehydration', () => {
                // Given a sidebar that survived without its identifying params
                const scopedRouter = SplitRouter({
                    sidebarScreen: sidebar,
                    defaultCentralScreen: central,
                    parentRoute: {key: `${navigator}-rehydrated`, name: navigator, params: scope},
                });

                // When the split navigator rehydrates that sidebar
                const result = scopedRouter.getRehydratedState({stale: true, routes: [{name: sidebar, params: {}}]}, config);

                // Then the sidebar and any synthesized central pane receive the scope
                for (const route of result.routes) {
                    expect(route.params).toEqual(scope);
                }
                expect(result.routes).toHaveLength(isNarrowLayout ? 1 : 2);
            });

            it('uses the central screen scope when inserting a missing sidebar', () => {
                // Given a central screen whose scope is newer than the parent route scope
                const scopedRouter = SplitRouter({
                    sidebarScreen: sidebar,
                    defaultCentralScreen: central,
                    parentRoute: {key: `${navigator}-central`, name: navigator, params: {policyID: 'old-workspace', domainAccountID: 67890}},
                });

                // When a missing sidebar is synthesized
                const result = scopedRouter.getRehydratedState({stale: true, routes: [{name: central, params: scope}]}, config);

                // Then the visible workspace or domain does not change to the parent's older scope
                expect(result.routes.find((route) => route.name === sidebar)?.params).toEqual(scope);
                expect(result.routes.find((route) => route.name === central)?.params).toEqual(scope);
            });

            it('uses the parent scope when both the sidebar and central params are missing', () => {
                // Given a central screen without params and a missing sidebar
                const scopedRouter = SplitRouter({
                    sidebarScreen: sidebar,
                    defaultCentralScreen: central,
                    parentRoute: {key: `${navigator}-missing-sidebar`, name: navigator, params: {screen: central, params: scope}},
                });

                // When adaptation inserts the sidebar behind the central screen
                const result = scopedRouter.getRehydratedState({stale: true, routes: [{name: central}]}, config);

                // Then the synthesized sidebar recovers its scope without copying the nested params hint
                expect(result.routes.find((route) => route.name === sidebar)?.params).toEqual(scope);
            });

            it('uses the central screen scope when an existing empty sidebar has a stale parent scope', () => {
                // Given a central screen on a different workspace or domain than the parent route remembers
                const scopedRouter = SplitRouter({
                    sidebarScreen: sidebar,
                    defaultCentralScreen: central,
                    parentRoute: {key: `${navigator}-stale-parent`, name: navigator, params: {policyID: 'old-workspace', domainAccountID: 67890}},
                });

                // When the existing sidebar needs its identifying params restored
                const result = scopedRouter.getRehydratedState({stale: true, routes: [{name: sidebar}, {name: central, params: scope}]}, config);

                // Then both panes stay on the central screen's scope rather than showing different workspaces or domains
                expect(result.routes.find((route) => route.name === sidebar)?.params).toEqual(scope);
                expect(result.routes.find((route) => route.name === central)?.params).toEqual(scope);
            });
        });
    });

    describe('navigating to the sidebar screen on narrow layout', () => {
        beforeEach(() => {
            mockGetIsNarrowLayout.mockReturnValue(true);
        });

        it('returns the current state when the sidebar is the only screen', () => {
            // Given a split navigator that only shows the sidebar, as it does after the Reports tab is preloaded
            const state = makeState([SCREENS.INBOX]);

            // When something navigates to the sidebar screen again, for example tapping the Inbox tab
            const result = router.getStateForAction(state, CommonActions.navigate(SCREENS.INBOX), CONFIG_OPTIONS);

            // Then the router reports the action as handled with no change, instead of returning null, which React Navigation reports as params it couldn't apply
            expect(result).toBe(state);
        });

        it('pops back to the sidebar when a central screen is on top', () => {
            // Given a split navigator with a report opened on top of the sidebar
            const state = makeState([SCREENS.INBOX, SCREENS.REPORT]);

            // When something navigates to the sidebar screen
            const result = router.getStateForAction(state, CommonActions.navigate(SCREENS.INBOX), CONFIG_OPTIONS);

            // Then the router still pops to the sidebar, so the fallback only applies when there is nothing to pop
            expect(result?.index).toBe(0);
            expect(result?.routes.map((route) => route.name)).toEqual([SCREENS.INBOX]);
        });
    });
});
