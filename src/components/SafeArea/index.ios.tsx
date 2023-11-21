import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import useThemeStyles from '@styles/useThemeStyles';
import SafeAreaProps from './types';

function SafeArea({children}: SafeAreaProps) {
    const styles = useThemeStyles();
    return (
        <SafeAreaView
            style={[styles.iPhoneXSafeArea]}
            edges={['left', 'right']}
        >
            {children}
        </SafeAreaView>
    );
}

SafeArea.displayName = 'SafeArea';

export default SafeArea;
