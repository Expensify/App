import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getFocusedLeafScreenName from '@libs/Navigation/helpers/getFocusedLeafScreenName';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import ROOT_TAB_SCREENS from './ROOT_TAB_SCREENS';

const ROUTE_TO_NAVIGATION_TAB: Record<string, ValueOf<typeof NAVIGATION_TABS>> = {
    [SCREENS.HOME]: NAVIGATION_TABS.HOME,
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.INBOX,
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NAVIGATION_TABS.SEARCH,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.SETTINGS,
    [NAVIGATORS.WORKSPACE_NAVIGATOR]: NAVIGATION_TABS.WORKSPACES,
};

// Count as tab-root when they surface as the resolved leaf.
const TAB_WRAPPER_NAVIGATORS = new Set<string>([
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
]);

const isAtTabRootLevel = (name: string | undefined): boolean => !name || ROOT_TAB_SCREENS.has(name) || TAB_WRAPPER_NAVIGATORS.has(name);

// Deepest `screen` in a `{screen, params}` chain (e.g. WORKSPACE_NAV → WORKSPACE_SPLIT_NAV → WORKSPACE.INITIAL).
const getPushTargetLeaf = (params: unknown): string | undefined => {
    const p = params as {screen?: unknown; params?: unknown} | undefined;
    if (typeof p?.screen !== 'string') {
        return undefined;
    }
    return getPushTargetLeaf(p.params) ?? p.screen;
};

/**
 * Custom tab bar rendered by the BottomTabNavigator. Only receives `state` (not the
 * full BottomTabBarProps) to avoid `descriptors` thrashing memoization.
 * Wrapped in overflow:'visible' so floating buttons (FAB, GPS, Camera) aren't clipped.
 */
function TabNavigatorBar({state}: Pick<BottomTabBarProps, 'state'>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    // Check both leaves so wrapper hydration doesn't flash the tab bar on the push target (Android).
    const isAtRoot = isAtTabRootLevel(getFocusedLeafScreenName(activeRoute?.state)) && isAtTabRootLevel(getPushTargetLeaf(activeRoute?.params));
    // --- Narrow-only animation logic (hooks must run unconditionally per Rules of Hooks) ---
    // On native, screens also render the tab bar via bottomContent for swipe-back animations.
    // Delay showing this navigator's tab bar only when navigating back from a deeper screen
    // (where the tab bar was hidden). Keep it visible during tab switches so it doesn't flash.
    // Guard with shouldUseNarrowLayout so prevShouldHide stays false in wide layout,
    // preventing false shouldApplyDelay triggers on layout transitions (e.g. web resize).
    const shouldHide = shouldUseNarrowLayout && !isAtRoot;
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

    return (
        <View style={styles.overflowHidden}>
            <NavigationTabBar selectedTab={selectedTab} />
        </View>
    );
}

export default TabNavigatorBar;
