import NavigationTabBar from '@components/Navigation/NavigationTabBar';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldUseFloatingNavigationTabBar from '@hooks/useShouldUseFloatingNavigationTabBar';

import React from 'react';

import type TabBarBottomContentProps from './types';

function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldUseFloatingTabBar = useShouldUseFloatingNavigationTabBar();

    // The floating tab bar hovers over the content instead of sitting below it, so nothing is rendered in flow
    // here and the screen expands all the way to the bottom. Tab root screens keep their last row reachable by
    // padding their scrollable content instead — see useFloatingNavigationTabBarPaddingStyle.
    if (!shouldUseNarrowLayout || shouldUseFloatingTabBar) {
        return null;
    }

    return (
        <NavigationTabBar
            selectedTab={selectedTab}
            shouldShowFloatingButtons={false}
        />
    );
}

export default TabBarBottomContent;
