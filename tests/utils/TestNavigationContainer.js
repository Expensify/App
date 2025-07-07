"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var createRootStackNavigator_1 = require("@libs/Navigation/AppNavigator/createRootStackNavigator");
var createSplitNavigator_1 = require("@libs/Navigation/AppNavigator/createSplitNavigator");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var createPlatformStackNavigator_1 = require("@navigation/PlatformStackNavigation/createPlatformStackNavigator");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var RootStack = (0, createRootStackNavigator_1.default)();
var ReportsSplit = (0, createSplitNavigator_1.default)();
var SettingsSplit = (0, createSplitNavigator_1.default)();
var SearchStack = (0, createPlatformStackNavigator_1.default)();
var WorkspaceSplit = (0, createSplitNavigator_1.default)();
var getEmptyComponent = function () { return jest.fn(); };
function TestWorkspaceSplitNavigator() {
    return (<WorkspaceSplit.Navigator sidebarScreen={SCREENS_1.default.WORKSPACE.INITIAL} defaultCentralScreen={SCREENS_1.default.WORKSPACE.PROFILE} parentRoute={CONST_1.default.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}>
            <WorkspaceSplit.Screen name={SCREENS_1.default.WORKSPACE.INITIAL} getComponent={getEmptyComponent}/>
            <WorkspaceSplit.Screen name={SCREENS_1.default.WORKSPACE.PROFILE} getComponent={getEmptyComponent}/>
            <WorkspaceSplit.Screen name={SCREENS_1.default.WORKSPACE.MEMBERS} getComponent={getEmptyComponent}/>
            <WorkspaceSplit.Screen name={SCREENS_1.default.WORKSPACE.CATEGORIES} getComponent={getEmptyComponent}/>
            <WorkspaceSplit.Screen name={SCREENS_1.default.WORKSPACE.PER_DIEM} getComponent={getEmptyComponent}/>
        </WorkspaceSplit.Navigator>);
}
function TestReportsSplitNavigator() {
    return (<ReportsSplit.Navigator sidebarScreen={SCREENS_1.default.HOME} defaultCentralScreen={SCREENS_1.default.REPORT} parentRoute={CONST_1.default.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}>
            <ReportsSplit.Screen name={SCREENS_1.default.HOME} getComponent={getEmptyComponent}/>
            <ReportsSplit.Screen name={SCREENS_1.default.REPORT} getComponent={getEmptyComponent}/>
        </ReportsSplit.Navigator>);
}
function TestSettingsSplitNavigator() {
    return (<SettingsSplit.Navigator sidebarScreen={SCREENS_1.default.SETTINGS.ROOT} defaultCentralScreen={SCREENS_1.default.SETTINGS.PROFILE.ROOT} parentRoute={CONST_1.default.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}>
            <SettingsSplit.Screen name={SCREENS_1.default.SETTINGS.ROOT} getComponent={getEmptyComponent}/>
            <SettingsSplit.Screen name={SCREENS_1.default.SETTINGS.PROFILE.ROOT} getComponent={getEmptyComponent}/>
            <SettingsSplit.Screen name={SCREENS_1.default.SETTINGS.PREFERENCES.ROOT} getComponent={getEmptyComponent}/>
            <SettingsSplit.Screen name={SCREENS_1.default.SETTINGS.ABOUT} getComponent={getEmptyComponent}/>
        </SettingsSplit.Navigator>);
}
function TestSearchFullscreenNavigator() {
    return (<SearchStack.Navigator defaultCentralScreen={SCREENS_1.default.SEARCH.ROOT}>
            <SearchStack.Screen name={SCREENS_1.default.SEARCH.ROOT} getComponent={getEmptyComponent()}/>
            <SearchStack.Screen name={SCREENS_1.default.SEARCH.MONEY_REQUEST_REPORT} getComponent={getEmptyComponent()}/>
        </SearchStack.Navigator>);
}
function TestNavigationContainer(_a) {
    var initialState = _a.initialState;
    return (<native_1.NavigationContainer ref={navigationRef_1.default} initialState={initialState}>
            <RootStack.Navigator>
                <RootStack.Screen name={NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR} component={TestReportsSplitNavigator}/>
                <RootStack.Screen name={NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR} component={TestSettingsSplitNavigator}/>
                <RootStack.Screen name={NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR} component={TestWorkspaceSplitNavigator}/>
                <RootStack.Screen name={NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR} component={TestSearchFullscreenNavigator}/>
            </RootStack.Navigator>
        </native_1.NavigationContainer>);
}
exports.default = TestNavigationContainer;
