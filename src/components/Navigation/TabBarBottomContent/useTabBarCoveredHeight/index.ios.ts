import useHasVerticalBar from '@hooks/useHasVerticalBar';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import {getFloatingButtonsBottom} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions';

/**
 * The translucent UITabBar and the home indicator inset under it cover the bottom of a narrow tab root screen. A tab bar
 * laid out as a column sits beside the content, so only the home indicator inset covers it then.
 */
function useTabBarCoveredHeight(): number {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {bottom: bottomInset} = useSafeAreaInsets();
    const isTabBarVertical = useHasVerticalBar();

    if (!shouldUseNarrowLayout) {
        return 0;
    }
    return isTabBarVertical ? bottomInset : getFloatingButtonsBottom(bottomInset);
}

export default useTabBarCoveredHeight;
