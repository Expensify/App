import {act, render} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);
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

            // When go back without specifying fallbackRoute
            act(() => {
                Navigation.goBack();
            });

            // Then pop the last screen from the navigation state
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterGoBack = tabStateAfter?.routes.at(3);
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
                                    index: 3,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
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
            const settingsSplitBeforeGoBack = tabState?.routes.at(3);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(2);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PREFERENCES.ROOT);

            // When go back to the fallbackRoute present in the navigation state
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS);
            });

            // Then pop to the fallbackRoute
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterGoBack = tabStateAfter?.routes.at(3);
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

            // When go back to the fallbackRoute that does not exist in the navigation state
            act(() => {
                Navigation.goBack(ROUTES.SETTINGS_ABOUT);
            });

            // Then replace the current page with the page passed as a fallbackRoute
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterGoBack = tabStateAfter?.routes.at(3);
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
                                index: 4,
                                routes: [
                                    {name: SCREENS.HOME},
                                    {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
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
        const initialWorkspaceNavigator = tabState?.routes.at(4);
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
