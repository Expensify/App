import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

/**
 * Bottom padding a tab root screen's scrollable content needs so its last row settles above the floating tab
 * bar instead of under it. Mobile web draws that bar itself; the native platforms get the same room from the
 * safe area their own tab bar reports, so there the hook adds nothing.
 */
function useFloatingTabBarContentInsetStyle(): StyleProp<ViewStyle> {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return shouldUseNarrowLayout ? styles.floatingTabBarContentInset : undefined;
}

export default useFloatingTabBarContentInsetStyle;
