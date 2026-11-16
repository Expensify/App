import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';

import variables from '@styles/variables';

/** The floating tab bar, the gap under it and the bottom safe area it sits on cover the bottom of a narrow tab root screen. */
function useTabBarCoveredHeight(): number {
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);

    return shouldUseNarrowLayout ? StyleUtils.getFloatingTabBarHeight(isInLandscapeMode) + variables.floatingTabBarBottomInset + safeAreaPaddingBottom : 0;
}

export default useTabBarCoveredHeight;
