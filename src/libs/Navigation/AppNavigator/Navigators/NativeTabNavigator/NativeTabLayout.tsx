import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import TabNavigatorBar from '@libs/Navigation/AppNavigator/Navigators/TabNavigatorBar';

import SCREENS from '@src/SCREENS';

import type {NativeBottomTabNavigatorProps} from '@react-navigation/bottom-tabs/unstable';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';

import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import FlatNavTabPressListeners from './FlatNavTabPressListeners';
import NativeTabBarOverlay from './NativeTabBarOverlay';
import TabPressListeners from './TabPressListeners';
import useIsTabBarVertical from './useIsTabBarVertical';
import VerticalBarTabsScreenContext from './VerticalBarTabsScreenContext';

type NativeTabLayoutProps = Parameters<NonNullable<NativeBottomTabNavigatorProps['layout']>>[0];

function NativeTabLayout({children, state, descriptors}: NativeTabLayoutProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    // On Android the native tab host shows no content for a tab added after the host selected its first tab, and
    // crashes when the selected tab is removed in place. Remounting the host when the set of tabs without a bar item
    // changes gives it only the tabs it should show.
    const tabsWithoutBarItemKey = state.routes
        .filter((route) => descriptors[route.key]?.options.tabBarItemHidden)
        .map((route) => route.name)
        .join();
    // The More placeholder is registered only with the flat nav bar, so the layout does not read the beta itself.
    const isFlatNavTabBarShown = state.routes.some((route) => route.name === SCREENS.NATIVE_TAB_ITEM.MORE);
    // The tabs are the screen of the root stack, so this is the navigation of the screen whose bar items UIKit shows.
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const isTabBarVertical = useIsTabBarVertical();
    const activeRoute = state.routes[state.index];
    // The overlay puts the create and scan buttons in the vertical bar under the same conditions.
    const hasVerticalBarItems = shouldUseNarrowLayout && isTabBarVertical && !!activeRoute && descriptors[activeRoute.key]?.options.tabBarStyle?.display !== 'none';
    const verticalBarTabsScreen = {navigation, hasBarItems: hasVerticalBarItems};

    // The tabs stay at the same place in the tree in both layouts, so crossing the breakpoint does not remount them.
    return (
        <View style={[styles.flex1, !shouldUseNarrowLayout && styles.flexRow]}>
            {!shouldUseNarrowLayout && <TabNavigatorBar state={state} />}
            <View
                key={tabsWithoutBarItemKey}
                style={styles.flex1}
            >
                <VerticalBarTabsScreenContext.Provider value={verticalBarTabsScreen}>{children}</VerticalBarTabsScreenContext.Provider>
            </View>
            <TabPressListeners
                state={state}
                descriptors={descriptors}
            />
            {isFlatNavTabBarShown && (
                <FlatNavTabPressListeners
                    state={state}
                    descriptors={descriptors}
                />
            )}
            {shouldUseNarrowLayout && (
                <NativeTabBarOverlay
                    state={state}
                    descriptors={descriptors}
                />
            )}
        </View>
    );
}

export default NativeTabLayout;
export type {NativeTabLayoutProps};
