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

jest.mock('@pages/home/sidebar/NavigationTabBarAvatar');
jest.mock('@src/components/Navigation/TopLevelNavigationTabBar');

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
                        ],
                    }}
                />,
            );

            const settingsSplitBeforePopToSidebar = navigationRef.current?.getRootState().routes.at(-1);
            expect(settingsSplitBeforePopToSidebar?.state?.index).toBe(3);

            // When we pop with LHN on top of stack
            act(() => {
                Navigation.popToSidebar();
            });

            // Then all screens should be popped of the stack and only settings root left
            const settingsSplitAfterPopToSidebar = navigationRef.current?.getRootState().routes.at(-1);
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

            const lastSplitBeforeNavigate = navigationRef.current?.getRootState().routes.at(-1);
            expect(lastSplitBeforeNavigate?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_ABOUT);
            });

            const lastSplitAfterNavigate = navigationRef.current?.getRootState().routes.at(-1);
            expect(lastSplitAfterNavigate?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
            expect(lastSplitAfterNavigate?.state?.index).toBe(0);
            expect(lastSplitAfterNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ABOUT);

            // When we pop to sidebar without LHN on top of stack
            act(() => {
                Navigation.popToSidebar();
            });

            // Then the top screen should be replaced with LHN
            const lastSplitAfterPopToSidebar = navigationRef.current?.getRootState().routes.at(-1);
            expect(lastSplitAfterPopToSidebar?.state?.index).toBe(0);
            expect(lastSplitAfterPopToSidebar?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);
        });
    });
});
