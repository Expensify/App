import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';

import useIsSettingsDrawnOverTabs from '@hooks/useIsSettingsDrawnOverTabs';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type TabBarBottomContentProps from './types';

/**
 * Material's bar is drawn over the full-height tab screen, so a tab root screen reserves the bar's row under its
 * content. The ScreenWrapper adds the gesture inset the bar sits on below it.
 */
function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isSettingsDrawnOverTabs = useIsSettingsDrawnOverTabs();
    const styles = useThemeStyles();

    // Account drawn over the tabs hides the bar.
    if (!shouldUseNarrowLayout || (selectedTab === NAVIGATION_TABS.SETTINGS && isSettingsDrawnOverTabs)) {
        return null;
    }

    return <View style={styles.androidNativeTabBarSpacer} />;
}

export default TabBarBottomContent;
