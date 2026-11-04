import useThemeStyles from '@hooks/useThemeStyles';

import type {EdgeInsets} from 'react-native-safe-area-context';

import {useIsFocused} from '@react-navigation/native';
import React, {useContext} from 'react';
import {View} from 'react-native';
import {SafeAreaListener} from 'react-native-safe-area-context';

import type TabBarShapeProbeProps from './types';

import TabBarShapeContext from './TabBarShapeContext';

/**
 * A SafeAreaListener reports the insets of the view it is in, unlike the app root's, which measures the window, so the
 * tab screen's bottom inset tells whether the tab bar adds to it (see getIsTabBarVertical).
 */
function TabBarShapeProbe({isTabBarShown}: TabBarShapeProbeProps) {
    const styles = useThemeStyles();
    const setTabScreenBottomInset = useContext(TabBarShapeContext);
    const isFocused = useIsFocused();

    const recordTabScreenBottomInset = ({insets}: {insets: EdgeInsets}) => {
        // A hidden bar adds nothing to the safe area whatever its shape, so only a reading taken while the bar shows tells it.
        if (!isFocused || !isTabBarShown) {
            return;
        }
        setTabScreenBottomInset(insets.bottom);
    };

    return (
        // The Android SafeAreaListener ignores pointerEvents, so the View is what lets touches through to the tab screen.
        <View
            style={styles.fullScreen}
            pointerEvents="none"
        >
            <SafeAreaListener onChange={recordTabScreenBottomInset} />
        </View>
    );
}

export default TabBarShapeProbe;
