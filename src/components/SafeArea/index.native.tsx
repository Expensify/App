import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type SafeAreaProps from './types';

function SafeArea({children}: SafeAreaProps) {
    const styles = useThemeStyles();

    // Root screens pad the horizontal safe area themselves, so the native tab bar can sit in it.
    return <View style={styles.iPhoneXSafeArea}>{children}</View>;
}

export default SafeArea;
