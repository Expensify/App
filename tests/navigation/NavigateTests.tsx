import {act, render} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import SidePanelActions from '@libs/actions/SidePanel';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import TestNavigationContainer from '../utils/TestNavigationContainer';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

describe('Navigate', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    describe('on the narrow layout', () => {
        it('to the page within the same navigator', () => {
            // Given the initialized navigation on the narrow layout with the settings split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 3,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {
                                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 0,
                                                routes: [
                                                    {
                                                        name: SCREENS.SETTINGS.ROOT,
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
            const settingsSplitBeforeGoBack = tabState?.routes.at(3);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(0);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);

            // When navigate to the page from the same split navigator
            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute());
            });

            // Then push a new page to the current split navigator
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterGoBack = tabStateAfter?.routes.at(3);
            expect(settingsSplitAfterGoBack?.state?.index).toBe(1);
            expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);
        });

        it('to the page within the same navigator using replace action', () => {
            // Given the initialized navigation on the narrow layout with the settings split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 3,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
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
            const settingsSplitBeforeGoBack = tabState?.routes.at(3);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(1);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);

            // When navigate to the page from the same split navigator using replace action
            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_ABOUT, {forceReplace: true});
            });

            // Then replace the current page with the page passed to the navigate function
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterGoBack = tabStateAfter?.routes.at(3);
            expect(settingsSplitAfterGoBack?.state?.index).toBe(1);
            expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ABOUT);
        });

        it('to the page from the different split navigator', () => {
            // Given the initialized navigation on the narrow layout with the settings split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 3,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {
                                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 0,
                                                routes: [
                                                    {
                                                        name: SCREENS.SETTINGS.ROOT,
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

            const rootStateBeforeNavigate = navigationRef.current?.getRootState();
            const tabStateBeforeNavigate = rootStateBeforeNavigate?.routes.at(0)?.state;
            const activeTabBeforeNavigate = tabStateBeforeNavigate?.routes.at(tabStateBeforeNavigate?.index ?? 0);
            expect(rootStateBeforeNavigate?.index).toBe(0);
            expect(activeTabBeforeNavigate?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
            expect(activeTabBeforeNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);

            // When navigate to the page from the different split navigator
            act(() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute('1'));
            });

            // Then a new TAB_NAVIGATOR is pushed on top with the reports split navigator active,
            // so swipe-back reveals the original tab (the settings split navigator).
            const rootStateAfterNavigate = navigationRef.current?.getRootState();
            const pushedTabState = rootStateAfterNavigate?.routes.at(-1)?.state;
            const activeTabAfterNavigate = pushedTabState?.routes.at(pushedTabState?.index ?? 0);
            expect(rootStateAfterNavigate?.routes.at(-1)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
            expect(activeTabAfterNavigate?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        });

        it('to the sub-route from a different split navigator', () => {
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
                                                index: 0,
                                                routes: [
                                                    {
                                                        name: SCREENS.INBOX,
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '1'},
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

            const rootStateBeforeNavigate = navigationRef.current?.getRootState();
            const tabStateBeforeNavigate = rootStateBeforeNavigate?.routes.at(0)?.state;
            const activeTabBeforeNavigate = tabStateBeforeNavigate?.routes.at(tabStateBeforeNavigate?.index ?? 0);
            expect(rootStateBeforeNavigate?.index).toBe(0);
            expect(activeTabBeforeNavigate?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            expect(activeTabBeforeNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);

            // When navigate to the page from the different split navigator
            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
            });

            // Then push the RHP at root level
            const rootStateAfterNavigate = navigationRef.current?.getRootState();

            const lastRootRoute = rootStateAfterNavigate?.routes.at(-1);
            expect(lastRootRoute?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
            expect(lastRootRoute?.state?.routes.at(-1)?.name).toBe(SCREENS.RIGHT_MODAL.SETTINGS);
        });

        it('to the sub-route from a same split navigator', () => {
            // Given the initialized navigation on the narrow layout with the settings split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {
                                    index: 3,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                        {
                                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 0,
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

            const rootStateBeforeNavigate = navigationRef.current?.getRootState();
            const tabStateBeforeNavigate = rootStateBeforeNavigate?.routes.at(0)?.state;
            const activeTabBeforeNavigate = tabStateBeforeNavigate?.routes.at(tabStateBeforeNavigate?.index ?? 0);
            expect(rootStateBeforeNavigate?.index).toBe(0);
            expect(activeTabBeforeNavigate?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
            expect(activeTabBeforeNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);

            // When navigate to the page from the same split navigator
            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
            });

            // Then push the RHP at root level
            const rootStateAfterNavigate = navigationRef.current?.getRootState();

            const lastRootRoute = rootStateAfterNavigate?.routes.at(-1);
            expect(lastRootRoute?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
            expect(lastRootRoute?.state?.routes.at(-1)?.name).toBe(SCREENS.RIGHT_MODAL.SETTINGS);
        });

        it.each([ROUTES.REPORT_ADD_ATTACHMENT.getRoute('1'), ROUTES.REPORT_ATTACHMENTS.getRoute()])(
            'does not close the side panel when navigating to attachment routes (%s)',
            async (route) => {
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
                                                    index: 1,
                                                    routes: [
                                                        {
                                                            name: SCREENS.INBOX,
                                                        },
                                                        {
                                                            name: SCREENS.REPORT,
                                                            params: {reportID: '1'},
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

                const closeSidePanelSpy = jest.spyOn(SidePanelActions, 'closeSidePanel');

                // Open side panel on narrow screen
                act(() => {
                    SidePanelActions.openSidePanel(true);
                });
                await waitForBatchedUpdates();

                // When navigate to an attachment route
                act(() => {
                    Navigation.navigate(route);
                });

                // Then side panel should remain open
                expect(closeSidePanelSpy).not.toHaveBeenCalled();
            },
        );

        it('closes the side panel when navigating to workspaces list', async () => {
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
                                                index: 1,
                                                routes: [
                                                    {
                                                        name: SCREENS.INBOX,
                                                    },
                                                    {
                                                        name: SCREENS.REPORT,
                                                        params: {reportID: '1'},
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

            const closeSidePanelSpy = jest.spyOn(SidePanelActions, 'closeSidePanel');

            // Open side panel on narrow screen
            act(() => {
                SidePanelActions.openSidePanel(true);
            });
            await waitForBatchedUpdates();

            // When navigate to a non-attachment route
            act(() => {
                Navigation.navigate(ROUTES.WORKSPACES_LIST.getRoute());
            });

            // Then side panel should close on narrow screen
            expect(closeSidePanelSpy).toHaveBeenCalledWith(true);
            expect(closeSidePanelSpy).toHaveBeenCalledTimes(1);
        });
    });
});
