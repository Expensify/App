import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getIsAnyScreenClosing, subscribeToClosingScreens} from '@libs/Navigation/closingScreens';
import getLeafScreenNameAfterPop from '@libs/Navigation/helpers/getLeafScreenNameAfterPop';
import isTabRouteAtRoot, {isAtTabRootLevel} from '@libs/Navigation/helpers/isTabRouteAtRoot';
import cancelTabNavigationSpans, {INBOX_TAB_SPAN_IDS, REPORTS_TAB_SPAN_IDS} from '@libs/telemetry/cancelTabNavigationSpans';

import SCREENS from '@src/SCREENS';

import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {ValueOf} from 'type-fest';

import React, {useEffect, useSyncExternalStore} from 'react';
import {View} from 'react-native';

const NAVIGATION_TAB_TO_SPANS: Partial<Record<ValueOf<typeof NAVIGATION_TABS>, readonly string[]>> = {
    [NAVIGATION_TABS.INBOX]: INBOX_TAB_SPAN_IDS,
    [NAVIGATION_TABS.SEARCH]: REPORTS_TAB_SPAN_IDS,
};

/**
 * Custom tab bar rendered by the BottomTabNavigator. Only receives `state` (not the
 * full BottomTabBarProps) to avoid `descriptors` thrashing memoization.
 * Wrapped in overflow:'visible' so floating buttons (FAB, GPS, Camera) aren't clipped.
 */
function TabNavigatorBar({state}: Pick<BottomTabBarProps, 'state'>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    const isAtRoot = isTabRouteAtRoot(activeRoute);
    // --- Narrow-only visibility logic (hooks must run unconditionally per Rules of Hooks) ---
    const shouldHide = shouldUseNarrowLayout && (!isAtRoot || isBlockingViewVisible);

    // Navigation state only changes once a pop commits, which on an interactive swipe is the moment the gesture
    // ends. Waiting for it makes the bar drop into place after the screen has already arrived. Watching for the
    // pop instead puts the bar under the incoming screen for the whole gesture, and an aborted swipe settles the
    // screen without a state change, so the bar goes back to hidden on its own.
    const isAnyScreenClosing = useSyncExternalStore(subscribeToClosingScreens, getIsAnyScreenClosing, getIsAnyScreenClosing);
    const shouldRevealDuringPop = isAnyScreenClosing && !isBlockingViewVisible && isAtTabRootLevel(getLeafScreenNameAfterPop(activeRoute?.state));

    // Cancel any in-flight tab-navigation span that doesn't match the new focused tab.
    // The span for the new tab is started by the tab button before navigation, so we keep it via `except`.
    useEffect(() => {
        cancelTabNavigationSpans(NAVIGATION_TAB_TO_SPANS[selectedTab]);
    }, [selectedTab]);

    const isHidden = shouldHide && !shouldRevealDuringPop;

    if (shouldUseNarrowLayout) {
        // Negative marginTop overlays the tab bar on content (zero flex space) to prevent layout shifts.
        return (
            <View
                style={[StyleUtils.getTabBarNarrowStyle(safeAreaPaddingBottom), isHidden && styles.opacity0]}
                pointerEvents={isHidden ? 'none' : 'auto'}
            >
                <NavigationTabBar
                    selectedTab={selectedTab}
                    shouldShowFloatingButtons={!isHidden}
                />
            </View>
        );
    }

    // When the screen is not blocking the view, we need to raise the tab bar above the screen content so the DebugTabView is visible.
    return (
        <View
            style={[styles.tabNavigatorBarContainer, !isBlockingViewVisible && {zIndex: 1}]}
            pointerEvents="box-none"
        >
            <NavigationTabBar selectedTab={selectedTab} />
        </View>
    );
}

export default TabNavigatorBar;
