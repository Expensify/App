import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

/**
 * The `bottomContentStyle` a tab root screen should pass to ScreenWrapper alongside TabBarBottomContent.
 *
 * TabBarBottomContent renders nothing while the floating tab bar is used, so its wrapper must not keep any
 * bottom padding either — otherwise the screen stops short of the bottom edge and leaves a band below the pill.
 * `bottomContentStyle` is applied last, so pb0 overrides the padding ScreenWrapper adds in both its
 * edge-to-edge and legacy safe area modes.
 */
function useTabBarBottomContentStyle(): StyleProp<ViewStyle> {
    const styles = useThemeStyles();
    // The tab bar becomes a pill floating in the bottom-left corner on mobile web in landscape, where vertical space is scarce.
    const shouldUseFloatingTabBar = useIsMobileWebLandscape();

    return shouldUseFloatingTabBar ? [styles.overflowVisible, styles.pb0] : styles.overflowVisible;
}

export default useTabBarBottomContentStyle;
