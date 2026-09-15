// Covered JS-stack screens remain visible, but must not expose native controls behind a modal.
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type StackScreenAccessibilityProps from './types';

function StackScreenAccessibility({isFocused, children}: StackScreenAccessibilityProps) {
    const styles = useThemeStyles();

    return (
        <View
            style={styles.flex1}
            collapsable={false}
            accessible={false}
            accessibilityElementsHidden={!isFocused}
            importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}
            pointerEvents={isFocused ? 'box-none' : 'none'}
        >
            {children}
        </View>
    );
}

export default StackScreenAccessibility;
