import type TabBarBottomContentProps from '@components/Navigation/TabBarBottomContent/types';
import useTabBarCoveredHeight from '@components/Navigation/TabBarBottomContent/useTabBarCoveredHeight';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type TabRootScreenWrapperProps from './types';

import TabBarBottomContent from '..';

/**
 * On narrow layouts the floating tab bar is laid over the bottom of a tab root screen, so the content runs under it
 * down to the bottom edge of the screen. Each tab root's list ends with room for the bar, and the offline indicator sits
 * on the bar with its background running down to the bottom edge.
 */
function useTabRootScreenWrapperProps(selectedTab: TabBarBottomContentProps['selectedTab']): TabRootScreenWrapperProps {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const tabBarCoveredHeight = useTabBarCoveredHeight();

    return {
        bottomContent: <TabBarBottomContent selectedTab={selectedTab} />,
        bottomContentStyle: shouldUseNarrowLayout ? [styles.stickToBottom, styles.overflowVisible] : styles.overflowVisible,
        offlineIndicatorStyle: shouldUseNarrowLayout ? styles.tabBarOfflineIndicator(tabBarCoveredHeight) : undefined,
    };
}

export default useTabRootScreenWrapperProps;
