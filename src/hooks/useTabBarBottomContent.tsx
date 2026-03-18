import React from 'react';
import type {ValueOf} from 'type-fest';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import type NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import useResponsiveLayout from './useResponsiveLayout';

const isWeb = getPlatform() === CONST.PLATFORM.WEB;

/** Returns NavigationTabBar as bottomContent on native narrow (for swipe-back animations). */
function useTabBarBottomContent(selectedTab: ValueOf<typeof NAVIGATION_TABS>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    if (isWeb || !shouldUseNarrowLayout) {
        return undefined;
    }
    return (
        <NavigationTabBar
            selectedTab={selectedTab}
            shouldShowFloatingButtons={false}
        />
    );
}

export default useTabBarBottomContent;
