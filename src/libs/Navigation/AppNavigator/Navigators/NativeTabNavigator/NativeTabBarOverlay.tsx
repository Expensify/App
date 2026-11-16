import FloatingCameraButton from '@components/FloatingCameraButton';
import FloatingGPSButton from '@components/FloatingGPSButton';
import DebugTabView from '@components/Navigation/DebugTabView';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import useOnyx from '@hooks/useOnyx';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import cancelTabNavigationSpans, {NAVIGATION_TAB_TO_SPANS} from '@libs/telemetry/cancelTabNavigationSpans';

import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

import type {NativeTabLayoutProps} from './NativeTabLayout';

import NativeTabBarShadow from './NativeTabBarShadow';
import {getFloatingButtonsBottom} from './useNativeTabBarOptions';

/** What a narrow layout draws over the tabs along with the native bar, kept apart so wide layouts skip its hooks. */
function NativeTabBarOverlay({state, descriptors}: Pick<NativeTabLayoutProps, 'state' | 'descriptors'>) {
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const styles = useThemeStyles();
    const {bottom: bottomInset} = useSafeAreaInsets();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;

    // Cancel any in-flight tab-navigation span that doesn't match the new focused tab. The new tab's span is started at
    // the tap, before navigation, so it is kept. On wide layouts the JS side bar does this.
    useEffect(() => {
        cancelTabNavigationSpans(NAVIGATION_TAB_TO_SPANS[selectedTab]);
    }, [selectedTab]);

    // The buttons follow whatever the navigator decided for the bar itself.
    const shouldShowNativeTabBar = !!activeRoute && descriptors[activeRoute.key]?.options.tabBarStyle?.display !== 'none';

    return (
        <>
            {!!isDebugModeEnabled && shouldShowNativeTabBar && <DebugTabView selectedTab={selectedTab} />}
            {shouldShowNativeTabBar && (
                // The shadow and the buttons belong to the bar, so they fade with it rather than appearing in place.
                // They leave faster than they come in, so they stop covering a bar that is still sliding out.
                <Animated.View
                    entering={FadeIn.duration(CONST.MODAL.ANIMATION_TIMING.FAB_IN)}
                    exiting={FadeOut.duration(CONST.MODAL.ANIMATION_TIMING.FAB_OUT)}
                    style={[StyleSheet.absoluteFill, styles.zIndex10]}
                    pointerEvents="box-none"
                >
                    <NativeTabBarShadow />
                    <View
                        style={styles.nativeTabBarFloatingButtons(getFloatingButtonsBottom(bottomInset))}
                        pointerEvents="box-none"
                    >
                        <View style={[styles.navigationTabBarFABItem, styles.ph0, styles.floatingActionButtonPosition]}>
                            <NavigationTabBarFloatingActionButton />
                        </View>
                        <FloatingGPSButton />
                        <FloatingCameraButton />
                    </View>
                </Animated.View>
            )}
        </>
    );
}

export default NativeTabBarOverlay;
