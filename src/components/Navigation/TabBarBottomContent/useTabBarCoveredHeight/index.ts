import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';

import variables from '@styles/variables';

/** The floating tab bar, the gap under it and the bottom safe area it sits on cover the bottom of a narrow tab root screen. */
function useTabBarCoveredHeight(): number {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // The tab bar becomes a pill floating in the bottom-left corner on mobile web in landscape, where vertical space is scarce.
    const shouldUseFloatingTabBar = useIsMobileWebLandscape();
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);
    const StyleUtils = useStyleUtils();

    if (shouldUseFloatingTabBar) {
        return StyleUtils.getFloatingTabBarOccupiedHeight(safeAreaPaddingBottom);
    }

    return shouldUseNarrowLayout ? variables.floatingTabBarHeight + variables.floatingTabBarBottomInset + safeAreaPaddingBottom : 0;
}

export default useTabBarCoveredHeight;
