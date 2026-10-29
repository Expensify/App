import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';
import FlatNavigationBar from '@components/Navigation/FlatNavigationBar';
import useNavigationBarWidth from '@components/Navigation/FlatNavigationBar/useNavigationBarWidth';
import useShouldUseFlatNavigationBar from '@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';
import {SetNavigatorTabBarVisibleContext} from '@components/Navigation/TabBarBottomContent/NavigatorTabBarVisibilityProvider';

import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import cancelTabNavigationSpans, {NAVIGATION_TAB_TO_SPANS} from '@libs/telemetry/cancelTabNavigationSpans';

import SCREENS from '@src/SCREENS';

import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';

import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {View} from 'react-native';

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
    const shouldUseFlatNavigationBar = useShouldUseFlatNavigationBar();
    const navigationBarWidth = useNavigationBarWidth();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    const isAtRoot = isTabRouteAtRoot(activeRoute);
    // --- Narrow-only animation logic (hooks must run unconditionally per Rules of Hooks) ---
    // Tab root screens draw their own copy of the tab bar while this one is hidden.
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

    const setIsNavigatorTabBarVisible = useContext(SetNavigatorTabBarVisibleContext);
    // isHidden depends on this bar's own animation state, so the tab root's copy, which renders in a sibling subtree,
    // can only learn it through context. A layout effect swaps the two bars before paint, so they never show together.
    useLayoutEffect(() => {
        setIsNavigatorTabBarVisible(!isHidden);
    }, [isHidden, setIsNavigatorTabBarVisible]);

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
            style={[styles.tabNavigatorBarContainer, StyleUtils.getTabNavigatorBarWidthStyle(navigationBarWidth), !isBlockingViewVisible && {zIndex: 1}]}
            pointerEvents="box-none"
        >
            {shouldUseFlatNavigationBar ? <FlatNavigationBar selectedTab={selectedTab} /> : <NavigationTabBar selectedTab={selectedTab} />}
        </View>
    );
}

export default TabNavigatorBar;
