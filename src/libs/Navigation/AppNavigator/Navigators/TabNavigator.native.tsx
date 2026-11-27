import HorizontalSafeArea from '@components/HorizontalSafeArea';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';

import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import getMoreTabItemID from '@libs/Navigation/MoreMenu/getMoreTabItemID';
import MoreMenuStateContext, {isMoreItemSelectedByMenu} from '@libs/Navigation/MoreMenu/MoreMenuStateContext';
import type {MoreMenuState} from '@libs/Navigation/MoreMenu/MoreMenuStateContext';
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
import React, {createContext, useContext, useState} from 'react';
import {View} from 'react-native';

import type {NativeTabRouteName} from './NativeTabNavigator/nativeTabItemUtils';
import type {NativeTabLayoutProps} from './NativeTabNavigator/NativeTabLayout';

import getActiveTabRoute from './NativeTabNavigator/getActiveTabRoute';
import isTabHostFullWidth from './NativeTabNavigator/isTabHostFullWidth';
import {findSearchTabRoute, getFlatNavTabHiddenRouteName, getFlatNavTabHostRouteName, getSearchTabSearchKey} from './NativeTabNavigator/nativeTabItemUtils';
import NativeTabLayout from './NativeTabNavigator/NativeTabLayout';
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

type FlatNavSearchSectionResolver = (searchKey: SearchKey | undefined) => FlatNavSectionID | undefined;

/**
 * Resolves the section of the search Search shows from its search key. Only the flat nav navigator provides it. The bar
 * and the placeholders under its items read the same resolver, so they agree on the item Search is under.
 */
const FlatNavSearchSectionContext = createContext<FlatNavSearchSectionResolver | undefined>(undefined);

function getSearchSectionID(resolveSearchSectionID: FlatNavSearchSectionResolver | undefined, tabState: NavigationState) {
    return resolveSearchSectionID?.(getSearchTabSearchKey(findSearchTabRoute(tabState)));
}

/** The More item of the flat nav bar, which shows the hidden routes under it rather than a screen of its own. */
function NativeTabItemPlaceholder() {
    return null;
}

/**
 * The Expenses and Reports items of the flat nav bar, which show Search rather than a screen of their own. Search is
 * not laid out under these items while it is on a search of the More menu, so a tap on one of them then shows this
 * skeleton until Search opens the search of the item.
 */
function NativeTabSearchItemPlaceholder() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {top} = useSafeAreaInsets();
    const {contentHeaderHeight} = useContentHeaderHeight();
    const resolveSearchSectionID = useContext(FlatNavSearchSectionContext);
    const isSearchUnderMore = useNavigationState(
        (state) => getFlatNavTabHostRouteName(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, getSearchSectionID(resolveSearchSectionID, state)) === SCREENS.NATIVE_TAB_ITEM.MORE,
    );

    if (!isSearchUnderMore) {
        return null;
    }

    return (
        <View style={[styles.flex1, styles.appBG]}>
            {/* The room the Search page header takes, with the list padded for the type tabs and the search bar as on that page */}
            <View style={StyleUtils.getHeight(top + contentHeaderHeight)} />
            <SearchRowSkeleton containerStyle={styles.searchListContentContainerStyles(false)} />
        </View>
    );
}

type NativeTabNavigatorProps = {
    isFlatNavTabBarEnabled?: boolean;
};

function NativeTabNavigator({isFlatNavTabBarEnabled = false}: NativeTabNavigatorProps) {
    const resolveSearchSectionID = useContext(FlatNavSearchSectionContext);
    const {shouldShowNativeTabBar, dotColors, tabLabels, tabRouterOverride, isTabSelectionEnabled} = useNativeTabNavigator({isFlatNavTabBarEnabled});
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const isTabBarVertical = useIsTabBarVertical();
    const {screenOptions, getTabOptions} = useNativeTabBarOptions({shouldShowNativeTabBar, isTabBarVertical, dotColors, tabLabels});
    const [moreMenuState] = useContext(MoreMenuStateContext);
    // While the More menu is up the bar shows the More item as selected over the screen the user is on. Every tab gets
    // the name, since the bar reads it from the focused one.
    const selectedItemOptions = {tabBarSelectedItemRouteName: isMoreItemSelectedByMenu(moreMenuState) ? SCREENS.NATIVE_TAB_ITEM.MORE : undefined};
    // The More menu entry the More item shows is read from the navigator's current state, like the search key, so its
    // glyph changes in the same commit as the focused tab.
    const getMoreTabItemIDFromState = (navigation: {getState: () => NavigationState}) => {
        const tabState = navigation.getState();
        return getMoreTabItemID({focusedTabRouteName: getActiveTabRoute(tabState)?.name, activeFlatNavSectionID: getSearchSectionID(resolveSearchSectionID, tabState)});
    };
    // A tab with no label has no bar item and draws no icon. It shows under the item of its flat nav slot, or, with no
    // slot, under the first item with no item shown as selected.
    // The search key is read from the navigator's current state, as the route given here has no nested state, so the bar
    // selects the new item in the same commit as the section changes.
    const getScreenOptions = ({route, navigation}: {route: {name: NativeTabRouteName}; navigation: {getState: () => NavigationState}}) =>
        route.name in tabLabels
            ? {
                  ...screenOptions,
                  ...selectedItemOptions,
                  ...getTabOptions(route.name, route.name === SCREENS.NATIVE_TAB_ITEM.MORE ? getMoreTabItemIDFromState(navigation) : undefined),
                  tabBarSelectionEnabled: isTabSelectionEnabled(route.name),
                  tabBarItemHiddenRouteName: getFlatNavTabHiddenRouteName(route.name),
              }
            : {
                  ...screenOptions,
                  ...selectedItemOptions,
                  ...HIDDEN_TAB_OPTIONS,
                  tabBarItemHostRouteName: getFlatNavTabHostRouteName(route.name, getSearchSectionID(resolveSearchSectionID, navigation.getState())),
              };

    const tabNavigator = (
        <>
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
                            component={NativeTabSearchItemPlaceholder}
                        />
                        <Tab.Screen
                            name={SCREENS.NATIVE_TAB_ITEM.REPORTS}
                            component={NativeTabSearchItemPlaceholder}
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
        </>
    );

    return isTabHostFullWidth ? tabNavigator : <HorizontalSafeArea>{tabNavigator}</HorizontalSafeArea>;
}

/**
 * The tab navigator with the flat nav bar, which reads where Search is so the bar can highlight its item, and keeps the
 * state of the More menu so the bar can show the More item selected under it.
 */
function FlatNavNativeTabNavigator() {
    const moreMenuState = useState<MoreMenuState>('closed');
    const route = useRoute();
    const getTabState = (parentState: NavigationState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state;
    const isSearchFocused = useNavigationState((parentState) => getActiveTabRoute(getTabState(parentState))?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const getFlatNavSearchSectionID = useNativeFlatNavSearchSection({isSearchFocused});

    return (
        <FlatNavSearchSectionContext.Provider value={getFlatNavSearchSectionID}>
            <MoreMenuStateContext.Provider value={moreMenuState}>
                <NativeTabNavigator isFlatNavTabBarEnabled />
            </MoreMenuStateContext.Provider>
        </FlatNavSearchSectionContext.Provider>
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
