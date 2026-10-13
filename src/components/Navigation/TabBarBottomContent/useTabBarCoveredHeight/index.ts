import useResponsiveLayout from '@hooks/useResponsiveLayout';

import variables from '@styles/variables';

/** The floating tab bar and the gap under it cover the bottom of a narrow tab root screen. */
function useTabBarCoveredHeight(): number {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return shouldUseNarrowLayout ? variables.floatingTabBarHeight + variables.floatingTabBarBottomInset : 0;
}

export default useTabBarCoveredHeight;
