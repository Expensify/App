import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import type TabBarBottomContentProps from '@components/Navigation/TabBarBottomContent/types';

import useIsSettingsDrawnOverTabs from '@hooks/useIsSettingsDrawnOverTabs';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFloatingButtonsBottom} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions';

import type TabRootScreenWrapperProps from './types';

/**
 * On narrow layouts the content of a tab root screen runs under the translucent UITabBar, down to the bottom edge of
 * the screen, so the ScreenWrapper runs edge to edge and adds no bottom padding, to the screen or to the offline
 * indicator. Each tab root's list lets UIKit inset its end past the bar, and the offline indicator sits above the bar.
 * Account drawn over the tabs hides the bar.
 */
function useTabRootScreenWrapperProps(selectedTab: TabBarBottomContentProps['selectedTab']): TabRootScreenWrapperProps {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isSettingsDrawnOverTabs = useIsSettingsDrawnOverTabs();
    const styles = useThemeStyles();
    const {bottom: bottomInset} = useSafeAreaInsets();

    if (!shouldUseNarrowLayout || (selectedTab === NAVIGATION_TABS.SETTINGS && isSettingsDrawnOverTabs)) {
        return {};
    }

    return {
        enableEdgeToEdgeBottomSafeAreaPadding: false,
        offlineIndicatorStyle: styles.iosNativeTabBarOfflineIndicator(getFloatingButtonsBottom(bottomInset)),
    };
}

export default useTabRootScreenWrapperProps;
