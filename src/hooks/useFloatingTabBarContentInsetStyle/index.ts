import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

/**
 * Bottom padding a tab root screen's scrollable content needs so its last row settles above the floating tab
 * bar instead of under it. Mobile web draws that bar in JS; iOS and Android take the sibling module, because
 * the native bar keeps the content clear of itself and needs no extra room.
 */
function useFloatingTabBarContentInsetStyle(): StyleProp<ViewStyle> {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return shouldUseNarrowLayout ? styles.floatingTabBarContentInset : undefined;
}

export default useFloatingTabBarContentInsetStyle;
