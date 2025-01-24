import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFullScreenName, isSplitNavigatorName} from '@libs/Navigation/helpers/isNavigatorName';
import {FULLSCREEN_TO_TAB, SIDEBAR_TO_SPLIT} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {FullScreenName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import useIsBottomTabVisibleDirectly from './useIsBottomTabVisibleDirectly';

const SCREENS_WITH_BOTTOM_TAB_BAR = [...Object.keys(SIDEBAR_TO_SPLIT), SCREENS.SEARCH.ROOT, SCREENS.SETTINGS.WORKSPACES];

/**
 * TopLevelBottomTabBar is displayed when the user can interact with the bottom tab bar.
 * We hide it when:
 * 1. The bottom tab bar is not visible.
 * 2. There is transition between screens with and without the bottom tab bar.
 * 3. The bottom tab bar is under the overlay.
 * For cases 2 and 3, local bottom tab bar mounted on the screen will be displayed.
 */

function TopLevelBottomTabBar() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingBottom} = useStyledSafeAreaInsets();
    const [isAfterClosingTransition, setIsAfterClosingTransition] = useState(false);
    const cancelAfterInteractions = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | undefined>();

    const selectedTab = useNavigationState((state) => {
        const topmostFullScreenRoute = state?.routes.findLast((route) => isFullScreenName(route.name));
        return FULLSCREEN_TO_TAB[(topmostFullScreenRoute?.name as FullScreenName) ?? NAVIGATORS.REPORTS_SPLIT_NAVIGATOR];
    });

    // There always should be a focused screen.
    const isScreenWithBottomTabFocused = useNavigationState((state) => {
        const focusedRoute = findFocusedRoute(state);

        // We are checking if the focused route is a split navigator because there may be a brief moment where the navigator don't have state yet.
        // That mens we don't have screen with bottom tab focused. This caused glitching.
        return SCREENS_WITH_BOTTOM_TAB_BAR.includes(focusedRoute?.name ?? '') || isSplitNavigatorName(focusedRoute?.name);
    });

    // That means it's visible and it's not covered by the overlay.
    const isBottomTabVisibleDirectly = useIsBottomTabVisibleDirectly();

    const shouldDisplayBottomBar = shouldUseNarrowLayout ? isScreenWithBottomTabFocused : isBottomTabVisibleDirectly;
    const isReadyToDisplayBottomBar = isAfterClosingTransition && shouldDisplayBottomBar;

    useEffect(() => {
        cancelAfterInteractions.current?.cancel();

        if (!shouldDisplayBottomBar) {
            // If the bottom tab is not visible, that means there is a screen covering it.
            // In that case we need to set the flag to true because there will be a transition for which we need to wait.
            setIsAfterClosingTransition(false);
        } else {
            // If the bottom tab should be visible, we want to wait for transition to finish.
            cancelAfterInteractions.current = InteractionManager.runAfterInteractions(() => {
                setIsAfterClosingTransition(true);
            });
        }
    }, [shouldDisplayBottomBar]);

    return (
        <View style={styles.topLevelBottomTabBar(isReadyToDisplayBottomBar, shouldUseNarrowLayout, paddingBottom)}>
            {/* We are not rendering BottomTabBar conditionally for two reasons
                1. It's faster to hide/show it than mount a new when needed.
                2. We need to hide tooltips as well if they were displayed. */}
            <BottomTabBar
                selectedTab={selectedTab}
                isTooltipAllowed={isReadyToDisplayBottomBar}
            />
        </View>
    );
}
export default TopLevelBottomTabBar;
