import useOnyx from '@hooks/useOnyx';

import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import HomePage from '@pages/home/HomePage';
import InsightsPage from '@pages/Insights/InsightsPage';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import {useNavigationState, useRoute} from '@react-navigation/native';
import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

import type {NativeTabRouteName} from './NativeTabNavigator/nativeTabItemUtils';
import type {NativeTabLayoutProps} from './NativeTabNavigator/NativeTabLayout';

import getActiveTabRoute from './NativeTabNavigator/getActiveTabRoute';
import getTabNavigatorState from './NativeTabNavigator/getTabNavigatorState';
import {getSearchTabSearchKey} from './NativeTabNavigator/nativeTabItemUtils';
import NativeTabLayout from './NativeTabNavigator/NativeTabLayout';
import tabScreenListeners from './NativeTabNavigator/tabScreenListeners';
import useIsNativeFlatNavTabBarEnabled from './NativeTabNavigator/useIsNativeFlatNavTabBarEnabled';
import useNativeFlatNavSearchSection from './NativeTabNavigator/useNativeFlatNavSearchSection';
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

/** The Expenses, Reports and More items of the flat nav bar, which show the routes drawn inside them rather than a screen of their own. */
function NativeTabItemPlaceholder() {
    return null;
}

type NativeTabNavigatorProps = {
    /** The section of the search Search shows, given only with the flat nav bar */
    flatNavSearchSectionID?: FlatNavSectionID;

    isFlatNavTabBarEnabled?: boolean;
};

function NativeTabNavigator({flatNavSearchSectionID, isFlatNavTabBarEnabled = false}: NativeTabNavigatorProps) {
    const {shouldShowNativeTabBar, dotColors, tabLabels, tabsWithoutBarItem, tabRouterOverride, isTabSelectionEnabled, getTabHostRouteName} = useNativeTabNavigator({
        isFlatNavTabBarEnabled,
        flatNavSearchSectionID,
    });
    const {screenOptions, getTabOptions} = useNativeTabBarOptions({shouldShowNativeTabBar, dotColors, tabLabels});
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    // A tab with no bar item draws no icon.
    const getScreenOptions = ({route}: {route: {name: NativeTabRouteName}}) => {
        if (!tabsWithoutBarItem.has(route.name)) {
            return {
                ...screenOptions,
                ...getTabOptions(route.name),
                tabBarSelectionEnabled: isTabSelectionEnabled(route.name),
            };
        }
        const tabBarItemHostRouteName = getTabHostRouteName(route.name);
        return tabBarItemHostRouteName ? {...screenOptions, ...HIDDEN_TAB_OPTIONS, tabBarItemHostRouteName} : {...screenOptions, ...HIDDEN_TAB_OPTIONS};
    };

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            layout={renderNativeTabLayout}
            screenLayout={bottomTabScreenLayoutWrapper}
            screenOptions={getScreenOptions}
            UNSTABLE_router={tabRouterOverride}
            screenListeners={(props) => tabScreenListeners({...props, session})}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePage}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
            />
            {/* The native bar draws its items in this order. */}
            {isFlatNavTabBarEnabled && (
                <>
                    <Tab.Screen
                        name={SCREENS.NATIVE_TAB_ITEM.EXPENSES}
                        component={NativeTabItemPlaceholder}
                    />
                    <Tab.Screen
                        name={SCREENS.NATIVE_TAB_ITEM.REPORTS}
                        component={NativeTabItemPlaceholder}
                    />
                    <Tab.Screen
                        name={SCREENS.NATIVE_TAB_ITEM.MORE}
                        component={NativeTabItemPlaceholder}
                    />
                </>
            )}
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
    );
}

/** The tab navigator with the flat nav bar, which reads where Search is so the bar can highlight its item. */
function FlatNavNativeTabNavigator() {
    const route = useRoute();
    const getTabState = (parentState: NavigationState) => getTabNavigatorState(parentState, route.key);
    const searchKey = useNavigationState((parentState) =>
        getSearchTabSearchKey(getTabState(parentState)?.routes.find((tabRoute) => tabRoute.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)),
    );
    const isSearchFocused = useNavigationState((parentState) => getActiveTabRoute(getTabState(parentState))?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const flatNavSearchSectionID = useNativeFlatNavSearchSection({searchKey, isSearchFocused});

    return (
        <NativeTabNavigator
            isFlatNavTabBarEnabled
            flatNavSearchSectionID={flatNavSearchSectionID}
        />
    );
}

/**
 * The flat nav bar is a navigator of its own, so the data it reads leaves the tab navigator without the beta untouched.
 * Turning the beta on or off, or a tablet crossing the narrow breakpoint with it, remounts the tabs.
 */
function TabNavigator() {
    const isFlatNavTabBarEnabled = useIsNativeFlatNavTabBarEnabled();
    return isFlatNavTabBarEnabled ? <FlatNavNativeTabNavigator /> : <NativeTabNavigator />;
}

export default TabNavigator;
