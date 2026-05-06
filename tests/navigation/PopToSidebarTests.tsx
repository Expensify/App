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

describe('Pop to sidebar after resize from wide to narrow layout', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    describe('After opening several screens in the settings tab', () => {
        it('Should pop all visited screens and go back to the settings sidebar screen', () => {
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
                                                index: 3,
                                                routes: [
                                                    {
                                                        name: SCREENS.SETTINGS.ROOT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.ABOUT,
                                                    },
                                                    {
                                                        name: SCREENS.SETTINGS.PREFERENCES.ROOT,
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
            const settingsSplitBeforePopToSidebar = tabState?.routes.at(3);
            expect(settingsSplitBeforePopToSidebar?.state?.index).toBe(3);

            // When we pop with LHN on top of stack
            act(() => {
                Navigation.popToSidebar();
            });

            // Then all screens should be popped of the stack and only settings root left
            const tabStateAfter = navigationRef.current?.getRootState().routes.at(0)?.state;
            const settingsSplitAfterPopToSidebar = tabStateAfter?.routes.at(3);
            expect(settingsSplitAfterPopToSidebar?.state?.index).toBe(0);
            expect(settingsSplitAfterPopToSidebar?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);
        });
    });

    describe('After navigating to the central screen in the settings tab from the chat', () => {
        it('Should replace the route with LHN', () => {
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
            const lastSplitBeforeNavigate = tabState?.routes.at(tabState?.index ?? 0);
            expect(lastSplitBeforeNavigate?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_ABOUT);
            });

            // Cross-tab navigate pushes a new TAB_NAVIGATOR on top (for swipe-back UX),
            // with SETTINGS_SPLIT_NAVIGATOR active and SETTINGS.ABOUT in its nested stack.
            const pushedTabState = navigationRef.current?.getRootState().routes.at(-1)?.state;
            const activeTabAfterNav = pushedTabState?.routes.at(pushedTabState?.index ?? 0);
            expect(activeTabAfterNav?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
            expect(activeTabAfterNav?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ABOUT);

            // When we pop to sidebar without LHN on top of stack
            act(() => {
                Navigation.popToSidebar();
            });

            // Then the top screen should be replaced with LHN
            const tabStateAfterPop = navigationRef.current?.getRootState().routes.at(-1)?.state;
            const activeTabAfterPop = tabStateAfterPop?.routes.at(tabStateAfterPop?.index ?? 0);
            expect(activeTabAfterPop?.state?.index).toBe(0);
            expect(activeTabAfterPop?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);
        });
    });
});
