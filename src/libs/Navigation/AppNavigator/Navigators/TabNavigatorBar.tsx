import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import cancelTabNavigationSpans, {INBOX_TAB_SPAN_IDS, REPORTS_TAB_SPAN_IDS} from '@libs/telemetry/cancelTabNavigationSpans';

import SCREENS from '@src/SCREENS';

import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {ValueOf} from 'type-fest';

import React, {useEffect, useState} from 'react';
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
    // --- Narrow-only animation logic (hooks must run unconditionally per Rules of Hooks) ---
    // On native, screens also render the tab bar via bottomContent for swipe-back animations.
    // Delay showing this navigator's tab bar only when navigating back from a deeper screen
    // (where the tab bar was hidden). Keep it visible during tab switches so it doesn't flash.
    // Guard with shouldUseNarrowLayout so prevShouldHide stays false in wide layout,
    // preventing false shouldApplyDelay triggers on layout transitions (e.g. web resize).
    const shouldHide = shouldUseNarrowLayout && (!isAtRoot || isBlockingViewVisible);
    const prevTabIndex = usePrevious(state.index);
    const prevShouldHide = usePrevious(shouldHide);
    const stateKey = `${state.index}-${isAtRoot}`;
    const [animationDoneKey, setAnimationDoneKey] = useState(stateKey);

    const tabChanged = prevTabIndex !== state.index;
    const shouldApplyDelay = !tabChanged && prevShouldHide && !shouldHide;

    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            setAnimationDoneKey(stateKey);
        });
        return () => cancelAnimationFrame(frameId);
    }, [stateKey]);

    // Cancel any in-flight tab-navigation span that doesn't match the new focused tab.
    // The span for the new tab is started by the tab button before navigation, so we keep it via `except`.
    useEffect(() => {
        cancelTabNavigationSpans(NAVIGATION_TAB_TO_SPANS[selectedTab]);
    }, [selectedTab]);

    const isHidden = shouldHide || (shouldApplyDelay && animationDoneKey !== stateKey);

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
