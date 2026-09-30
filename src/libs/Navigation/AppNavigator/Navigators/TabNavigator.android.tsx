import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {nativeBottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import HomePage from '@pages/home/HomePage';

import variables from '@styles/variables';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import React from 'react';

import type {NativeTabLayoutProps} from './NativeTabNavigator/NativeTabLayout';

import NATIVE_TAB_ICONS from './NativeTabNavigator/NATIVE_TAB_ICONS';
import NativeTabLayout from './NativeTabNavigator/NativeTabLayout';
import useNativeTabNavigator from './NativeTabNavigator/useNativeTabNavigator';
import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

/**
 * Tab Navigator backed by Material's BottomNavigationView, with the Material 3 active indicator pill, ripples, and
 * Material badges for the status dots. Wide layouts keep the JS side bar, since the native bar cannot be moved to
 * the side of the screen.
 */
const Tab = createNativeBottomTabNavigator<TabNavigatorParamList>();

/** An empty badge value makes Material draw its small dot badge instead of a number. */
const STATUS_DOT_BADGE = '';

/** Shows a status as a Material dot badge in its own color, or no badge at all. */
function getStatusBadgeOptions(dotColor: string | undefined): Pick<NativeBottomTabNavigationOptions, 'tabBarBadge' | 'tabBarBadgeStyle'> {
    if (!dotColor) {
        return {tabBarBadge: undefined};
    }
    return {tabBarBadge: STATUS_DOT_BADGE, tabBarBadgeStyle: {backgroundColor: dotColor}};
}

/** Material's bar sits above the system gesture inset, so the floating buttons clear both. */
const getFloatingButtonsBottom = (bottomInset: number) => variables.androidNativeTabBarFloatingButtonsBottom + bottomInset;

const renderNativeTabLayout = (props: Omit<NativeTabLayoutProps, 'getFloatingButtonsBottom'>) => (
    <NativeTabLayout
        {...props}
        getFloatingButtonsBottom={getFloatingButtonsBottom}
    />
);

function TabNavigator() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldShowNativeTabBar, inboxDotColor, workspacesDotColor, accountDotColor, tabRouterOverride} = useNativeTabNavigator();

    // Colors and the label face come from the Expensify theme and match the side bar on wide layouts: the
    // selected tab has the menu icon color and a bold label in the regular text color, the others the plain icon
    // color and a supporting text label. The bar takes the raised surface tone with no top border.
    const screenOptions: NativeBottomTabNavigationOptions = {
        headerShown: false,
        tabBarActiveTintColor: theme.iconMenu,
        tabBarInactiveTintColor: theme.icon,
        tabBarActiveLabelColor: theme.text,
        tabBarInactiveLabelColor: theme.textSupporting,
        tabBarLabelStyle: {fontFamily: styles.textSmall.fontFamily, fontSize: styles.textSmall.fontSize},
        tabBarActiveIndicatorColor: theme.androidTabBarActiveIndicatorBG,
        tabBarLabelVisibilityMode: 'labeled',
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        tabBarStyle: {display: shouldShowNativeTabBar ? 'flex' : 'none', backgroundColor: theme.highlightBG},
    };

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            layout={renderNativeTabLayout}
            screenLayout={nativeBottomTabScreenLayoutWrapper}
            screenOptions={screenOptions}
            UNSTABLE_router={tabRouterOverride}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePage}
                options={{tabBarLabel: translate('common.home'), tabBarIcon: NATIVE_TAB_ICONS[SCREENS.HOME]}}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={{
                    tabBarLabel: translate('common.inbox'),
                    tabBarIcon: NATIVE_TAB_ICONS[NAVIGATORS.REPORTS_SPLIT_NAVIGATOR],
                    ...getStatusBadgeOptions(inboxDotColor),
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                options={{tabBarLabel: translate('common.spend'), tabBarIcon: NATIVE_TAB_ICONS[NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]}}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={{
                    tabBarLabel: translate('common.workspacesTabTitle'),
                    tabBarIcon: NATIVE_TAB_ICONS[NAVIGATORS.WORKSPACE_NAVIGATOR],
                    ...getStatusBadgeOptions(workspacesDotColor),
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={{
                    tabBarLabel: translate('initialSettingsPage.account'),
                    tabBarIcon: NATIVE_TAB_ICONS[NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR],
                    ...getStatusBadgeOptions(accountDotColor),
                }}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
