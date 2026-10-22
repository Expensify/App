import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useContext} from 'react';
import {View} from 'react-native';

import type TabBarBottomContentProps from './types';

import IsTabRouteAtRootContext from './IsTabRouteAtRootContext';

/**
 * A copy of the floating tab bar in a tab root screen's own layout, so the screen's content ends above the bar the
 * navigator draws over it, and the bar travels with the screen while it slides in or out.
 */
function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const isTabRouteAtRoot = useContext(IsTabRouteAtRootContext);
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    // The navigator's bar is drawn over this copy, which would otherwise show around it while the screen slides.
    const isNavigatorTabBarVisible = isTabRouteAtRoot && !isBlockingViewVisible;

    if (!shouldUseNarrowLayout) {
        return null;
    }

    return (
        <View
            style={[styles.floatingTabBarBottomInset, isNavigatorTabBarVisible && styles.opacity0]}
            pointerEvents={isNavigatorTabBarVisible ? 'none' : 'auto'}
        >
            <NavigationTabBar
                selectedTab={selectedTab}
                shouldShowFloatingButtons={false}
            />
        </View>
    );
}

export default TabBarBottomContent;
