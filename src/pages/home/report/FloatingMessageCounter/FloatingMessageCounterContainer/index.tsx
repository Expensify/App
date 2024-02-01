import React from 'react';
import {Animated} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type FloatingMessageCounterContainerProps from './types';

function FloatingMessageCounterContainer({accessibilityHint, containerStyles, children}: FloatingMessageCounterContainerProps) {
    const styles = useThemeStyles();

    return (
        <Animated.View
            accessibilityHint={accessibilityHint}
            style={[styles.floatingMessageCounterWrapper, containerStyles]}
        >
            {children}
        </Animated.View>
    );
}

FloatingMessageCounterContainer.displayName = 'FloatingMessageCounterContainer';

export default FloatingMessageCounterContainer;
