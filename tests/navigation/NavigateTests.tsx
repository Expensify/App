import type {InitialState} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, ReportsSplitNavigatorParamList, SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const RootStack = createRootStackNavigator<AuthScreensParamList>();
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
                    name={SCREENS.SEARCH.ROOT}
                    getComponent={() => jest.fn()}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

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
                Navigation.navigate(ROUTES.SETTINGS_PROFILE);
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
                Navigation.navigate(ROUTES.SETTINGS_ABOUT, CONST.NAVIGATION.ACTION_TYPE.REPLACE);
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

        it('to the report split from the search page passing the active workspace id', () => {
            // Given the initialized navigation on the narrow layout with the search page with the active workspace id
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: SCREENS.SEARCH.ROOT,
                                params: {
                                    q: 'type:expense status:all sortBy:date sortOrder:desc policyID:1',
                                },
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeNavigate = navigationRef.current?.getRootState();
            const lastSplitBeforeNavigate = rootStateBeforeNavigate?.routes.at(-1);
            expect(rootStateBeforeNavigate?.index).toBe(0);
            expect(lastSplitBeforeNavigate?.name).toBe(SCREENS.SEARCH.ROOT);

            // When navigate to the Home page when the active workspace is set
            act(() => {
                Navigation.navigate(ROUTES.HOME);
            });

            // Then push a new report split navigator with policyID in params
            const rootStateAfterNavigate = navigationRef.current?.getRootState();
            const lastSplitAfterNavigate = rootStateAfterNavigate?.routes.at(-1);
            expect(rootStateAfterNavigate?.index).toBe(1);
            expect(lastSplitAfterNavigate?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            expect(lastSplitAfterNavigate?.params).toMatchObject({policyID: '1'});
        });
    });
});
