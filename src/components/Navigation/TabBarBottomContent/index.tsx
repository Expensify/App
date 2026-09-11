import NavigationTabBar from '@components/Navigation/NavigationTabBar';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {useNavigationLayoutContext} from '@libs/Navigation/AppNavigator/NavigationLayoutContext';

import React from 'react';

import type TabBarBottomContentProps from './types';

function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout: shouldUseNarrowLayoutFallback} = useResponsiveLayout();
    const layoutMode = useNavigationLayoutContext()?.mode;
    const shouldUseNarrowLayout = layoutMode ? layoutMode === 'narrow' : shouldUseNarrowLayoutFallback;

    if (!shouldUseNarrowLayout) {
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
