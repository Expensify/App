import React from 'react';
import type {ValueOf} from 'type-fest';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import type NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useResponsiveLayout from './useResponsiveLayout';

function useTabBarBottomContent(selectedTab: ValueOf<typeof NAVIGATION_TABS>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    if (!shouldUseNarrowLayout) {
        return undefined;
    }
    return <NavigationTabBar selectedTab={selectedTab} />;
}

export default useTabBarBottomContent;
