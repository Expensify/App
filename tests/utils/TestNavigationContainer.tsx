import type {InitialState} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, ReportsSplitNavigatorParamList, SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const RootStack = createRootStackNavigator<AuthScreensParamList>();
const ReportsSplit = createSplitNavigator<ReportsSplitNavigatorParamList>();
const SettingsSplit = createSplitNavigator<SettingsSplitNavigatorParamList>();

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
                getComponent={() => jest.fn()}
            />
            <ReportsSplit.Screen
                name={SCREENS.REPORT}
                getComponent={() => jest.fn()}
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
                    name={SCREENS.SEARCH.ROOT}
                    getComponent={() => jest.fn()}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
export default TestNavigationContainer;
