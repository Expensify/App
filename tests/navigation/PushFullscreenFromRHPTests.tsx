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
jest.mock('@src/components/Navigation/TopLevelNavigationTabBar');

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

describe('Push fullscreen from RHP', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('strips the RHP when navigating to a fullscreen screen', () => {
        // Given the initialized navigation with a ReportsSplitNavigator and RightModalNavigator on top
        render(
            <TestNavigationContainer
                initialState={{
                    index: 1,
                    routes: [
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

        // Then the RHP should be stripped and WorkspaceNavigator (containing Workspaces_List) should be pushed
        const rootStateAfter = navigationRef.current?.getRootState();
        const lastRoute = rootStateAfter?.routes.at(-1);

        // WorkspaceNavigator (with Workspaces_List as its initial screen) should be on top
        expect(lastRoute?.name).toBe(NAVIGATORS.WORKSPACE_NAVIGATOR);
        const nestedWorkspacesListRoute = lastRoute?.state?.routes?.at(-1);
        expect(nestedWorkspacesListRoute?.name).toBe(SCREENS.WORKSPACES_LIST);

        // RHP should NOT be in the stack
        const hasRHP = rootStateAfter?.routes.some((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
        expect(hasRHP).toBe(false);
    });

    it('preserves the backTo param when navigating from RHP to fullscreen', () => {
        // Given the initialized navigation with a ReportsSplitNavigator and RightModalNavigator on top
        render(
            <TestNavigationContainer
                initialState={{
                    index: 1,
                    routes: [
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

        // Then WorkspaceNavigator should be on top and Workspaces_List should have the backTo param
        const rootStateAfter = navigationRef.current?.getRootState();
        const lastRoute = rootStateAfter?.routes.at(-1);
        expect(lastRoute?.name).toBe(NAVIGATORS.WORKSPACE_NAVIGATOR);
        const nestedWorkspacesListRoute = lastRoute?.state?.routes?.at(-1);
        expect(nestedWorkspacesListRoute?.name).toBe(SCREENS.WORKSPACES_LIST);
        expect(nestedWorkspacesListRoute?.params).toMatchObject({backTo: ROUTES.NEW_ROOM});
    });

    it('does not strip non-RHP routes when navigating to a fullscreen screen', () => {
        // Given the initialized navigation with a ReportsSplitNavigator (no RHP)
        render(
            <TestNavigationContainer
                initialState={{
                    index: 0,
                    routes: [
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
                    ],
                }}
            />,
        );

        const rootStateBefore = navigationRef.current?.getRootState();
        expect(rootStateBefore?.index).toBe(0);
        expect(rootStateBefore?.routes.at(-1)?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

        // When navigating to Workspaces_List without RHP on top
        act(() => {
            Navigation.navigate(ROUTES.WORKSPACES_LIST.getRoute());
        });

        // Then WorkspaceNavigator (containing Workspaces_List) should be pushed on top without removing the ReportsSplitNavigator
        const rootStateAfter = navigationRef.current?.getRootState();
        expect(rootStateAfter?.routes.at(-1)?.name).toBe(NAVIGATORS.WORKSPACE_NAVIGATOR);
        const nestedWorkspacesListRoute = rootStateAfter?.routes.at(-1)?.state?.routes?.at(-1);
        expect(nestedWorkspacesListRoute?.name).toBe(SCREENS.WORKSPACES_LIST);
        expect(rootStateAfter?.routes.at(0)?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        expect(rootStateAfter?.routes).toHaveLength(2);
    });
});
