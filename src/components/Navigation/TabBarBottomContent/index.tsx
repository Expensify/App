import NavigationTabBar from '@components/Navigation/NavigationTabBar';

import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type TabBarBottomContentProps from './types';

/**
 * A copy of the floating tab bar in a tab root screen's own layout, so the screen's content ends above the bar the
 * navigator draws over it, and the bar travels with the screen while it slides in or out.
 */
function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // The tab bar becomes a pill floating in the bottom-left corner on mobile web in landscape, where vertical space is scarce.
    const shouldUseFloatingTabBar = useIsMobileWebLandscape();
    const styles = useThemeStyles();

    // The floating tab bar hovers over the content instead of sitting below it, so nothing is rendered in flow
    // here and the screen expands all the way to the bottom. Tab root screens keep their last row reachable by
    // padding their scrollable content instead — see useTabRootScrollProps.
    if (!shouldUseNarrowLayout || shouldUseFloatingTabBar) {
        return null;
    }

    return (
        <View style={styles.floatingTabBarBottomInset}>
            <NavigationTabBar
                selectedTab={selectedTab}
                shouldShowFloatingButtons={false}
            />
        </View>
    );
}

export default TabBarBottomContent;
