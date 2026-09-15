import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type NavigationTabBarSurfaceProps from './types';

/**
 * Translucent stand-in for the liquid glass capsule, drawn wherever the native material is unavailable.
 */
function BaseNavigationTabBarSurface({children, style, testID}: NavigationTabBarSurfaceProps) {
    const styles = useThemeStyles();

    return (
        <View
            style={[style, styles.navigationTabBarFallbackSurface]}
            testID={testID}
        >
            {children}
        </View>
    );
}

export default BaseNavigationTabBarSurface;
