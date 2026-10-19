import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import type TabBarBottomContentProps from '@components/Navigation/TabBarBottomContent/types';

import useIsSettingsDrawnOverTabs from '@hooks/useIsSettingsDrawnOverTabs';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type TabRootScreenWrapperProps from './types';

/**
 * Material's bar is drawn over the full-height tab screen, so a narrow tab root screen reserves the bar's row under its
 * content, and the ScreenWrapper adds the gesture inset the bar sits on below it. Account drawn over the tabs hides the bar.
 */
function useTabRootScreenWrapperProps(selectedTab: TabBarBottomContentProps['selectedTab']): TabRootScreenWrapperProps {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isSettingsDrawnOverTabs = useIsSettingsDrawnOverTabs();
    const styles = useThemeStyles();

    if (!shouldUseNarrowLayout || (selectedTab === NAVIGATION_TABS.SETTINGS && isSettingsDrawnOverTabs)) {
        return {};
    }

    return {bottomContent: <View style={styles.androidNativeTabBarSpacer} />};
}

export default useTabRootScreenWrapperProps;
