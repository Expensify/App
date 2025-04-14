import type {ParamListBase} from '@react-navigation/native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {FullScreenBlockingViewContext} from '@components/FullScreenBlockingViewContextProvider';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';
import getIsNavigationTabBarVisibleDirectly from './getIsNavigationTabBarVisibleDirectly';
import getIsScreenWithNavigationTabBarFocused from './getIsScreenWithNavigationTabBarFocused';
import getSelectedTab from './getSelectedTab';

type TopLevelNavigationTabBarProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

/**
 * TopLevelNavigationTabBar is displayed when the user can interact with the bottom tab bar.
 * We hide it when:
 * 1. The bottom tab bar is not visible.
 * 2. There is transition between screens with and without the bottom tab bar.
 * 3. The bottom tab bar is under the overlay.
 * For cases 2 and 3, local bottom tab bar mounted on the screen will be displayed.
 */
function TopLevelNavigationTabBar({state}: TopLevelNavigationTabBarProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingBottom} = useSafeAreaPaddings();
    const [isAfterClosingTransition, setIsAfterClosingTransition] = useState(false);
    const cancelAfterInteractions = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | undefined>();
    const {isBlockingViewVisible} = useContext(FullScreenBlockingViewContext);
    const {canUseLeftHandBar} = usePermissions();
    const StyleUtils = useStyleUtils();

    // That means it's visible and it's not covered by the overlay.
    const isNavigationTabVisibleDirectly = getIsNavigationTabBarVisibleDirectly(state);
    const isScreenWithNavigationTabFocused = getIsScreenWithNavigationTabBarFocused(state);
    const selectedTab = getSelectedTab(state);

    const shouldDisplayBottomBar = shouldUseNarrowLayout ? isScreenWithNavigationTabFocused : isNavigationTabVisibleDirectly;
    const isReadyToDisplayBottomBar = isAfterClosingTransition && shouldDisplayBottomBar && !isBlockingViewVisible;
    const shouldDisplayLHB = canUseLeftHandBar && !shouldUseNarrowLayout;
    const sidebarWidth = canUseLeftHandBar ? variables.sideBarWithLHBWidth : variables.sideBarWidth;

    useEffect(() => {
        if (!shouldDisplayBottomBar) {
            // If the bottom tab is not visible, that means there is a screen covering it.
            // In that case we need to set the flag to true because there will be a transition for which we need to wait.
            setIsAfterClosingTransition(false);
        } else {
            // If the bottom tab should be visible, we want to wait for transition to finish.
            cancelAfterInteractions.current = InteractionManager.runAfterInteractions(() => {
                setIsAfterClosingTransition(true);
            });
            return () => cancelAfterInteractions.current?.cancel();
        }
    }, [shouldDisplayBottomBar]);

    return (
        <View
            style={[
                styles.topLevelNavigationTabBar(isReadyToDisplayBottomBar, shouldUseNarrowLayout, paddingBottom, sidebarWidth),
                shouldDisplayLHB ? StyleUtils.positioning.l0 : StyleUtils.positioning.b0,
            ]}
        >
            {/* We are not rendering NavigationTabBar conditionally for two reasons
                1. It's faster to hide/show it than mount a new when needed.
                2. We need to hide tooltips as well if they were displayed. */}
            <NavigationTabBar
                selectedTab={selectedTab}
                isTooltipAllowed={isReadyToDisplayBottomBar}
            />
        </View>
    );
}

TopLevelNavigationTabBar.displayName = 'TopLevelNavigationTabBar';

export default TopLevelNavigationTabBar;
