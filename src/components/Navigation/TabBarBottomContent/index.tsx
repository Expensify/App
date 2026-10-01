import NavigationTabBar from '@components/Navigation/NavigationTabBar';

import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import React from 'react';

import type TabBarBottomContentProps from './types';

function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // The tab bar becomes a pill floating in the bottom-left corner on mobile web in landscape, where vertical space is scarce.
    const shouldUseFloatingTabBar = useIsMobileWebLandscape();

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
