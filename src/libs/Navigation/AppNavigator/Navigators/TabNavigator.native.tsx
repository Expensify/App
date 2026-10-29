import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {ScreenLayoutProps} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import HomePage from '@pages/home/HomePage';
import InsightsPage from '@pages/Insights/InsightsPage';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import React, {useState} from 'react';

import type {NativeTabName} from './NativeTabNavigator/NATIVE_TAB_GLYPHS';
import type {NativeTabLayoutProps} from './NativeTabNavigator/NativeTabLayout';

import NativeTabLayout from './NativeTabNavigator/NativeTabLayout';
import TabBarShapeProbe from './NativeTabNavigator/TabBarShapeProbe';
import TabBarShapeContext from './NativeTabNavigator/TabBarShapeProbe/TabBarShapeContext';
import TabHostHorizontalSafeArea from './NativeTabNavigator/TabHostHorizontalSafeArea';
import TabScreenHorizontalSafeArea from './NativeTabNavigator/TabScreenHorizontalSafeArea';
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
    const {shouldShowNativeTabBar, isAccountAvatarShown, dotColors, tabLabels, tabWithoutBarItem, tabRouterOverride, isTabSelectionEnabled} = useNativeTabNavigator();
    const {left: windowLeftInset, right: windowRightInset} = useSafeAreaInsets();
    // A guess until TabBarShapeProbe measures the bar: a column sits in a side inset of its own, while a notched phone in
    // landscape has the same inset on both sides and keeps its bar along the bottom.
    const [isTabBarVertical, setIsTabBarVertical] = useState(() => windowLeftInset !== windowRightInset);
    const {screenOptions, getTabOptions} = useNativeTabBarOptions({shouldShowNativeTabBar, isTabBarVertical, isAccountAvatarShown, dotColors, tabLabels});
    const renderTabScreenLayout = (props: ScreenLayoutProps) => (
        <>
            <TabScreenHorizontalSafeArea>{bottomTabScreenLayoutWrapper(props)}</TabScreenHorizontalSafeArea>
            <TabBarShapeProbe isTabBarShown={shouldShowNativeTabBar} />
        </>
    );

    // A tab with no bar item draws no icon.
    const getScreenOptions = ({route}: {route: {name: NativeTabName}}) =>
        route.name === tabWithoutBarItem
            ? {...screenOptions, ...HIDDEN_TAB_OPTIONS}
            : {
                  ...screenOptions,
                  ...getTabOptions(route.name),
                  tabBarSelectionEnabled: isTabSelectionEnabled(route.name),
              };

    return (
        <TabBarShapeContext.Provider value={setIsTabBarVertical}>
            <TabHostHorizontalSafeArea>
                <Tab.Navigator
                    backBehavior="fullHistory"
                    layout={renderNativeTabLayout}
                    screenLayout={renderTabScreenLayout}
                    screenOptions={getScreenOptions}
                    UNSTABLE_router={tabRouterOverride}
                    screenListeners={tabScreenListeners}
                >
                    <Tab.Screen
                        name={SCREENS.HOME}
                        component={HomePage}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                        component={ReportsSplitNavigator}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                        component={SearchFullscreenNavigator}
                    />
                    <Tab.Screen
                        name={SCREENS.INSIGHTS}
                        component={InsightsPage}
                        // The tab opens on Spend dashboard once, then keeps the last dashboard in navigation state until the app restarts.
                        initialParams={{dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND}}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                        component={WorkspaceNavigator}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                        component={SettingsSplitNavigator}
                    />
                </Tab.Navigator>
            </TabHostHorizontalSafeArea>
        </TabBarShapeContext.Provider>
    );
}

export default TabNavigator;
