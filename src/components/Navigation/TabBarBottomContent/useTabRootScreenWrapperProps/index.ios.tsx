import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFloatingButtonsBottom} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions';

import type TabRootScreenWrapperProps from './types';

/**
 * On narrow layouts the content of a tab root screen runs under the translucent UITabBar, down to the bottom edge of
 * the screen, so the ScreenWrapper adds no bottom padding. Each tab root's list lets UIKit inset its end past the bar,
 * and the offline indicator sits above the bar.
 */
function useTabRootScreenWrapperProps(): TabRootScreenWrapperProps {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {bottom: bottomInset} = useSafeAreaInsets();
    return shouldUseNarrowLayout ? {includeSafeAreaPaddingBottom: false, offlineIndicatorStyle: styles.iosNativeTabBarOfflineIndicator(getFloatingButtonsBottom(bottomInset))} : {};
}

export default useTabRootScreenWrapperProps;
