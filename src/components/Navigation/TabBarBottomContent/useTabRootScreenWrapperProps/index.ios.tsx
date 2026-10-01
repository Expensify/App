import type TabBarBottomContentProps from '@components/Navigation/TabBarBottomContent/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type TabRootScreenWrapperProps from './types';

import TabBarBottomContent from '..';

/**
 * On narrow layouts the content of a tab root screen runs under the translucent UITabBar, down to the bottom edge of
 * the screen, so the ScreenWrapper adds no bottom padding. Each tab root's list lets UIKit inset its end past the bar.
 */
function useTabRootScreenWrapperProps(selectedTab: TabBarBottomContentProps['selectedTab']): TabRootScreenWrapperProps {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    if (shouldUseNarrowLayout) {
        return {includeSafeAreaPaddingBottom: false};
    }

    return {
        bottomContent: <TabBarBottomContent selectedTab={selectedTab} />,
        bottomContentStyle: styles.overflowVisible,
    };
}

export default useTabRootScreenWrapperProps;
