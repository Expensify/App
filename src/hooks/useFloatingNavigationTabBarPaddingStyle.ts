import type {ViewStyle} from 'react-native';

import useIsMobileWebLandscape from './useIsMobileWebLandscape';
import useSafeAreaPaddings from './useSafeAreaPaddings';
import useStyleUtils from './useStyleUtils';

/**
 * Bottom padding a tab root screen's scrollable content needs so its last row can be scrolled clear of the
 * floating tab bar, or 0 for the full width bottom bar, which takes its own space in the layout.
 *
 * The bottom safe area is included because the screen extends to the bottom edge while the bar is floating —
 * see useTabBarBottomContentStyle. Add this to any existing bottom padding rather than replacing it.
 */
function useFloatingNavigationTabBarPadding(): number {
    // The tab bar becomes a pill floating in the bottom-left corner on mobile web in landscape, where vertical space is scarce.
    const shouldUseFloatingTabBar = useIsMobileWebLandscape();
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);
    const StyleUtils = useStyleUtils();

    return shouldUseFloatingTabBar ? StyleUtils.getFloatingTabBarOccupiedHeight(safeAreaPaddingBottom) : 0;
}

/** {@link useFloatingNavigationTabBarPadding} as a style, for appending to a contentContainerStyle array. */
function useFloatingNavigationTabBarPaddingStyle(): ViewStyle | undefined {
    const paddingBottom = useFloatingNavigationTabBarPadding();

    return paddingBottom ? {paddingBottom} : undefined;
}

export default useFloatingNavigationTabBarPaddingStyle;
export {useFloatingNavigationTabBarPadding};
