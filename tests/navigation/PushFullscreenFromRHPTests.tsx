import {act, render} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

describe('Push fullscreen from RHP', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('strips the RHP when navigating to a fullscreen screen', () => {
        // Given the initialized navigation with a ReportsSplitNavigator (inside TAB_NAVIGATOR) and RightModalNavigator on top
        render(
            <TestNavigationContainer
                initialState={{
                    index: 1,
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
                                            index: 0,
                                            routes: [
                                                {
                                                    name: SCREENS.INBOX,
                                                },
                                            ],
                                        },
                                    },
                                    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                    {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                ],
                            },
                        },
                        {
                            name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                            state: {
                                index: 0,
                                routes: [
                                    {
                                        name: SCREENS.RIGHT_MODAL.SETTINGS,
                                    },
                                ],
                            },
                        },
                    ],
                }}
            />,
        );

        const rootStateBefore = navigationRef.current?.getRootState();
        expect(rootStateBefore?.index).toBe(1);
        expect(rootStateBefore?.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

        // When navigating to Workspaces_List (a fullscreen screen) from the RHP
        act(() => {
            Navigation.navigate(ROUTES.WORKSPACES_LIST.getRoute());
        });

        // Then the RHP should be stripped and a new TabNavigator should be pushed
        // with WorkspaceNavigator active, containing Workspaces_List
        const rootStateAfter = navigationRef.current?.getRootState();

        // The new TabNavigator is pushed at the end of the root stack
        const lastRootRoute = rootStateAfter?.routes.at(-1);
        expect(lastRootRoute?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);

        const newTabState = lastRootRoute?.state;
        const workspaceNav = newTabState?.routes.at(4);
        expect(workspaceNav?.name).toBe(NAVIGATORS.WORKSPACE_NAVIGATOR);
        const nestedWorkspacesListRoute = workspaceNav?.state?.routes?.at(-1);
        expect(nestedWorkspacesListRoute?.name).toBe(SCREENS.WORKSPACES_LIST);

        // RHP should NOT be the topmost route — the new TabNavigator is on top
        const topRoute = rootStateAfter?.routes.at(-1);
        expect(topRoute?.name).not.toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    });

    it('preserves the backTo param when navigating from RHP to fullscreen', () => {
        // Given the initialized navigation with a ReportsSplitNavigator (inside TAB_NAVIGATOR) and RightModalNavigator on top
        render(
            <TestNavigationContainer
                initialState={{
                    index: 1,
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
                                            index: 0,
                                            routes: [
                                                {
                                                    name: SCREENS.INBOX,
                                                },
                                            ],
                                        },
                                    },
                                    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                    {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                ],
                            },
                        },
                        {
                            name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                            state: {
                                index: 0,
                                routes: [
                                    {
                                        name: SCREENS.RIGHT_MODAL.SETTINGS,
                                    },
                                ],
                            },
                        },
                    ],
                }}
            />,
        );

        // When navigating to Workspaces_List with a backTo param
        act(() => {
            Navigation.navigate(ROUTES.WORKSPACES_LIST.getRoute(ROUTES.NEW_ROOM));
        });

        // Then a new TabNavigator should be pushed with WorkspaceNavigator active
        const rootStateAfter = navigationRef.current?.getRootState();
        const lastRootRoute = rootStateAfter?.routes.at(-1);
        expect(lastRootRoute?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);

        const newTabState = lastRootRoute?.state;
        const workspaceNav = newTabState?.routes.at(4);
        expect(workspaceNav?.name).toBe(NAVIGATORS.WORKSPACE_NAVIGATOR);
        const nestedWorkspacesListRoute = workspaceNav?.state?.routes?.at(-1);
        expect(nestedWorkspacesListRoute?.name).toBe(SCREENS.WORKSPACES_LIST);
        expect(nestedWorkspacesListRoute?.params).toMatchObject({backTo: ROUTES.NEW_ROOM});
    });

    it('does not strip non-RHP routes when navigating to a fullscreen screen', () => {
        // Given the initialized navigation with a ReportsSplitNavigator (inside TAB_NAVIGATOR, no RHP)
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
                                            index: 0,
                                            routes: [
                                                {
                                                    name: SCREENS.INBOX,
                                                },
                                            ],
                                        },
                                    },
                                    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                    {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                ],
                            },
                        },
                    ],
                }}
            />,
        );

        const rootStateBefore = navigationRef.current?.getRootState();
        expect(rootStateBefore?.index).toBe(0);
        const tabStateBefore = rootStateBefore?.routes.at(0)?.state;
        const activeTabBefore = tabStateBefore?.routes.at(tabStateBefore?.index ?? 0);
        expect(activeTabBefore?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

        // When navigating to Workspaces_List without RHP on top
        act(() => {
            Navigation.navigate(ROUTES.WORKSPACES_LIST.getRoute());
        });

        // Then a new TabNavigator should be pushed with WorkspaceNavigator active
        const rootStateAfter = navigationRef.current?.getRootState();
        const lastRootRoute = rootStateAfter?.routes.at(-1);
        expect(lastRootRoute?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);

        const newTabState = lastRootRoute?.state;
        const workspaceNav = newTabState?.routes.at(4);
        expect(workspaceNav?.name).toBe(NAVIGATORS.WORKSPACE_NAVIGATOR);
        const nestedWorkspacesListRoute = workspaceNav?.state?.routes?.at(-1);
        expect(nestedWorkspacesListRoute?.name).toBe(SCREENS.WORKSPACES_LIST);

        // The original TabNavigator should still be in the root stack
        const firstRootRoute = rootStateAfter?.routes.at(0);
        expect(firstRootRoute?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        const originalTabState = firstRootRoute?.state;
        const reportsSplit = originalTabState?.routes.at(1);
        expect(reportsSplit?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    });
});
