import {act, render} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {InitialState} from '@react-navigation/native';

import React, {createContext, useContext} from 'react';

import requireNavigationContainer from '../utils/requireNavigationContainer';
import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

// `jest.spyOn` here installs on the live navigation container. Each test mounts a fresh one, but restoring keeps a
// leaked spy from ever outliving the test that made it.
afterEach(() => {
    jest.restoreAllMocks();
});
const mockedPolicyID = 'test-policy';
const mockedBackToRoute = '/test';

function buildWorkspaceSplitRoute(policyID: string, centralScreen: string = SCREENS.WORKSPACE.MEMBERS, centralParams: Record<string, unknown> = {policyID}, previousCentralScreen?: string) {
    const centralRoutes = [...(previousCentralScreen ? [{name: previousCentralScreen, params: {policyID}}] : []), {name: centralScreen, params: centralParams}];
    return {
        name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
        state: {
            index: centralRoutes.length,
            routes: [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID}}, ...centralRoutes],
        },
    };
}

function buildDomainSplitRoute(domainAccountID: number, centralScreen: string = SCREENS.DOMAIN.MEMBERS) {
    return {
        name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
        state: {
            index: 1,
            routes: [
                {name: SCREENS.DOMAIN.INITIAL, params: {domainAccountID}},
                {name: centralScreen, params: {domainAccountID}},
            ],
        },
    };
}

type WorkspaceScopeRoute = ReturnType<typeof buildWorkspaceSplitRoute> | ReturnType<typeof buildDomainSplitRoute>;

const WORKSPACES_TAB_INDEX = 4;

function buildWorkspaceNavigationState(...workspaceSplits: WorkspaceScopeRoute[]): InitialState {
    return buildWorkspaceNavigationStateWithActiveTab(WORKSPACES_TAB_INDEX, ...workspaceSplits);
}

function buildWorkspaceNavigationStateWithActiveTab(activeTabIndex: number, ...workspaceSplits: WorkspaceScopeRoute[]): InitialState {
    return {
        index: 0,
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: activeTabIndex,
                    routes: [
                        {name: SCREENS.HOME},
                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                        {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                        {
                            name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                            state: {
                                index: workspaceSplits.length - 1,
                                routes: workspaceSplits,
                            },
                        },
                    ],
                },
            },
        ],
    };
}

const TestNarrowLayoutContext = createContext(true);

function useTestResponsiveLayout() {
    const shouldUseNarrowLayout = useContext(TestNarrowLayoutContext);
    return {...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout};
}

function renderCentralOnlySplits(...workspaceSplits: WorkspaceScopeRoute[]) {
    // Mount two root entries first, matching an in-app cross-tab deep link. A cold root adds a sidebar.
    const initialState: InitialState = {index: 1, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}, {name: NAVIGATORS.TAB_NAVIGATOR}]};
    const view = render(
        <TestNarrowLayoutContext.Provider value>
            <TestNavigationContainer initialState={initialState} />
        </TestNarrowLayoutContext.Provider>,
    );
    act(() => {
        navigationRef.resetRoot({
            index: 1,
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR}, ...buildWorkspaceNavigationState(...workspaceSplits).routes],
        });
    });
    // `initialState` comes back only so the rerender below can pass the same object. `NavigationContainer` reads the
    // prop on first mount only, so it is inert there - the rerender is really just flipping the layout.
    return {view, mountInitialState: initialState};
}

function getActiveWorkspaceState() {
    const root = navigationRef.getRootState();
    const tabState = root.routes.at(root.index)?.state;
    return tabState?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
}

