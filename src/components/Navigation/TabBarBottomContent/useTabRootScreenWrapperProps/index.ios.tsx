import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type {UseTabRootScreenWrapperProps} from './types';

/**
 * On narrow layouts the content of a tab root screen runs under the translucent UITabBar, down to the bottom edge of
 * the screen, so the ScreenWrapper adds no bottom padding. Each tab root's list lets UIKit inset its end past the bar.
 */
const useTabRootScreenWrapperProps: UseTabRootScreenWrapperProps = () => {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return shouldUseNarrowLayout ? {includeSafeAreaPaddingBottom: false} : {};
};

export default useTabRootScreenWrapperProps;
