import React from 'react';
import {Animated, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type FloatingMessageCounterContainerProps from './types';

function FloatingMessageCounterContainer({containerStyles, children}: FloatingMessageCounterContainerProps) {
    const styles = useThemeStyles();

    return (
        <Animated.View style={[styles.floatingMessageCounterWrapperAndroid, containerStyles]}>
            <View style={styles.floatingMessageCounterSubWrapperAndroid}>{children}</View>
        </Animated.View>
    );
}

FloatingMessageCounterContainer.displayName = 'FloatingMessageCounterContainer';

export default FloatingMessageCounterContainer;
