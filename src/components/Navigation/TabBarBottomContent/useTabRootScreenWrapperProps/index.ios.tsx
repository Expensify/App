import useTabBarCoveredHeight from '@components/Navigation/TabBarBottomContent/useTabBarCoveredHeight';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type TabRootScreenWrapperProps from './types';

/**
 * On narrow layouts the content of a tab root screen runs under the translucent UITabBar, down to the bottom edge of
 * the screen, so the ScreenWrapper runs edge to edge and adds no bottom padding, to the screen or to the offline
 * indicator. Each tab root's list lets UIKit inset its end past the bar, and the offline indicator sits on the bar with
 * its background running down to the bottom edge.
 */
function useTabRootScreenWrapperProps(): TabRootScreenWrapperProps {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const tabBarCoveredHeight = useTabBarCoveredHeight();

    if (!shouldUseNarrowLayout) {
        return {};
    }

    return {
        enableEdgeToEdgeBottomSafeAreaPadding: false,
        offlineIndicatorStyle: styles.tabBarOfflineIndicator(tabBarCoveredHeight),
    };
}

export default useTabRootScreenWrapperProps;
