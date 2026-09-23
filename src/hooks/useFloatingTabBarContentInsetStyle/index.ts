import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

/**
 * Bottom padding a tab root screen's scrollable content needs so its last row settles above the floating tab
 * bar instead of under it. Android and mobile web draw that bar in JS; iOS takes the sibling module, because
 * UITabBar reports its own height through the safe area and needs no extra room.
 */
function useFloatingTabBarContentInsetStyle(): StyleProp<ViewStyle> {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return shouldUseNarrowLayout ? styles.floatingTabBarContentInset : undefined;
}

export default useFloatingTabBarContentInsetStyle;
