import React from 'react';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import type TabBarBottomContentProps from './types';

/** On native, renders NavigationTabBar as bottomContent for swipe-back animations. */
function TabBarBottomContent({selectedTab}: TabBarBottomContentProps) {
    return (
        <NavigationTabBar
            selectedTab={selectedTab}
            shouldShowFloatingButtons={false}
        />
    );
}

export default TabBarBottomContent;
