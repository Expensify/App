import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import TabNavigatorBar from '@libs/Navigation/AppNavigator/Navigators/TabNavigatorBar';

import SCREENS from '@src/SCREENS';

import type {NativeBottomTabNavigatorProps} from '@react-navigation/bottom-tabs/unstable';

import React, {useState} from 'react';
import {View} from 'react-native';

import FlatNavTabPressListeners from './FlatNavTabPressListeners';
import NativeTabBarOverlay from './NativeTabBarOverlay';
import TabPressListeners from './TabPressListeners';
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
    // The tab screen that is shown says so when its header puts a back button in the vertical bar, where it takes the
    // place of the create and scan buttons.
    // The screen that is left can take its button away after the next one has added its own, so the buttons are counted.
    const [verticalBarBackButtonCount, setVerticalBarBackButtonCount] = useState(0);
    const addBackButton = () => {
        setVerticalBarBackButtonCount((count) => count + 1);
        return () => setVerticalBarBackButtonCount((count) => count - 1);
    };
    const verticalBarTabsScreen = {addBackButton};

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
                    hasVerticalBarBackButton={verticalBarBackButtonCount > 0}
                />
            )}
        </View>
    );
}

export default NativeTabLayout;
export type {NativeTabLayoutProps};
