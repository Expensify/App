import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import styles from '@styles/styles';
import SafeAreaProps from './types';

function SafeArea({children}: SafeAreaProps) {
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