describe('Go back on the narrow layout', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    describe('central-only scoped splits', () => {
        const workspaceA = {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.WORKSPACE.PROFILE, params: {policyID: 'policy-a'}}]}};
        const workspaceB = {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.WORKSPACE.MEMBERS, params: {policyID: 'policy-b'}}]}};
        const domainA = {name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.DOMAIN.SAML, params: {domainAccountID: 1}}]}};
        const domainB = {name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.DOMAIN.MEMBERS, params: {domainAccountID: 2}}]}};

        it.each([
            {scope: 'workspace', first: workspaceA, second: workspaceB, route: ROUTES.WORKSPACE_OVERVIEW.getRoute('policy-a'), expectedParams: {policyID: 'policy-a'}},
            // The fixture builds `domainAccountID: 1` and this expects `'1'`: a route resolved from a path carries
            // string params, which is why the scope comparison normalizes both sides.
            {scope: 'domain', first: domainA, second: domainB, route: ROUTES.DOMAIN_SAML.getRoute(1), expectedParams: {domainAccountID: '1'}},
        ])('restores central-only $scope history', ({first, second, route, expectedParams}) => {
            renderCentralOnlySplits(first, second);
            const before = getActiveWorkspaceState();
            const originalSplit = before?.routes.at(0);
            expect(originalSplit?.state?.routes).toHaveLength(1);
            expect(before?.routes.at(1)?.state?.routes).toHaveLength(1);

            act(() => {
                Navigation.goBack(route);
            });

            const after = getActiveWorkspaceState();
            expect(after?.routes).toHaveLength(1);
            expect(after?.routes.at(0)?.key).toBe(originalSplit?.key);
            expect(after?.routes.at(0)?.state?.routes.at(-1)?.name).toBe(first.state.routes.at(0)?.name);
            expect(after?.routes.at(0)?.state?.routes.at(-1)?.params).toMatchObject(expectedParams);
        });

        it('keeps workspace identity coherent after cross-scope navigation, widening, and Back', () => {
            // Context updates reach memoized navigation screens, as the real responsive hook does.
            mockedUseResponsiveLayout.mockImplementation(useTestResponsiveLayout);
            const categoriesA = {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.WORKSPACE.CATEGORIES, params: {policyID: 'policy-a'}}]}};
            const {view, mountInitialState} = renderCentralOnlySplits(categoriesA);
            const originalSplit = getActiveWorkspaceState()?.routes.at(0);
            expect(originalSplit?.state?.routes).toHaveLength(1);
            act(() => {
                Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute('policy-b'));
            });
            const afterNavigate = getActiveWorkspaceState();
            expect(afterNavigate?.routes).toHaveLength(2);
            expect(afterNavigate?.routes.at(0)?.key).toBe(originalSplit?.key);
            expect(afterNavigate?.routes.at(-1)?.state?.routes.at(-1)?.params).toMatchObject({policyID: 'policy-b'});

            mockedGetIsNarrowLayout.mockReturnValue(false);
            view.rerender(
                <TestNarrowLayoutContext.Provider value={false}>
                    <TestNavigationContainer initialState={mountInitialState} />
                </TestNarrowLayoutContext.Provider>,
            );
            act(() => {
                Navigation.goBack();
            });
            const restored = getActiveWorkspaceState();
            expect(restored?.routes).toHaveLength(1);
            expect(restored?.routes.at(0)?.key).toBe(originalSplit?.key);
            expect(restored?.routes.at(0)?.state?.routes).toEqual([
                expect.objectContaining({name: SCREENS.WORKSPACE.INITIAL, params: expect.objectContaining({policyID: 'policy-a'})}),
                expect.objectContaining({name: SCREENS.WORKSPACE.CATEGORIES, params: expect.objectContaining({policyID: 'policy-a'})}),
            ]);
        });
    });

    describe('called without params', () => {
        it('Should pop the last page in the navigation state', () => {
            // Given the initialized navigation on the narrow layout with the settings split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 4,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {name: SCREENS.INSIGHTS},
                                        {
                                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 1,
                                                routes: [
                                                    {
                                                        name: SCREENS.SETTINGS.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PROFILE.ROOT,
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitBeforeGoBack = tabState?.routes.at(4);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(1);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);

            // When go back without specifying fallbackRoute
            act(() => {
                Navigation.goBack();
            });

            // Then pop the last screen from the navigation state
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterGoBack = tabStateAfter?.routes.at(4);
            expect(settingsSplitAfterGoBack?.state?.index).toBe(0);
            expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);
        });
    });

    describe('called with fallbackRoute param', () => {
        it('Should go back to the page passed to goBack as a fallbackRoute', () => {
            // Given the initialized navigation on the narrow layout with the settings split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 4,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {name: SCREENS.INSIGHTS},
                                        {
                                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 2,
                                                routes: [
                                                    {
                                                        name: SCREENS.SETTINGS.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PROFILE.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PREFERENCES.ROOT,
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitBeforeGoBack = tabState?.routes.at(4);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(2);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PREFERENCES.ROOT);

            // When go back to the fallbackRoute present in the navigation state
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS);
            });

            // Then pop to the fallbackRoute
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterGoBack = tabStateAfter?.routes.at(4);
            expect(settingsSplitAfterGoBack?.state?.index).toBe(0);
            expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);
        });

        it('Should replace the current page with the page passed as a fallbackRoute', () => {
            // Given the initialized navigation on the narrow layout with the settings split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 4,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {name: SCREENS.INSIGHTS},
                                        {
                                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 1,
                                                routes: [
                                                    {
                                                        name: SCREENS.SETTINGS.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PROFILE.ROOT,
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitBeforeGoBack = tabState?.routes.at(4);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(1);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);

            // When go back to the fallbackRoute that does not exist in the navigation state
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS_ABOUT);
            });

            // Then replace the current page with the page passed as a fallbackRoute
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterGoBack = tabStateAfter?.routes.at(4);
            expect(settingsSplitAfterGoBack?.state?.index).toBe(1);
            expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ABOUT);
        });

        it('Should go back to the page from the previous split navigator', () => {
            // Given the initialized navigation on the narrow layout with reports and settings pages
            // In the new tab structure, both navigators are tabs. The active tab is reports (index 1).
            // Settings tab has its own state.
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 1,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {
                                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 2,
                                                routes: [
                                                    {
                                                        name: SCREENS.INBOX,
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '1'},
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '2'},
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {name: SCREENS.INSIGHTS},
                                        {
                                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 2,
                                                routes: [
                                                    {
                                                        name: SCREENS.SETTINGS.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PROFILE.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PREFERENCES.ROOT,
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeGoBack = navigationRef.current?.getRootState();
            const tabStateBeforeGoBack = rootStateBeforeGoBack?.routes.at(0)?.state;
            const activeTabBeforeGoBack = tabStateBeforeGoBack?.routes.at(tabStateBeforeGoBack?.index ?? 0);
            expect(activeTabBeforeGoBack?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

            // When go back to the page present in the previous split navigator
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS);
            });

            // In the tab navigator, goBack with a cross-tab fallback route uses jumpTo
            // to switch to the target tab (settings).
            const rootStateAfterGoBack = navigationRef.current?.getRootState();
            const tabStateAfterGoBack = rootStateAfterGoBack?.routes.at(0)?.state;
            const activeTabAfterGoBack = tabStateAfterGoBack?.routes.at(tabStateAfterGoBack?.index ?? 0);
            expect(activeTabAfterGoBack?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        });

        it('Should replace the current route with a new split navigator when distance from the fallbackRoute is greater than one split navigator', () => {
            // Given the initialized navigation on the narrow layout
            // In the new tab structure, the active tab is search (index 2).
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 2,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {
                                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 2,
                                                routes: [
                                                    {
                                                        name: SCREENS.INBOX,
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '1'},
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '2'},
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                            state: {
                                                index: 0,
                                                routes: [
                                                    {
                                                        name: SCREENS.SEARCH.ROOT,
                                                    },
                                                ],
                                            },
                                        },
                                        {name: SCREENS.INSIGHTS},
                                        {
                                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 2,
                                                routes: [
                                                    {
                                                        name: SCREENS.SETTINGS.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PROFILE.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PREFERENCES.ROOT,
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeGoBack = navigationRef.current?.getRootState();
            const tabStateBeforeGoBack = rootStateBeforeGoBack?.routes.at(0)?.state;
            const activeTabBeforeGoBack = tabStateBeforeGoBack?.routes.at(tabStateBeforeGoBack?.index ?? 0);
            expect(activeTabBeforeGoBack?.name).toBe(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);

            // When go back to the page present in the split navigator that is more than 1 route away
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS);
            });

            // In the tab navigator, goBack with a cross-tab fallback route uses jumpTo
            // to switch to the target tab (settings).
            const rootStateAfterGoBack = navigationRef.current?.getRootState();
            const tabStateAfterGoBack = rootStateAfterGoBack?.routes.at(0)?.state;
            const activeTabAfterGoBack = tabStateAfterGoBack?.routes.at(tabStateAfterGoBack?.index ?? 0);
            expect(activeTabAfterGoBack?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        });
    });

    describe('called with a different workspace fallback route', () => {
        const policyA = 'policy-a';
        const policyB = 'policy-b';

        it('Should preserve each split instance state under its own route key', () => {
            // `hasDifferentSplitScope` falls back to the preserved state of an unmounted split, and `SplitRouter`
            // seeds a remounting split from the same entry. Both key off the split's own parent route, so sibling
            // splits of different scopes must not share one entry.
            render(<TestNavigationContainer initialState={buildWorkspaceNavigationState(buildWorkspaceSplitRoute(policyA), buildWorkspaceSplitRoute(policyB))} />);

            const workspaceState = navigationRef.current
                ?.getRootState()
                .routes.at(0)
                ?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const [splitA, splitB] = workspaceState?.routes ?? [];
            expect(splitA?.key).not.toBe(splitB?.key);

            const preservedA = splitA?.key ? getPreservedNavigatorState(splitA.key) : undefined;
            const preservedB = splitB?.key ? getPreservedNavigatorState(splitB.key) : undefined;
            expect(preservedA?.routes.at(0)?.params).toMatchObject({policyID: policyA});
            expect(preservedB?.routes.at(0)?.params).toMatchObject({policyID: policyB});
        });

        it('Should pop to the matching workspace split', () => {
            render(<TestNavigationContainer initialState={buildWorkspaceNavigationState(buildWorkspaceSplitRoute(policyA), buildWorkspaceSplitRoute(policyB))} />);

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyA));
            });

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const workspaceState = tabState?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(workspaceState?.routes).toHaveLength(1);
            expect(activeSplit?.state?.routes.at(0)?.params).toMatchObject({policyID: policyA});
            expect(activeSplit?.state?.routes.at(-1)?.params).toMatchObject({policyID: policyA});
        });

        it.each([true, false])('Should update a restored workspace sidebar directly with compareParams=%s', (compareParams) => {
            const sidebarOnlySplit = {
                name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID: policyA, backTo: ROUTES.WORKSPACES_LIST.route}}],
                },
            };
            render(<TestNavigationContainer initialState={buildWorkspaceNavigationState(sidebarOnlySplit, buildWorkspaceSplitRoute(policyB))} />);

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_INITIAL.getRoute(policyA, ROUTES.HOME), {compareParams});
            });

            const workspaceState = navigationRef.current
                ?.getRootState()
                .routes.at(0)
                ?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(workspaceState?.routes).toHaveLength(1);
            expect(activeSplit?.state?.index).toBe(0);
            expect(activeSplit?.state?.routes).toHaveLength(1);
            expect(activeSplit?.state?.routes.at(0)).toMatchObject({
                name: SCREENS.WORKSPACE.INITIAL,
                params: {policyID: policyA, backTo: ROUTES.HOME},
            });
        });

        it.each([true, false])('Should pop to the matching workspace split and apply the requested leaf with compareParams=%s', (compareParams) => {
            render(
                <TestNavigationContainer
                    initialState={buildWorkspaceNavigationState(buildWorkspaceSplitRoute(policyA, SCREENS.WORKSPACE.MORE_FEATURES), buildWorkspaceSplitRoute(policyB))}
                />,
            );

            const tabStateBeforeGoBack = navigationRef.current?.getRootState().routes.at(0)?.state;
            const workspaceStateBeforeGoBack = tabStateBeforeGoBack?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            expect(workspaceStateBeforeGoBack?.routes.at(0)?.state?.routes.at(-1)?.name).toBe(SCREENS.WORKSPACE.MORE_FEATURES);

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyA), {compareParams});
            });

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const workspaceState = tabState?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(workspaceState?.routes).toHaveLength(1);
            expect(activeSplit?.state?.routes).toHaveLength(2);
            expect(activeSplit?.state?.routes.at(0)).toEqual(workspaceStateBeforeGoBack?.routes.at(0)?.state?.routes.at(0));
            expect(activeSplit?.state?.routes.at(-1)).toMatchObject({
                name: SCREENS.WORKSPACE.PROFILE,
                params: {policyID: policyA},
            });
        });

        it('Should pop within the matching workspace split when the requested leaf is already in its history', () => {
            render(
                <TestNavigationContainer
                    initialState={buildWorkspaceNavigationState(
                        buildWorkspaceSplitRoute(policyA, SCREENS.WORKSPACE.MORE_FEATURES, {policyID: policyA}, SCREENS.WORKSPACE.PROFILE),
                        buildWorkspaceSplitRoute(policyB),
                    )}
                />,
            );

            const tabStateBeforeGoBack = navigationRef.current?.getRootState().routes.at(0)?.state;
            const workspaceStateBeforeGoBack = tabStateBeforeGoBack?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const matchingSplitBeforeGoBack = workspaceStateBeforeGoBack?.routes.at(0);
            const requestedLeafKey = matchingSplitBeforeGoBack?.state?.routes.at(1)?.key;
            expect(matchingSplitBeforeGoBack?.state?.routes.map((route) => route.name)).toEqual([SCREENS.WORKSPACE.INITIAL, SCREENS.WORKSPACE.PROFILE, SCREENS.WORKSPACE.MORE_FEATURES]);

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyA));
            });

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const workspaceState = tabState?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(workspaceState?.routes).toHaveLength(1);
            expect(activeSplit?.state?.routes).toHaveLength(2);
            expect(activeSplit?.state?.routes.at(-1)).toMatchObject({
                key: requestedLeafKey,
                name: SCREENS.WORKSPACE.PROFILE,
                params: {policyID: policyA},
            });
        });

        it('Should replace the active split when the fallback workspace is not in the stack', () => {
            render(<TestNavigationContainer initialState={buildWorkspaceNavigationState(buildWorkspaceSplitRoute(policyB))} />);

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyA));
            });

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const workspaceState = tabState?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(workspaceState?.routes).toHaveLength(1);
            expect(activeSplit?.state?.routes.at(0)?.params).toMatchObject({policyID: policyA});
            expect(activeSplit?.state?.routes.at(-1)?.params).toMatchObject({policyID: policyA});
        });

        it('Should switch tabs without dispatching a pop the tab navigator would drop', () => {
            // The workspace tab is focused and the settings tab sits before it, so reaching the settings tab means
            // going backwards within the tab navigator.
            render(<TestNavigationContainer initialState={buildWorkspaceNavigationState(buildWorkspaceSplitRoute(policyA), buildWorkspaceSplitRoute(policyB))} />);
            const tabStateKey = navigationRef.current?.getRootState().routes.at(0)?.state?.key;
            const dispatchSpy = jest.spyOn(requireNavigationContainer(), 'dispatch');

            act(() => {
                Navigation.goBack(ROUTES.SETTINGS);
            });

            // TabRouter has no POP case, so a pop targeted at the tab navigator would be dropped as an unhandled
            // action. Switching tabs is the jumpTo case goBack owns.
            expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: CONST.NAVIGATION.ACTION_TYPE.POP, target: tabStateKey}));
            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            expect(tabState?.routes.at(tabState.index ?? 0)?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        });

        it('Should replace rather than pop past more than one root route', () => {
            const initialState: InitialState = {
                index: 2,
                routes: [
                    ...buildWorkspaceNavigationState(buildWorkspaceSplitRoute(policyA), buildWorkspaceSplitRoute(policyB)).routes,
                    {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.RIGHT_MODAL.SETTINGS}]}},
                    {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.RIGHT_MODAL.MONEY_REQUEST}]}},
                ],
            };
            render(<TestNavigationContainer initialState={initialState} />);
            const workspaceStateBeforeGoBack = navigationRef.current
                ?.getRootState()
                .routes.at(0)
                ?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            expect(workspaceStateBeforeGoBack?.routes).toHaveLength(2);

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyA));
            });

            // Reaching the matching split would mean popping two routes off the root, which would lose the visited
            // pages, so the focused route is replaced instead and nothing underneath is touched.
            const rootState = navigationRef.current?.getRootState();
            expect(rootState?.routes).toHaveLength(3);
            expect(rootState?.routes.at(-1)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
            const workspaceState = rootState?.routes.at(0)?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            expect(workspaceState?.routes).toHaveLength(2);
            expect(workspaceState?.index).toBe(1);
        });

        it('Should pop every split above the matching workspace in one go back', () => {
            const policyC = 'policy-c';
            render(
                <TestNavigationContainer
                    initialState={buildWorkspaceNavigationState(
                        buildWorkspaceSplitRoute(policyA, SCREENS.WORKSPACE.MORE_FEATURES),
                        buildWorkspaceSplitRoute(policyC),
                        buildWorkspaceSplitRoute(policyB),
                    )}
                />,
            );

            const workspaceStateBeforeGoBack = navigationRef.current
                ?.getRootState()
                .routes.at(0)
                ?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const matchingSplitBeforeGoBack = workspaceStateBeforeGoBack?.routes.at(0);
            expect(workspaceStateBeforeGoBack?.routes).toHaveLength(3);

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyA));
            });

            const workspaceState = navigationRef.current
                ?.getRootState()
                .routes.at(0)
                ?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(workspaceState?.routes).toHaveLength(1);
            expect(activeSplit?.key).toBe(matchingSplitBeforeGoBack?.key);
            expect(activeSplit?.state?.routes.at(-1)).toMatchObject({
                name: SCREENS.WORKSPACE.PROFILE,
                params: {policyID: policyA},
            });
        });
    });

    describe('called from an open modal with a workspace fallback route', () => {
        const policyA = 'policy-a';
        const policyB = 'policy-b';

        function buildStateWithModalOverWorkspaces(...workspaceSplits: WorkspaceScopeRoute[]): InitialState {
            return buildStateWithModalOverTab(WORKSPACES_TAB_INDEX, ...workspaceSplits);
        }

        function buildStateWithModalOverTab(activeTabIndex: number, ...workspaceSplits: WorkspaceScopeRoute[]): InitialState {
            return {
                index: 1,
                routes: [
                    ...buildWorkspaceNavigationStateWithActiveTab(activeTabIndex, ...workspaceSplits).routes,
                    {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.RIGHT_MODAL.SETTINGS}]}},
                ],
            };
        }

        it('Should close the modal and reach the matching workspace split', () => {
            render(<TestNavigationContainer initialState={buildStateWithModalOverWorkspaces(buildWorkspaceSplitRoute(policyA), buildWorkspaceSplitRoute(policyB))} />);
            const dispatchSpy = jest.spyOn(requireNavigationContainer(), 'dispatch');

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyA));
            });

            // The modal is above the tab navigator, so the descent used to stop at the root and apply the requested
            // screen to whichever split happened to be focused - workspace B's - which is issue #99034 on the back path.
            const rootState = navigationRef.current?.getRootState();
            expect(rootState?.routes.map((route) => route.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR]);

            const workspaceState = rootState?.routes.at(0)?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(workspaceState?.routes).toHaveLength(1);
            // Three levels cover the requested route at once here - the modal, workspace B's split and A's own central
            // screen - so closing the modal and focusing A's split is not enough: the requested screen has to end up
            // focused inside it too.
            expect(activeSplit?.state?.routes.every((route) => (route.params as {policyID?: string} | undefined)?.policyID === policyA)).toBe(true);
            expect(activeSplit?.state?.routes.at(activeSplit.state.index ?? 0)).toMatchObject({
                name: SCREENS.WORKSPACE.PROFILE,
                params: {policyID: policyA},
            });
            // Going back must never add a screen, and on web must never add a browser history entry with it.
            expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: CONST.NAVIGATION.ACTION_TYPE.PUSH}));
        });

        it('Should restore the tab the fallback route belongs to when the tab navigator is focused elsewhere', () => {
            // Issue #89006: the tab navigator's index is left on Home by the root stack's state slicing, so popping
            // the modal alone lands on Home instead of the tab holding the back target. The POP_TO that used to
            // restore the nested state from the payload is gone. The walk down plus the tab jumpTo replaces it.
            render(<TestNavigationContainer initialState={buildStateWithModalOverTab(0, buildWorkspaceSplitRoute(policyA))} />);
            const tabStateBefore = navigationRef.current?.getRootState().routes.at(0)?.state;
            expect(tabStateBefore?.routes.at(tabStateBefore.index ?? 0)?.name).toBe(SCREENS.HOME);
            const dispatchSpy = jest.spyOn(requireNavigationContainer(), 'dispatch');

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyA));
            });

            const rootState = navigationRef.current?.getRootState();
            expect(rootState?.routes.map((route) => route.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR]);
            const tabState = rootState?.routes.at(0)?.state;
            expect(tabState?.routes.at(tabState.index ?? 0)?.name).toBe(NAVIGATORS.WORKSPACE_NAVIGATOR);
            const workspaceState = tabState?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(activeSplit?.state?.routes.at(activeSplit.state.index ?? 0)).toMatchObject({
                name: SCREENS.WORKSPACE.PROFILE,
                params: {policyID: policyA},
            });
            // Issue #89209: the replacement must not add a screen either, which is what POP_TO did when there was
            // nothing to pop.
            expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: CONST.NAVIGATION.ACTION_TYPE.PUSH}));
        });

        it('Should collapse onto an underlying tab navigator that already has the target tab active', () => {
            const initialState: InitialState = {
                index: 2,
                routes: [
                    ...buildWorkspaceNavigationState(buildWorkspaceSplitRoute(policyA)).routes,
                    ...buildWorkspaceNavigationStateWithActiveTab(1, buildWorkspaceSplitRoute(policyB)).routes,
                    {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.RIGHT_MODAL.SETTINGS}]}},
                ],
            };
            render(<TestNavigationContainer initialState={initialState} />);
            const rootRouteKeyBefore = navigationRef.current?.getRootState().routes.at(0)?.key;
            const dispatchSpy = jest.spyOn(requireNavigationContainer(), 'dispatch');

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyA));
            });

            // Popping the modal uncovers a tab navigator sitting on Home, and the one below it already has the
            // workspaces tab active, so going back collapses onto that one rather than jumping tabs in the duplicate.
            const rootState = navigationRef.current?.getRootState();
            expect(rootState?.routes.map((route) => route.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR]);
            expect(rootState?.routes.at(0)?.key).toBe(rootRouteKeyBefore);

            const workspaceState = rootState?.routes.at(0)?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(activeSplit?.state?.routes.at(activeSplit.state.index ?? 0)).toMatchObject({
                name: SCREENS.WORKSPACE.PROFILE,
                params: {policyID: policyA},
            });
            expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: CONST.NAVIGATION.ACTION_TYPE.PUSH}));
        });

        it('Should leave the other workspace splits alone when the fallback route belongs to the focused one', () => {
            render(<TestNavigationContainer initialState={buildStateWithModalOverWorkspaces(buildWorkspaceSplitRoute(policyA), buildWorkspaceSplitRoute(policyB))} />);

            act(() => {
                Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyB));
            });

            const rootState = navigationRef.current?.getRootState();
            expect(rootState?.routes.map((route) => route.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR]);

            const workspaceState = rootState?.routes.at(0)?.state?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            expect(workspaceState?.routes).toHaveLength(2);
            expect(workspaceState?.index).toBe(1);
            const activeSplit = workspaceState?.routes.at(1);
            expect(activeSplit?.state?.routes.at(0)?.params).toMatchObject({policyID: policyB});
            expect(activeSplit?.state?.routes.at(-1)).toMatchObject({
                name: SCREENS.WORKSPACE.PROFILE,
                params: {policyID: policyB},
            });
        });
    });

    describe('called with a different domain fallback route', () => {
        const domainA = 1;
        const domainB = 2;

        it('Should pop to the matching domain split', () => {
            render(<TestNavigationContainer initialState={buildWorkspaceNavigationState(buildDomainSplitRoute(domainA, SCREENS.DOMAIN.SAML), buildDomainSplitRoute(domainB))} />);

            const tabStateBeforeGoBack = navigationRef.current?.getRootState().routes.at(0)?.state;
            const workspaceStateBeforeGoBack = tabStateBeforeGoBack?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            expect(workspaceStateBeforeGoBack?.routes.at(0)?.state?.routes.at(-1)?.name).toBe(SCREENS.DOMAIN.SAML);

            act(() => {
                Navigation.goBack(ROUTES.DOMAIN_MEMBERS.getRoute(domainA));
            });

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const workspaceState = tabState?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state;
            const activeSplit = workspaceState?.routes.at(workspaceState.index ?? 0);
            expect(workspaceState?.routes).toHaveLength(1);
            expect(activeSplit?.state?.routes).toHaveLength(2);
            expect(activeSplit?.state?.routes.at(0)).toEqual(workspaceStateBeforeGoBack?.routes.at(0)?.state?.routes.at(0));
            expect(activeSplit?.state?.routes.at(0)?.params).toMatchObject({domainAccountID: domainA});
            expect(activeSplit?.state?.routes.at(-1)).toMatchObject({
                name: SCREENS.DOMAIN.MEMBERS,
                params: {domainAccountID: String(domainA)},
            });
        });
    });

    describe('called with fallbackRoute param with route params comparison', () => {
        it('Should go back to the page with matching route params', () => {
            // Given the initialized navigation on the narrow layout with the reports split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 1,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {
                                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 3,
                                                routes: [
                                                    {
                                                        name: SCREENS.INBOX,
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '1'},
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '2'},
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '3'},
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {name: SCREENS.INSIGHTS},
                                        {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const reportsSplitBeforeGoBack = tabState?.routes.at(1);
            expect(reportsSplitBeforeGoBack?.state?.index).toBe(3);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '3'});

            // When go back to the same page with a different route param
            act(() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute('1'));
            });

            // Then pop to the page with matching params
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const reportsSplitAfterGoBack = tabStateAfter?.routes.at(1);
            expect(reportsSplitAfterGoBack?.state?.index).toBe(1);
            expect(reportsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitAfterGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '1'});
        });

        it('Should replace the current page with the same one with different params', () => {
            // Given the initialized navigation on the narrow layout with the reports split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 1,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {
                                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 2,
                                                routes: [
                                                    {
                                                        name: SCREENS.INBOX,
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '1'},
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '2'},
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {name: SCREENS.INSIGHTS},
                                        {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const reportsSplitBeforeGoBack = tabState?.routes.at(1);
            expect(reportsSplitBeforeGoBack?.state?.index).toBe(2);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '2'});

            // When go back to the same page with different route params that does not exist in the navigation state
            act(() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute('3'));
            });

            // Then replace the current page with the same one with different params
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const reportsSplitAfterGoBack = tabStateAfter?.routes.at(1);
            expect(reportsSplitAfterGoBack?.state?.index).toBe(2);
            expect(reportsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitAfterGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '3'});
        });

        it('Should go back without comparing params', () => {
            // Given the initialized navigation on the narrow layout with reports split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 1,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {
                                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 3,
                                                routes: [
                                                    {
                                                        name: SCREENS.INBOX,
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '1'},
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '2'},
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '3'},
                                                    },
                                                ],
                                            },
                                        },
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {name: SCREENS.INSIGHTS},
                                        {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
            const reportsSplitBeforeGoBack = tabState?.routes.at(1);
            expect(reportsSplitBeforeGoBack?.state?.index).toBe(3);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '3'});

            // When go back to the same page with different route params without comparing params
            act(() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute('1'), {compareParams: false});
            });

            // Then do not go back to the page with matching route params, instead replace the current page
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const reportsSplitAfterGoBack = tabStateAfter?.routes.at(1);
            expect(reportsSplitAfterGoBack?.state?.index).toBe(3);
            expect(reportsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitAfterGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '1'});
        });
    });
});
describe('Go back on the wide layout', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedUseResponsiveLayout.mockReturnValue({
            ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isLargeScreenWidth: true,
        });
    });

    it('should preserved backTo params between central screen and side bar screen', () => {
        // Given the initialized navigation with workspaces navigator containing a workspace split navigator
        render(
            <TestNavigationContainer
                initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS.TAB_NAVIGATOR,
                            state: {
                                index: 5,
                                routes: [
                                    {name: SCREENS.HOME},
                                    {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                    {name: SCREENS.INSIGHTS},
                                    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                    {
                                        name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                                        state: {
                                            index: 1,
                                            routes: [
                                                {
                                                    name: SCREENS.WORKSPACES_LIST,
                                                },
                                                {
                                                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                                                    state: {
                                                        index: 0,
                                                        routes: [
                                                            {
                                                                name: SCREENS.WORKSPACE.PER_DIEM,
                                                                params: {policyID: mockedPolicyID, backTo: mockedBackToRoute},
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                }}
            />,
        );

        // Then the backTo params should be preserved in the sidebar route
        const initialRootState = navigationRef.current?.getRootState();
        const tabState = initialRootState?.routes.at(0)?.state;
        const initialWorkspaceNavigator = tabState?.routes.at(5);
        const workspacesNavRoutes = initialWorkspaceNavigator?.state?.routes ?? [];
        const workspaceSplitNavigator = workspacesNavRoutes.find((route) => route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR);
        const initialSplitRoutes = workspaceSplitNavigator?.state?.routes ?? [];
        const initialSidebarRoute = initialSplitRoutes.find((route) => route.name === SCREENS.WORKSPACE.INITIAL);
        expect(initialSidebarRoute?.params).toMatchObject({
            policyID: mockedPolicyID,
            backTo: mockedBackToRoute,
        });
    });
});

describe('Go back with nothing to pop', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});
    });

    it('Should stay put when the only root route is already the tab navigator', () => {
        // Given a stack whose only route is the tab navigator, which is the public sign in root
        render(
            <TestNavigationContainer
                initialState={{
                    index: 0,
                    routes: [{name: NAVIGATORS.TAB_NAVIGATOR}],
                }}
            />,
        );

        const navigationContainer = navigationRef.current;
        if (!navigationContainer) {
            throw new Error('Navigation container is not ready');
        }
        // The key identifies the mounted screen. A reset assigns a new one, which remounts SignInPage.
        const keyBefore = navigationContainer.getRootState().routes.at(0)?.key;
        const resetSpy = jest.spyOn(navigationContainer, 'reset');

        // When going back without a fallback route
        act(() => {
            Navigation.goBack();
        });

        // Then the same route instance is still mounted, so SignInPage keeps the email and magic code the user entered
        const rootState = navigationRef.current?.getRootState();
        expect(rootState?.routes.length).toBe(1);
        expect(rootState?.routes.at(0)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        expect(rootState?.routes.at(0)?.key).toBe(keyBefore);
        expect(resetSpy).not.toHaveBeenCalled();
        resetSpy.mockRestore();
    });

    it('Should stay put when the root state is not available', () => {
        // Given an initialized navigation whose root state cannot be read yet
        render(
            <TestNavigationContainer
                initialState={{
                    index: 0,
                    routes: [{name: SCREENS.VALIDATE_LOGIN, params: {accountID: '1', validateCode: '1'}}],
                }}
            />,
        );

        const navigationContainer = navigationRef.current;
        if (!navigationContainer) {
            throw new Error('Navigation container is not ready');
        }
        const resetSpy = jest.spyOn(navigationContainer, 'reset');
        // getRootState() is typed as always returning a state, but it resolves to undefined before the container is
        // ready, which is the branch under test.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const getRootStateSpy = jest.spyOn(navigationContainer, 'getRootState').mockReturnValue(undefined as unknown as ReturnType<typeof navigationContainer.getRootState>);

        // When going back without a fallback route
        act(() => {
            Navigation.goBack();
        });

        // Then nothing is reset, because there is no state to reset
        expect(resetSpy).not.toHaveBeenCalled();

        getRootStateSpy.mockRestore();
        resetSpy.mockRestore();
    });

    it('Should reset to the tab navigator when the only root route is reachable by link', () => {
        // Given a stack whose only route is a link entry screen, which is how /v/ and /u/ are opened
        render(
            <TestNavigationContainer
                initialState={{
                    index: 0,
                    routes: [{name: SCREENS.VALIDATE_LOGIN, params: {accountID: '1', validateCode: '1'}}],
                }}
            />,
        );

        // When going back without a fallback route
        act(() => {
            Navigation.goBack();
        });

        // Then the stranded route is replaced by the app root instead of the press doing nothing
        const rootState = navigationRef.current?.getRootState();
        expect(rootState?.routes.length).toBe(1);
        expect(rootState?.routes.at(0)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
    });
});
