import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import type {InitialState, NavigatorScreenParams} from '@react-navigation/native';
import React from 'react';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import type {
    AuthScreensParamList,
    ReportsSplitNavigatorParamList,
    RightModalNavigatorParamList,
    SearchFullscreenNavigatorParamList,
    SettingsSplitNavigatorParamList,
    TabNavigatorParamList,
    WorkspaceNavigatorParamList,
    WorkspaceSplitNavigatorParamList,
} from '@libs/Navigation/types';
import createPlatformStackNavigator from '@navigation/PlatformStackNavigation/createPlatformStackNavigator';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/** Test-specific param list with split navigators at root level for simplified test setup */
type TestRootParamList = AuthScreensParamList & {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NavigatorScreenParams<ReportsSplitNavigatorParamList>;
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NavigatorScreenParams<SettingsSplitNavigatorParamList>;
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NavigatorScreenParams<SearchFullscreenNavigatorParamList>;
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: NavigatorScreenParams<WorkspaceSplitNavigatorParamList>;
    [NAVIGATORS.WORKSPACE_NAVIGATOR]: NavigatorScreenParams<WorkspaceNavigatorParamList>;
};

const RootStack = createRootStackNavigator<TestRootParamList>();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
const ReportsSplit = createSplitNavigator<ReportsSplitNavigatorParamList>();
const SettingsSplit = createSplitNavigator<SettingsSplitNavigatorParamList>();
const SearchStack = createPlatformStackNavigator<SearchFullscreenNavigatorParamList>();
const WorkspaceSplit = createSplitNavigator<WorkspaceSplitNavigatorParamList>();
const WorkspaceStack = createPlatformStackNavigator<WorkspaceNavigatorParamList>();
const RightModalNavigatorStack = createSplitNavigator<RightModalNavigatorParamList>();

const getEmptyComponent = () => jest.fn();

type TestNavigationContainerProps = {initialState: InitialState};

function TestWorkspaceSplitNavigator() {
    return (
        <WorkspaceSplit.Navigator
            sidebarScreen={SCREENS.WORKSPACE.INITIAL}
            defaultCentralScreen={SCREENS.WORKSPACE.PROFILE}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <WorkspaceSplit.Screen
                name={SCREENS.WORKSPACE.INITIAL}
                getComponent={getEmptyComponent}
            />
            <WorkspaceSplit.Screen
                name={SCREENS.WORKSPACE.PROFILE}
                getComponent={getEmptyComponent}
            />
            <WorkspaceSplit.Screen
                name={SCREENS.WORKSPACE.MEMBERS}
                getComponent={getEmptyComponent}
            />
            <WorkspaceSplit.Screen
                name={SCREENS.WORKSPACE.CATEGORIES}
                getComponent={getEmptyComponent}
            />
            <WorkspaceSplit.Screen
                name={SCREENS.WORKSPACE.PER_DIEM}
                getComponent={getEmptyComponent}
            />
            <WorkspaceSplit.Screen
                name={SCREENS.WORKSPACE.RECEIPT_PARTNERS}
                getComponent={getEmptyComponent}
            />
        </WorkspaceSplit.Navigator>
    );
}

function TestWorkspaceNavigator() {
    return (
        <WorkspaceStack.Navigator>
            <WorkspaceStack.Screen
                name={SCREENS.WORKSPACES_LIST}
                component={getEmptyComponent()}
            />
            <WorkspaceStack.Screen
                name={NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR}
                component={TestWorkspaceSplitNavigator}
            />
        </WorkspaceStack.Navigator>
    );
}

function TestReportsSplitNavigator() {
    return (
        <ReportsSplit.Navigator
            sidebarScreen={SCREENS.INBOX}
            defaultCentralScreen={SCREENS.REPORT}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <ReportsSplit.Screen
                name={SCREENS.INBOX}
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
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.SUBSCRIPTION.ROOT}
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
        </SearchStack.Navigator>
    );
}

function TestRightModalNavigator() {
    return (
        <RightModalNavigatorStack.Navigator
            defaultCentralScreen={SCREENS.RIGHT_MODAL.SETTINGS}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <RightModalNavigatorStack.Screen
                name={SCREENS.RIGHT_MODAL.SETTINGS}
                getComponent={getEmptyComponent()}
            />
        </RightModalNavigatorStack.Navigator>
    );
}

function TestTabNavigator() {
    return (
        <TabNav.Navigator screenOptions={{headerShown: false}}>
            <TabNav.Screen
                name={SCREENS.HOME}
                component={getEmptyComponent()}
            />
            <TabNav.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={TestReportsSplitNavigator}
            />
            <TabNav.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={TestSearchFullscreenNavigator}
            />
            <TabNav.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={TestSettingsSplitNavigator}
            />
            <TabNav.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={TestWorkspaceNavigator}
            />
        </TabNav.Navigator>
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
                    name={NAVIGATORS.TAB_NAVIGATOR}
                    component={TestTabNavigator}
                />
                <RootStack.Screen
                    name={SCREENS.VALIDATE_LOGIN}
                    component={getEmptyComponent()}
                />
                <RootStack.Screen
                    name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                    component={TestRightModalNavigator}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
export default TestNavigationContainer;
