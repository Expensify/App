import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import BottomTabBar, {BOTTOM_TABS} from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator/BottomTabBar';
import {isFullScreenName} from '@libs/Navigation/helpers';
import SIDEBAR_TO_SPLIT from '@libs/Navigation/linkingConfig/RELATIONS/SIDEBAR_TO_SPLIT';
import type {FullScreenName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const FULLSCREEN_TO_TAB = {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: BOTTOM_TABS.HOME,
    [SCREENS.SEARCH.CENTRAL_PANE]: BOTTOM_TABS.SEARCH,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: BOTTOM_TABS.SETTINGS,
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: BOTTOM_TABS.SETTINGS,
};

const SCREENS_WITH_BOTTOM_TAB_BAR = [...Object.keys(SIDEBAR_TO_SPLIT), SCREENS.SEARCH.CENTRAL_PANE, SCREENS.SETTINGS.WORKSPACES];

/**
 * Currently we are using the hybrid approach for the bottom tab bar.
 * On wide screen we are using per screen bottom tab bar. It gives us more flexibility. We can display the bottom tab bar on any screen without any navigation structure constraints.
 * On narrow layout we display the top level bottom tab bar. It allows us to implement proper animations between screens.
 */
function TopLevelBottomTabBar() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const topmostFullScreenRoute = useNavigationState((state) => state?.routes.findLast((route) => isFullScreenName(route.name)));
    const {paddingBottom} = useStyledSafeAreaInsets();

    // Home as fallback selected tab.
    const selectedTab = FULLSCREEN_TO_TAB[(topmostFullScreenRoute?.name as FullScreenName) ?? NAVIGATORS.REPORTS_SPLIT_NAVIGATOR];

    // There always should be a focused screen.
    const isScreenWithBottomTabFocused = useNavigationState((state) => SCREENS_WITH_BOTTOM_TAB_BAR.includes(findFocusedRoute(state)?.name ?? ''));

    const shouldDisplayTopLevelBottomTabBar = isScreenWithBottomTabFocused && shouldUseNarrowLayout;

    return (
        <View style={styles.topLevelBottomTabBar(shouldDisplayTopLevelBottomTabBar, paddingBottom)}>
            <BottomTabBar selectedTab={selectedTab} />
        </View>
    );
}

export default TopLevelBottomTabBar;
