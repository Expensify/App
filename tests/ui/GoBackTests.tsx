import type {InitialState} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createResponsiveStackNavigator from '@libs/Navigation/AppNavigator/createResponsiveStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, ReportsSplitNavigatorParamList, SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const RootStack = createResponsiveStackNavigator<AuthScreensParamList>();
const ReportsSplit = createSplitNavigator<ReportsSplitNavigatorParamList>();
const SettingsSplit = createSplitNavigator<SettingsSplitNavigatorParamList>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/home/sidebar/BottomTabAvatar');

const DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: false,
};

const INITIAL_SETTINGS_STATE: InitialState = {
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
};

const INITIAL_REPORTS_STATE: InitialState = {
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
};

const PARENT_ROUTE = {key: 'parentRouteKey', name: 'ParentNavigator'};

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

function SettingsSplitNavigator() {
    return (
        <SettingsSplit.Navigator
            sidebarScreen={SCREENS.SETTINGS.ROOT}
            defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
            parentRoute={PARENT_ROUTE}
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
            parentRoute={PARENT_ROUTE}
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
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

describe('Go back on the narrow layout', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('Should pop the last page in the navigation state', () => {
        // Given the initialized navigation on the narrow layout with the settings split navigator
        render(<TestNavigationContainer initialState={INITIAL_SETTINGS_STATE} />);

        const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitBeforeGoBack?.state?.index).toBe(2);
        expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PREFERENCES.ROOT);

        // When go back without specifying fallbackRoute
        act(() => {
            Navigation.goBack();
        });

        // Then pop the last screen from the navigation state
        const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitAfterGoBack?.state?.index).toBe(1);
        expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);
    });

    it('Should go back to the page passed to goBack as a fallbackRoute', () => {
        // Given the initialized navigation on the narrow layout with the settings split navigator
        render(<TestNavigationContainer initialState={INITIAL_SETTINGS_STATE} />);

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
        render(<TestNavigationContainer initialState={INITIAL_SETTINGS_STATE} />);

        const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitBeforeGoBack?.state?.index).toBe(2);
        expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PREFERENCES.ROOT);

        // When go back to the fallbackRoute that does not exist in the navigation state
        act(() => {
            Navigation.goBack(ROUTES.SETTINGS_ABOUT);
        });

        // Then replace the current page with the page passed as a fallbackRoute
        const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitAfterGoBack?.state?.index).toBe(2);
        expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ABOUT);
    });

    it('Should go back to the page with matched route params', () => {
        // Given the initialized navigation on the narrow layout with the reports split navigator
        render(<TestNavigationContainer initialState={INITIAL_REPORTS_STATE} />);

        const reportsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(reportsSplitBeforeGoBack?.state?.index).toBe(2);
        expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
        expect(reportsSplitBeforeGoBack?.state?.routes.at(-1)?.params).toMatchObject({reportID: '2'});

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
        render(<TestNavigationContainer initialState={INITIAL_REPORTS_STATE} />);

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
});
