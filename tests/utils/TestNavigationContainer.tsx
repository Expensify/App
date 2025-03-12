import type {InitialState} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, ReportsSplitNavigatorParamList, SearchFullscreenNavigatorParamList, SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import createPlatformStackNavigator from '@navigation/PlatformStackNavigation/createPlatformStackNavigator';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const RootStack = createRootStackNavigator<AuthScreensParamList>();
const ReportsSplit = createSplitNavigator<ReportsSplitNavigatorParamList>();
const SettingsSplit = createSplitNavigator<SettingsSplitNavigatorParamList>();
const SearchStack = createPlatformStackNavigator<SearchFullscreenNavigatorParamList>();

const getEmptyComponent = () => jest.fn();

type TestNavigationContainerProps = {initialState: InitialState};

function TestReportsSplitNavigator() {
    return (
        <ReportsSplit.Navigator
            sidebarScreen={SCREENS.HOME}
            defaultCentralScreen={SCREENS.REPORT}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <ReportsSplit.Screen
                name={SCREENS.HOME}
                getComponent={getEmptyComponent}
            />
            <ReportsSplit.Screen
                name={SCREENS.REPORT}
                getComponent={getEmptyComponent}
            />
        </ReportsSplit.Navigator>
    );
}

function TestSettingsSplitNavigator() {
    return (
        <SettingsSplit.Navigator
            sidebarScreen={SCREENS.SETTINGS.ROOT}
            defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.ROOT}
                getComponent={getEmptyComponent}
            />
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.PROFILE.ROOT}
                getComponent={getEmptyComponent}
            />
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.PREFERENCES.ROOT}
                getComponent={getEmptyComponent}
            />
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.ABOUT}
                getComponent={getEmptyComponent}
            />
        </SettingsSplit.Navigator>
    );
}

function TestSearchFullscreenNavigator() {
    return (
        <SearchStack.Navigator defaultCentralScreen={SCREENS.SEARCH.ROOT}>
            <SearchStack.Screen
                name={SCREENS.SEARCH.ROOT}
                getComponent={getEmptyComponent()}
            />
            <SearchStack.Screen
                name={SCREENS.SEARCH.MONEY_REQUEST_REPORT}
                getComponent={getEmptyComponent()}
            />
        </SearchStack.Navigator>
    );
}

function TestNavigationContainer({initialState}: TestNavigationContainerProps) {
    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
        >
            <RootStack.Navigator>
                <RootStack.Screen
                    name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                    component={TestReportsSplitNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                    component={TestSettingsSplitNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                    component={TestSearchFullscreenNavigator}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
export default TestNavigationContainer;
