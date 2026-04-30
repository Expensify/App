import React from 'react';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type TabBarBottomContentProps from './types';

function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

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
