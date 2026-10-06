import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import variables from '@styles/variables';

import type UseTabRootScrollProps from './types';

/**
 * The content of a narrow tab root screen runs under the floating tab bar, so a list's content container ends with
 * room for the bar, letting its last row scroll out from under it.
 */
const useTabRootScrollProps: UseTabRootScrollProps = (style, hasBottomSafeAreaPadding = false) => {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const insetStyle = useBottomSafeSafeAreaPaddingStyle({
        style,
        addBottomSafeAreaPadding: !hasBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        additionalPaddingBottom: variables.floatingTabBarHeight + variables.floatingTabBarBottomInset,
    });

    return {contentContainerStyle: shouldUseNarrowLayout ? insetStyle : style};
};

export default useTabRootScrollProps;
