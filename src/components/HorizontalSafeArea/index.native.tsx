import useThemeStyles from '@hooks/useThemeStyles';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

/** Keeps a screen's content out of the horizontal safe area, which the app root leaves free for the native tab bar. */
function HorizontalSafeArea({children}: ChildrenProps) {
    const styles = useThemeStyles();

    return (
        <SafeAreaView
            style={styles.flex1}
            edges={['left', 'right']}
        >
            {children}
        </SafeAreaView>
    );
}

export default HorizontalSafeArea;
