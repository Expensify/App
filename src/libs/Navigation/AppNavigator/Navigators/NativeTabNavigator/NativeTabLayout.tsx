import FloatingCameraButton from '@components/FloatingCameraButton';
import FloatingGPSButton from '@components/FloatingGPSButton';
import DebugTabView from '@components/Navigation/DebugTabView';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import TabNavigatorBar from '@libs/Navigation/AppNavigator/Navigators/TabNavigatorBar';

import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabNavigatorProps} from '@react-navigation/bottom-tabs/unstable';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

import NativeTabBarShadow from './NativeTabBarShadow';
import SpendTabPressListener from './SpendTabPressListener';
import {getFloatingButtonsBottom} from './useNativeTabBarOptions';
import WorkspacesTabPressListener from './WorkspacesTabPressListener';

type NativeTabLayoutProps = Parameters<NonNullable<NativeBottomTabNavigatorProps['layout']>>[0];

/** A tab's own navigation, which receives the tab's `tabPress` events. */
type NativeTabNavigation = NativeTabLayoutProps['descriptors'][string]['navigation'];

function NativeTabLayout({children, state, descriptors}: NativeTabLayoutProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const styles = useThemeStyles();
    const {bottom: bottomInset} = useSafeAreaInsets();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    // The buttons follow whatever the navigator decided for the bar itself.
    const shouldShowNativeTabBar = shouldUseNarrowLayout && !!activeRoute && descriptors[activeRoute.key]?.options.tabBarStyle?.display !== 'none';
    const getTabDescriptor = (routeName: string) => {
        const route = state.routes.find((tabRoute) => tabRoute.name === routeName);
        return route ? descriptors[route.key] : undefined;
    };
    const spendNavigation = getTabDescriptor(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)?.navigation;
    const spendOptions = getTabDescriptor(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)?.options;
    const workspacesNavigation = getTabDescriptor(NAVIGATORS.WORKSPACE_NAVIGATOR)?.navigation;

    if (!shouldUseNarrowLayout) {
        return (
            <View style={[styles.flex1, styles.flexRow]}>
                <TabNavigatorBar state={state} />
                <View style={styles.flex1}>{children}</View>
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            {children}
            {!!spendNavigation && (
                <SpendTabPressListener
                    navigation={spendNavigation}
                    isSwitchedByJS={spendOptions?.tabBarSelectionEnabled === false}
                />
            )}
            {!!workspacesNavigation && <WorkspacesTabPressListener navigation={workspacesNavigation} />}
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
        </View>
    );
}

export default NativeTabLayout;
export type {NativeTabLayoutProps, NativeTabNavigation};
