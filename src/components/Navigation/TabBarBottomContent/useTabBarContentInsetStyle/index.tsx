import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import variables from '@styles/variables';

import type {StyleProp, ViewStyle} from 'react-native';

/**
 * The content of a narrow tab root screen runs under the floating tab bar, so a list's content container ends with
 * room for the bar, letting its last row scroll out from under it. A list that already adds the bottom safe area
 * passes `hasBottomSafeAreaPadding`, so the safe area is not added twice.
 */
function useTabBarContentInsetStyle(style?: StyleProp<ViewStyle>, hasBottomSafeAreaPadding = false): StyleProp<ViewStyle> {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const insetStyle = useBottomSafeSafeAreaPaddingStyle({
        style,
        addBottomSafeAreaPadding: !hasBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        additionalPaddingBottom: variables.floatingTabBarHeight + variables.floatingTabBarBottomInset,
    });

    return shouldUseNarrowLayout ? insetStyle : style;
}

export default useTabBarContentInsetStyle;
