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
                        ],
                    }}
                />,
            );

            const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
            expect(settingsSplitBeforeGoBack?.state?.index).toBe(0);
            expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);

            // When navigate to the page from the same split navigator
            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute());
            });

            // Then push a new page to the current split navigator
            const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
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

            // When navigate to the page from the same split navigator using replace action
            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_ABOUT, {forceReplace: true});
            });

            // Then replace the current page with the page passed to the navigate function
            const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
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
                        ],
                    }}
                />,
            );

            const rootStateBeforeNavigate = navigationRef.current?.getRootState();
            const lastSplitBeforeNavigate = rootStateBeforeNavigate?.routes.at(-1);
            expect(rootStateBeforeNavigate?.index).toBe(0);
            expect(lastSplitBeforeNavigate?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
            expect(lastSplitBeforeNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);

            // When navigate to the page from the different split navigator
            act(() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute('1'));
            });

            // Then push a new split navigator to the navigation state
            const rootStateAfterNavigate = navigationRef.current?.getRootState();
            const lastSplitAfterNavigate = rootStateAfterNavigate?.routes.at(-1);
            expect(rootStateAfterNavigate?.index).toBe(1);
            expect(lastSplitAfterNavigate?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        });

        it('to the sub-route from a different split navigator', () => {
            // Given the initialized navigation on the narrow layout with the reports split navigator
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
                                        {
                                            name: SCREENS.REPORT,
                                            params: {reportID: '1'},
                                        },
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeNavigate = navigationRef.current?.getRootState();
            const lastSplitBeforeNavigate = rootStateBeforeNavigate?.routes.at(-1);
            expect(rootStateBeforeNavigate?.index).toBe(0);
            expect(lastSplitBeforeNavigate?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            expect(lastSplitBeforeNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);

            // When navigate to the page from the different split navigator
            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
            });

            // Then push a new split navigator to the navigation state
            const rootStateAfterNavigate = navigationRef.current?.getRootState();
            expect(rootStateAfterNavigate?.index).toBe(2);

            const middleSplitAfterNavigate = rootStateAfterNavigate?.routes.at(-2);
            expect(middleSplitAfterNavigate?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
            expect(middleSplitAfterNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.SUBSCRIPTION.ROOT);

            const lastSplitAfterNavigate = rootStateAfterNavigate?.routes.at(-1);
            expect(lastSplitAfterNavigate?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
            expect(lastSplitAfterNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.RIGHT_MODAL.SETTINGS);
        });

        it('to the sub-route from a same split navigator', () => {
            // Given the initialized navigation on the narrow layout with the settings split navigator
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
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
                        ],
                    }}
                />,
            );

            const rootStateBeforeNavigate = navigationRef.current?.getRootState();
            const lastSplitBeforeNavigate = rootStateBeforeNavigate?.routes.at(-1);
            expect(rootStateBeforeNavigate?.index).toBe(0);
            expect(lastSplitBeforeNavigate?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
            expect(lastSplitBeforeNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);

            // When navigate to the page from the same split navigator
            act(() => {
                Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
            });

            // Then push a new split navigator to the navigation state
            const rootStateAfterNavigate = navigationRef.current?.getRootState();
            expect(rootStateAfterNavigate?.index).toBe(2);

            const middleSplitAfterNavigate = rootStateAfterNavigate?.routes.at(-2);
            expect(middleSplitAfterNavigate?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
            expect(middleSplitAfterNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.SUBSCRIPTION.ROOT);

            const lastSplitAfterNavigate = rootStateAfterNavigate?.routes.at(-1);
            expect(lastSplitAfterNavigate?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
            expect(lastSplitAfterNavigate?.state?.routes.at(-1)?.name).toBe(SCREENS.RIGHT_MODAL.SETTINGS);
        });
    });
});
