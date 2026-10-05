import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import HomePage from '@pages/home/HomePage';
import InsightsPage from '@pages/Insights/InsightsPage';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import React from 'react';

import type {NativeTabName} from './NativeTabNavigator/NATIVE_TAB_GLYPHS';
import type {NativeTabLayoutProps} from './NativeTabNavigator/NativeTabLayout';

import NativeTabLayout from './NativeTabNavigator/NativeTabLayout';
import tabScreenListeners from './NativeTabNavigator/tabScreenListeners';
import useNativeTabBarOptions from './NativeTabNavigator/useNativeTabBarOptions';
import useNativeTabNavigator from './NativeTabNavigator/useNativeTabNavigator';
import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

/**
 * Tab Navigator backed by the platform's own tab bar: UITabBar with the liquid glass material on iOS 26, and
 * Material's BottomNavigationView on Android. Wide layouts keep the JS side bar, since neither native bar can be
 * moved to the side of the screen.
 */
const Tab = createNativeBottomTabNavigator<TabNavigatorParamList>();

const HIDDEN_TAB_OPTIONS = {tabBarItemHidden: true};

const renderNativeTabLayout = (props: NativeTabLayoutProps) => <NativeTabLayout {...props} />;

function TabNavigator() {
    const {shouldShowNativeTabBar, dotColors, tabLabels, tabWithoutBarItem, tabRouterOverride} = useNativeTabNavigator();
    const {screenOptions, getTabOptions} = useNativeTabBarOptions({shouldShowNativeTabBar, dotColors, tabLabels});
    // A tab with no bar item draws no icon.
    const getOptions = (name: NativeTabName) => (name === tabWithoutBarItem ? HIDDEN_TAB_OPTIONS : getTabOptions(name));

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            layout={renderNativeTabLayout}
            screenLayout={bottomTabScreenLayoutWrapper}
            screenOptions={screenOptions}
            UNSTABLE_router={tabRouterOverride}
            screenListeners={tabScreenListeners}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePage}
                options={getOptions(SCREENS.HOME)}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={getOptions(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                options={getOptions(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)}
            />
            <Tab.Screen
                name={SCREENS.INSIGHTS}
                component={InsightsPage}
                // The Insights tab button opens the Spend dashboard, so a tap on the native tab lands on it too.
                initialParams={{dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND}}
                options={getOptions(SCREENS.INSIGHTS)}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={getOptions(NAVIGATORS.WORKSPACE_NAVIGATOR)}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={getOptions(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR)}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
