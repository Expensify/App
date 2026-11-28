import useTabBarCoveredHeight from '@components/Navigation/TabBarBottomContent/useTabBarCoveredHeight';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

/** The keyboard covers the UITabBar too, so the screen is lifted past the whole band its footer pads, not only the safe area. */
function useTabRootKeyboardVerticalOffset(): number {
    const tabBarCoveredHeight = useTabBarCoveredHeight();
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);

    return tabBarCoveredHeight > 0 ? safeAreaPaddingBottom - tabBarCoveredHeight : 0;
}

export default useTabRootKeyboardVerticalOffset;
