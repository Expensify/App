import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';

import variables from '@styles/variables';

import type {StyleProp, ViewStyle} from 'react-native';

import type TabRootScrollProps from './types';
import type {TabRootScrollOptions} from './types';

/**
 * The content of a narrow tab root screen runs under the floating tab bar and the offline indicator laid over it, so a
 * list's content container ends with room for both, letting its last row scroll out from under them. A list that
 * already adds the bottom safe area or the offline indicator's room says so, so neither is added twice.
 */
function useTabRootScrollProps(style?: StyleProp<ViewStyle>, {hasBottomSafeAreaPadding = false, hasOfflineIndicatorPadding = false}: TabRootScrollOptions = {}): TabRootScrollProps {
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const insetStyle = useBottomSafeSafeAreaPaddingStyle({
        style,
        addBottomSafeAreaPadding: !hasBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: !hasOfflineIndicatorPadding,
        additionalPaddingBottom: StyleUtils.getFloatingTabBarHeight(isInLandscapeMode) + variables.floatingTabBarBottomInset,
    });

    return {contentContainerStyle: shouldUseNarrowLayout ? insetStyle : style};
}

export default useTabRootScrollProps;
