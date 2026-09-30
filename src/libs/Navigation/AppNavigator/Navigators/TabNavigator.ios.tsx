import useTheme from '@hooks/useTheme';

import {nativeBottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import HomePage from '@pages/home/HomePage';
import InsightsPage from '@pages/Insights/InsightsPage';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import React from 'react';

import type {NativeTabLayoutProps} from './NativeTabNavigator/NativeTabLayout';

import NativeTabLayout from './NativeTabNavigator/NativeTabLayout';
import useIOSTabIcons from './NativeTabNavigator/useIOSTabIcons';
import useNativeTabNavigator from './NativeTabNavigator/useNativeTabNavigator';
import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

/**
 * Tab Navigator backed by UITabBar, which brings the liquid glass material with it on iOS 26. Wide layouts keep
 * the JS side bar, since UITabBar cannot be moved to the side of the screen.
 */
const Tab = createNativeBottomTabNavigator<TabNavigatorParamList>();

const getFloatingButtonsBottom = () => variables.iosNativeTabBarFloatingButtonsBottom;

const renderNativeTabLayout = (props: Omit<NativeTabLayoutProps, 'getFloatingButtonsBottom'>) => (
    <NativeTabLayout
        {...props}
        getFloatingButtonsBottom={getFloatingButtonsBottom}
    />
);

function TabNavigator() {
    const theme = useTheme();
    const {shouldShowNativeTabBar, inboxDotColor, workspacesDotColor, accountDotColor, isInsightsTabVisible, tabRouterOverride, tabScreenListeners} = useNativeTabNavigator();
    const {getTabBarIcon, accountAvatarIcon, areTabIconsReady} = useIOSTabIcons({
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: inboxDotColor,
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: workspacesDotColor,
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: accountDotColor,
    });

    const screenOptions = {
        headerShown: false,
        tabBarActiveTintColor: theme.iconMenu,
        tabBarInactiveTintColor: theme.icon,
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        // The background only lands on iOS 18 and below; iOS 26 keeps its own glass material.
        tabBarStyle: {display: shouldShowNativeTabBar && areTabIconsReady ? ('flex' as const) : ('none' as const), backgroundColor: theme.appBG},
        tabBarControllerMode: 'tabBar' as const,
        // The bar stays put while the content scrolls, instead of collapsing the way iOS 26 does by default.
        tabBarMinimizeBehavior: 'none' as const,
    };

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            layout={renderNativeTabLayout}
            screenLayout={nativeBottomTabScreenLayoutWrapper}
            screenOptions={screenOptions}
            UNSTABLE_router={tabRouterOverride}
            screenListeners={tabScreenListeners}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePage}
                options={{tabBarLabel: '', tabBarIcon: getTabBarIcon(SCREENS.HOME)}}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: getTabBarIcon(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR),
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                options={{tabBarLabel: '', tabBarIcon: getTabBarIcon(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)}}
            />
            <Tab.Screen
                name={SCREENS.INSIGHTS}
                component={InsightsPage}
                // The Insights tab button opens the Spend dashboard, so a tap on the native tab lands on it too.
                initialParams={{dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND}}
                options={{tabBarLabel: '', tabBarIcon: getTabBarIcon(SCREENS.INSIGHTS), tabBarItemHidden: !isInsightsTabVisible}}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: getTabBarIcon(NAVIGATORS.WORKSPACE_NAVIGATOR),
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarItemHidden: isInsightsTabVisible,
                    tabBarIcon: accountAvatarIcon ?? getTabBarIcon(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR),
                }}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
