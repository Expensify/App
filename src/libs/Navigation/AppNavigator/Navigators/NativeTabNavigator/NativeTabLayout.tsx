import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import TabNavigatorBar from '@libs/Navigation/AppNavigator/Navigators/TabNavigatorBar';

import type {NativeBottomTabNavigatorProps} from '@react-navigation/bottom-tabs/unstable';

import React from 'react';
import {View} from 'react-native';

import NativeTabBarOverlay from './NativeTabBarOverlay';
import TabPressListeners from './TabPressListeners';

type NativeTabLayoutProps = Parameters<NonNullable<NativeBottomTabNavigatorProps['layout']>>[0];

function NativeTabLayout({children, state, descriptors}: NativeTabLayoutProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    // The tabs stay at the same place in the tree in both layouts, so crossing the breakpoint does not remount them.
    return (
        <View style={[styles.flex1, !shouldUseNarrowLayout && styles.flexRow]}>
            {!shouldUseNarrowLayout && <TabNavigatorBar state={state} />}
            <View style={styles.flex1}>{children}</View>
            <TabPressListeners
                state={state}
                descriptors={descriptors}
            />
            {shouldUseNarrowLayout && (
                <NativeTabBarOverlay
                    state={state}
                    descriptors={descriptors}
                />
            )}
        </View>
    );
}

export default NativeTabLayout;
export type {NativeTabLayoutProps};
