import type {InitialState} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createResponsiveStackNavigator from '@libs/Navigation/AppNavigator/createResponsiveStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, ReportsSplitNavigatorParamList, SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const RootStack = createResponsiveStackNavigator<AuthScreensParamList>();
const ReportsSplit = createSplitNavigator<ReportsSplitNavigatorParamList>();
const SettingsSplit = createSplitNavigator<SettingsSplitNavigatorParamList>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/home/sidebar/BottomTabAvatar');

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

function SettingsSplitNavigator() {
    return (
        <SettingsSplit.Navigator
            sidebarScreen={SCREENS.SETTINGS.ROOT}
            defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.ROOT}
                getComponent={() => jest.fn()}
            />
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.PROFILE.ROOT}
                getComponent={() => jest.fn()}
            />
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.PREFERENCES.ROOT}
                getComponent={() => jest.fn()}
            />
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.ABOUT}
                getComponent={() => jest.fn()}
            />
        </SettingsSplit.Navigator>
    );
}

function ReportsSplitNavigator() {
    return (
        <ReportsSplit.Navigator
            sidebarScreen={SCREENS.HOME}
            defaultCentralScreen={SCREENS.REPORT}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <ReportsSplit.Screen
                name={SCREENS.HOME}
                getComponent={() => jest.fn()}
            />
            <ReportsSplit.Screen
                name={SCREENS.REPORT}
                getComponent={() => jest.fn()}
            />
        </ReportsSplit.Navigator>
    );
}

type TestNavigationContainerProps = {initialState: InitialState};

function TestNavigationContainer({initialState}: TestNavigationContainerProps) {
    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
        >
            <RootStack.Navigator>
                <RootStack.Screen
                    name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                    component={ReportsSplitNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                    component={SettingsSplitNavigator}
                />
                <RootStack.Screen
                    name={SCREENS.SEARCH.CENTRAL_PANE}
                    getComponent={() => jest.fn()}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

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
                                            name: SCREENS.HOME,
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
                                            name: SCREENS.HOME,
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
                                name: SCREENS.SEARCH.CENTRAL_PANE,
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeGoBack = navigationRef.current?.getRootState();
            expect(rootStateBeforeGoBack?.index).toBe(2);
            expect(rootStateBeforeGoBack?.routes.at(-1)?.name).toBe(SCREENS.SEARCH.CENTRAL_PANE);

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
                                            name: SCREENS.HOME,
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
                                            name: SCREENS.HOME,
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
                                            name: SCREENS.HOME,
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
