import React, {memo} from 'react';
import type {ValueOf} from 'type-fest';
import usePermissions from '@hooks/usePermissions';
import CONST from '@src/CONST';
import HomeNavigationTabBar from './HomeNavigationTabBar';
import InboxNavigationTabBar from './InboxNavigationTabBar';
import type NAVIGATION_TABS from './NAVIGATION_TABS';

type NavigationTabBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isTopLevelBar?: boolean;
    shouldShowFloatingButtons?: boolean;
};

function NavigationTabBar({selectedTab, isTopLevelBar = false, shouldShowFloatingButtons = true}: NavigationTabBarProps) {
    const {isBetaEnabled} = usePermissions();
    const isNewDotHomeEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_HOME);

    if (isNewDotHomeEnabled) {
        return (
            <HomeNavigationTabBar
                selectedTab={selectedTab}
                isTopLevelBar={isTopLevelBar}
                shouldShowFloatingButtons={shouldShowFloatingButtons}
            />
        );
    }

    return (
        <InboxNavigationTabBar
            selectedTab={selectedTab}
            isTopLevelBar={isTopLevelBar}
            shouldShowFloatingButtons={shouldShowFloatingButtons}
        />
    );
}

export default memo(NavigationTabBar);
