import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import {getFloatingButtonsBottom} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions';

/** The translucent UITabBar and the home indicator inset under it cover the bottom of a narrow tab root screen. */
function useTabBarCoveredHeight(): number {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {bottom: bottomInset} = useSafeAreaInsets();

    return shouldUseNarrowLayout ? getFloatingButtonsBottom(bottomInset) : 0;
}

export default useTabBarCoveredHeight;
