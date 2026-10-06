import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type UseTabRootScreenWrapperProps from './types';

import TabBarBottomContent from '..';

/**
 * On narrow layouts the floating tab bar is laid over the bottom of a tab root screen, so the content runs under it
 * down to the bottom edge of the screen. Each tab root's list ends with room for the bar.
 */
const useTabRootScreenWrapperProps: UseTabRootScreenWrapperProps = (selectedTab) => {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    return {
        bottomContent: <TabBarBottomContent selectedTab={selectedTab} />,
        bottomContentStyle: shouldUseNarrowLayout ? styles.floatingTabBarOverlay : styles.overflowVisible,
    };
};

export default useTabRootScreenWrapperProps;
