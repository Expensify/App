import AlwaysPaintedView from '@components/AlwaysPaintedView';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useContext} from 'react';
import {View} from 'react-native';

import type TabBarBottomContentProps from './types';

import {NavigatorTabBarVisibleContext} from './NavigatorTabBarVisibilityProvider';

/**
 * A copy of the floating tab bar in a tab root screen's own layout, so the screen's content ends above the bar the
 * navigator draws over it. It shows only while the navigator's bar is hidden, so it travels with the screen as it slides.
 */
function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const isNavigatorTabBarVisible = useContext(NavigatorTabBarVisibleContext);

    if (!shouldUseNarrowLayout) {
        return null;
    }

    return (
        <View style={[styles.floatingTabBarBottomInset, isNavigatorTabBarVisible && styles.opacity0]}>
            <AlwaysPaintedView inert={isNavigatorTabBarVisible}>
                <NavigationTabBar
                    selectedTab={selectedTab}
                    shouldShowFloatingButtons={false}
                />
            </AlwaysPaintedView>
        </View>
    );
}

export default TabBarBottomContent;
