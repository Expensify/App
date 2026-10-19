import NavigationTabBar from '@components/Navigation/NavigationTabBar';

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
    const styles = useThemeStyles();

    if (!shouldUseNarrowLayout) {
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
