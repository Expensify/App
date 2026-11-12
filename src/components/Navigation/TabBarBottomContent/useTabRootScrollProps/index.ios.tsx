import useTabBarCoveredHeight from '@components/Navigation/TabBarBottomContent/useTabBarCoveredHeight';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

import type {StyleProp, ViewStyle} from 'react-native';

import type TabRootScrollProps from './types';
import type {TabRootScrollOptions} from './types';

/**
 * UIKit insets the end of a list past the translucent UITabBar that the content runs under, but not past the offline
 * indicator laid over the content above the bar, so the list ends with room for it. UIKit's inset leaves the layout of
 * the content alone, so content that fills the list and is laid out in it, like a centered empty state, would sit
 * partly under the bar; it pads past the bar itself instead.
 */
function useTabRootScrollProps(
    style?: StyleProp<ViewStyle>,
    {hasBottomSafeAreaPadding = false, hasOfflineIndicatorPadding = false, fillsVisibleArea = false}: TabRootScrollOptions = {},
): TabRootScrollProps {
    const tabBarCoveredHeight = useTabBarCoveredHeight();
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);
    const isCoveredByTabBar = tabBarCoveredHeight > 0;
    const coveredHeightPadding = hasBottomSafeAreaPadding ? tabBarCoveredHeight - safeAreaPaddingBottom : tabBarCoveredHeight;

    const contentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        style,
        addOfflineIndicatorBottomSafeAreaPadding: isCoveredByTabBar && !hasOfflineIndicatorPadding,
        additionalPaddingBottom: isCoveredByTabBar && fillsVisibleArea ? coveredHeightPadding : 0,
    });

    return {contentContainerStyle, contentInsetAdjustmentBehavior: fillsVisibleArea ? 'never' : 'automatic'};
}

export default useTabRootScrollProps;
