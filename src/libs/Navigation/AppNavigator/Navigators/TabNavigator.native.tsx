import HorizontalSafeArea from '@components/HorizontalSafeArea';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import type {SearchKey} from '@libs/SearchKeyUtils';

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
import isTabHostFullWidth from './NativeTabNavigator/isTabHostFullWidth';
import {findSearchTabRoute, getFlatNavTabHostRouteName, getSearchTabSearchKey} from './NativeTabNavigator/nativeTabItemUtils';
import NativeTabLayout from './NativeTabNavigator/NativeTabLayout';
import TabRootRevealingContext from './NativeTabNavigator/TabRootRevealingContext';
import tabScreenListeners from './NativeTabNavigator/tabScreenListeners';
import useIsTabBarVertical from './NativeTabNavigator/useIsTabBarVertical';
import useNativeFlatNavSearchSection from './NativeTabNavigator/useNativeFlatNavSearchSection';
import useNativeTabBarOptions from './NativeTabNavigator/useNativeTabBarOptions';
import useNativeTabNavigator from './NativeTabNavigator/useNativeTabNavigator';
import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import TabRootGestureController from './TabRootGestureController';
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
    /** Resolves the section of the search Search shows from its search key, given only with the flat nav bar */
    getFlatNavSearchSectionID?: (searchKey: SearchKey | undefined) => FlatNavSectionID | undefined;

    isFlatNavTabBarEnabled?: boolean;
};

function NativeTabNavigator({getFlatNavSearchSectionID, isFlatNavTabBarEnabled = false}: NativeTabNavigatorProps) {
    const {shouldShowNativeTabBar, dotColors, tabLabels, tabRouterOverride, isTabSelectionEnabled, setIsTabRootRevealing} = useNativeTabNavigator({isFlatNavTabBarEnabled});
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const isTabBarVertical = useIsTabBarVertical();
    const {screenOptions, getTabOptions} = useNativeTabBarOptions({shouldShowNativeTabBar, isTabBarVertical, dotColors, tabLabels});
    // The search key is read from the navigator's current state, as the route given here has no nested state, so the bar
    // selects the new item in the same commit as Search moves.
    const getSearchSectionID = (navigation: {getState: () => NavigationState}) => getFlatNavSearchSectionID?.(getSearchTabSearchKey(findSearchTabRoute(navigation.getState())));
    // A tab with no label has no bar item and draws no icon. It is drawn inside the item of its flat nav slot, or, with no
    // slot, inside the first item with no item shown as selected.
    const getScreenOptions = ({route, navigation}: {route: {name: NativeTabRouteName}; navigation: {getState: () => NavigationState}}) =>
        route.name in tabLabels
            ? {
                  ...screenOptions,
                  ...getTabOptions(route.name),
                  tabBarSelectionEnabled: isTabSelectionEnabled(route.name),
              }
            : {...screenOptions, ...HIDDEN_TAB_OPTIONS, tabBarItemHostRouteName: getFlatNavTabHostRouteName(route.name, getSearchSectionID(navigation))};

    const tabNavigator = (
        <TabRootRevealingContext.Provider value={setIsTabRootRevealing}>
            <TabRootGestureController />
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
        </TabRootRevealingContext.Provider>
    );

    return isTabHostFullWidth ? tabNavigator : <HorizontalSafeArea>{tabNavigator}</HorizontalSafeArea>;
}

/** The tab navigator with the flat nav bar, which reads where Search is so the bar can highlight its item. */
function FlatNavNativeTabNavigator() {
    const route = useRoute();
    const getTabState = (parentState: NavigationState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state;
    const isSearchFocused = useNavigationState((parentState) => getActiveTabRoute(getTabState(parentState))?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const getFlatNavSearchSectionID = useNativeFlatNavSearchSection({isSearchFocused});

    return (
        <NativeTabNavigator
            isFlatNavTabBarEnabled
            getFlatNavSearchSectionID={getFlatNavSearchSectionID}
        />
    );
}

/**
 * The flat nav bar is a navigator of its own, so the data it reads leaves the tab navigator without the beta untouched.
 * Turning the beta on or off remounts the tabs.
 */
function TabNavigator() {
    const {isBetaEnabled} = usePermissions();
    return isBetaEnabled(CONST.BETAS.FLAT_NAV) ? <FlatNavNativeTabNavigator /> : <NativeTabNavigator />;
}

export default TabNavigator;
