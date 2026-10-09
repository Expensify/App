import DebugTabViewPlaceholder from '@components/Navigation/DebugTabViewPlaceholder';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import React from 'react';

import type TabBarBottomContentProps from './types';

function TabBarBottomContent({selectedTab, shouldReserveDebugTabView = false}: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (!shouldUseNarrowLayout) {
        return null;
    }

    return (
        <>
            {shouldReserveDebugTabView && <DebugTabViewPlaceholder selectedTab={selectedTab} />}
            <NavigationTabBar
                selectedTab={selectedTab}
                shouldShowFloatingButtons={false}
            />
        </>
    );
}

export default TabBarBottomContent;
