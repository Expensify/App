import React from 'react';
import type {ValueOf} from 'type-fest';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import type NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import useResponsiveLayout from './useResponsiveLayout';

const isWeb = getPlatform() === CONST.PLATFORM.WEB;

/**
 * On native narrow layouts the tab bar must be rendered as ScreenWrapper.bottomContent
 * so it participates in swipe-back (push/pop) animations. On web, the navigator's
 * tabBar prop handles rendering instead.
 */
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
