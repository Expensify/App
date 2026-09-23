import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

/**
 * Blurs whatever the floating tab bar covers, so the bar reads as a glass capsule the way UIKit draws it on iOS.
 * The web build gets the effect from the CSS backdrop filter, which react-native-web forwards and prefixes but
 * React Native's own style types do not carry.
 */
const backdropFilterStyle = {backdropFilter: `blur(${variables.floatingTabBarBlurRadius}px)`} as ViewStyle;

function TabBarBlur() {
    const styles = useThemeStyles();

    return <View style={[styles.navigationTabBarBlur, backdropFilterStyle]} />;
}

export default TabBarBlur;
