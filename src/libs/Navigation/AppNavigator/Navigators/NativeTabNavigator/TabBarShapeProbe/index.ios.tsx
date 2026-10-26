import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import {useIsFocused} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import {SafeAreaListener} from 'react-native-safe-area-context';

import type TabBarShapeProbeProps from './types';

import TabBarShapeContext from './TabBarShapeContext';

/**
 * UIKit adds the area of the tab bar to the safe area of each tab screen, and a SafeAreaListener reports the insets of
 * the view it is in, unlike the app root's, which measures the window. A bar along the bottom adds its height to the
 * bottom inset; a bar laid out as a column sits in the side inset and adds nothing.
 */
function TabBarShapeProbe({isTabBarShown}: TabBarShapeProbeProps) {
    const styles = useThemeStyles();
    const setIsTabBarVertical = useContext(TabBarShapeContext);
    const {bottom: windowBottomInset} = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const [tabScreenInsetsReading, setTabScreenInsetsReading] = useState<{bottom: number; wasTabBarShown: boolean}>();

    useEffect(() => {
        // A hidden bar adds nothing to the safe area whatever its shape, so only a reading taken while the bar shows tells it.
        if (!isFocused || !isTabBarShown || !tabScreenInsetsReading?.wasTabBarShown) {
            return;
        }
        setIsTabBarVertical(tabScreenInsetsReading.bottom === windowBottomInset);
    }, [isFocused, isTabBarShown, setIsTabBarVertical, tabScreenInsetsReading?.wasTabBarShown, tabScreenInsetsReading?.bottom, windowBottomInset]);

    return (
        // The Android SafeAreaListener ignores pointerEvents, so the View is what lets touches through to the tab screen.
        <View
            style={styles.fullScreen}
            pointerEvents="none"
        >
            <SafeAreaListener onChange={({insets}) => setTabScreenInsetsReading({bottom: insets.bottom, wasTabBarShown: isTabBarShown})} />
        </View>
    );
}

export default TabBarShapeProbe;
