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
const mockedPolicyID = 'test-policy';
const mockedBackToRoute = '/test';
describe('Go back on the narrow layout', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
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
                        ],
                    }}
                />,
            );

            const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(1);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);

            // When go back without specifying fallbackRoute
            act(() => {
                Navigation.goBack();
            });

            // Then pop the last screen from the navigation state
            const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
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
                        ],
                    }}
                />,
            );

            const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(2);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PREFERENCES.ROOT);

            // When go back to the fallbackRoute present in the navigation state
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS);
            });

            // Then pop to the fallbackRoute
            const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
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
                        ],
                    }}
                />,
            );

            const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(1);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);

            // When go back to the fallbackRoute that does not exist in the navigation state
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS_ABOUT);
            });

            // Then replace the current page with the page passed as a fallbackRoute
            const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
            expect(settingsSplitAfterGoBack?.state?.index).toBe(1);
            expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ABOUT);
        });

        it('Should go back to the page from the previous split navigator', () => {
            // Given the initialized navigation on the narrow layout with reports and settings pages
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 1,
                        routes: [
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
                        ],
                    }}
                />,
            );

            const rootStateBeforeGoBack = navigationRef.current?.getRootState();
            expect(rootStateBeforeGoBack?.index).toBe(1);
            expect(rootStateBeforeGoBack?.routes.at(-1)?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

            // When go back to the page present in the previous split navigator
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS);
            });

            // Then pop the current split navigator
            const rootStateAfterGoBack = navigationRef.current?.getRootState();
            expect(rootStateAfterGoBack?.index).toBe(0);
            expect(rootStateAfterGoBack?.routes.at(-1)?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        });

        it('Should replace the current route with a new split navigator when distance from the fallbackRoute is greater than one split navigator', () => {
            // Given the initialized navigation on the narrow layout
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 2,
                        routes: [
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
                        ],
                    }}
                />,
            );

            const rootStateBeforeGoBack = navigationRef.current?.getRootState();
            expect(rootStateBeforeGoBack?.index).toBe(2);
            expect(rootStateBeforeGoBack?.routes.at(-1)?.name).toBe(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);

            // When go back to the page present in the split navigator that is more than 1 route away
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS);
            });

            // Then replace the current route with a new split navigator including the target page to avoid losing routes from the navigation state
            const rootStateAfterGoBack = navigationRef.current?.getRootState();
            expect(rootStateAfterGoBack?.index).toBe(2);
            expect(rootStateAfterGoBack?.routes.at(-1)?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
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
                        ],
                    }}
                />,
            );

            const reportsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
            expect(reportsSplitBeforeGoBack?.state?.index).toBe(3);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '3'});

            // When go back to the same page with a different route param
            act(() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute('1'));
            });

            // Then pop to the page with matching params
            const reportsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
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
                        ],
                    }}
                />,
            );

            const reportsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
            expect(reportsSplitBeforeGoBack?.state?.index).toBe(2);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '2'});

            // When go back to the same page with different route params that does not exist in the navigation state
            act(() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute('3'));
            });

            // Then replace the current page with the same one with different params
            const reportsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
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
                        ],
                    }}
                />,
            );

            const reportsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
            expect(reportsSplitBeforeGoBack?.state?.index).toBe(3);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
            expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '3'});

            // When go back to the same page with different route params without comparing params
            act(() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute('1'), {compareParams: false});
            });

            // Then do not go back to the page with matching route params, instead replace the current page
            const reportsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
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
        // Given the initialized navigation with workspaces split navigator
        render(
            <TestNavigationContainer
                initialState={{
                    index: 0,
                    routes: [
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
                }}
            />,
        );

        // Then the backTo params should be preserved in the sidebar route
        const initialRootState = navigationRef.current?.getRootState();
        const initialWorkspaceNavigator = initialRootState?.routes.at(0);
        const initialRoutes = initialWorkspaceNavigator?.state?.routes ?? [];
        const initialSidebarRoute = initialRoutes.find((route) => route.name === SCREENS.WORKSPACE.INITIAL);
        expect(initialSidebarRoute?.params).toMatchObject({
            policyID: mockedPolicyID,
            backTo: mockedBackToRoute,
        });
    });
});
